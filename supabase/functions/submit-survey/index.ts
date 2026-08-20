import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { analyzePersona, PersonaScores } from '../_shared/openai.ts';

const allowedTraits = [
  'socialEnergy',
  'expression',
  'initiative',
  'empathy',
  'stability',
  'execution',
] as const;

type Trait = typeof allowedTraits[number];

type Answer = {
  questionId: string;
  trait: Trait;
  value: number;
  label: string;
};

const expectedQuestions: Record<string, { trait: Trait; values: number[] }> = {
  q1: { trait: 'socialEnergy', values: [28, 48, 72, 90] },
  q2: { trait: 'expression', values: [24, 46, 68, 88] },
  q3: { trait: 'initiative', values: [30, 52, 76, 92] },
  q4: { trait: 'empathy', values: [42, 55, 78, 92] },
  q5: { trait: 'stability', values: [30, 52, 76, 90] },
  q6: { trait: 'execution', values: [34, 56, 78, 92] },
};

function isValidAnswer(value: any): value is Answer {
  if (!value || typeof value.questionId !== 'string') return false;

  const expected = expectedQuestions[value.questionId];
  return Boolean(
    expected
      && value.trait === expected.trait
      && typeof value.value === 'number'
      && expected.values.includes(value.value)
      && typeof value.label === 'string'
      && value.label.length <= 100,
  );
}

function averageScores(rows: any[]): PersonaScores {
  const values: Record<Trait, number[]> = {
    socialEnergy: [],
    expression: [],
    initiative: [],
    empathy: [],
    stability: [],
    execution: [],
  };

  for (const row of rows) {
    const items = Array.isArray(row?.answers?.items) ? row.answers.items : [];
    for (const item of items) {
      if (isValidAnswer(item)) values[item.trait].push(item.value);
    }
  }

  return Object.fromEntries(
    allowedTraits.map((trait) => {
      const bucket = values[trait];
      const score = bucket.length
        ? Math.round(bucket.reduce((sum, value) => sum + value, 0) / bucket.length)
        : 50;
      return [trait, score];
    }),
  ) as PersonaScores;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const answers = Array.isArray(body?.answers) ? body.answers : [];
    const comment = typeof body?.comment === 'string' ? body.comment.trim().slice(0, 120) : '';

    if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) {
      return Response.json({ error: 'Invalid survey token' }, { status: 400, headers: corsHeaders });
    }

    if (answers.length !== 6 || !answers.every(isValidAnswer)) {
      return Response.json({ error: 'All six answers are required' }, { status: 400, headers: corsHeaders });
    }

    const traits = new Set(answers.map((answer: Answer) => answer.trait));
    const questionIds = new Set(answers.map((answer: Answer) => answer.questionId));
    if (traits.size !== 6 || questionIds.size !== 6) {
      return Response.json({ error: 'Each survey question must be answered once' }, { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase environment is not configured');

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: survey, error: surveyError } = await admin
      .from('friend_surveys')
      .select('id,user_id,status,min_responses')
      .eq('token', token)
      .eq('status', 'active')
      .maybeSingle();

    if (surveyError) throw surveyError;
    if (!survey) {
      return Response.json({ error: 'Survey not found or closed' }, { status: 404, headers: corsHeaders });
    }

    const { error: insertError } = await admin
      .from('friend_responses')
      .insert({
        survey_id: survey.id,
        answers: { items: answers, comment },
      });

    if (insertError) throw insertError;

    const { data: responseRows, error: responsesError } = await admin
      .from('friend_responses')
      .select('answers,created_at')
      .eq('survey_id', survey.id)
      .order('created_at', { ascending: true });

    if (responsesError) throw responsesError;

    const responseCount = responseRows?.length ?? 0;
    const minResponses = survey.min_responses ?? 3;
    let aiUpdated = false;

    if (responseCount >= minResponses && Deno.env.get('OPENAI_API_KEY')) {
      try {
        const baselineScores = averageScores(responseRows ?? []);
        const compactResponses = (responseRows ?? []).map((row) => ({
          answers: row.answers?.items ?? [],
          comment: row.answers?.comment ?? '',
        }));

        const analysis = await analyzePersona({
          type: 'MIRROR',
          baselineScores,
          mirrorResponses: compactResponses,
        });

        const { error: personaError } = await admin
          .from('personas')
          .upsert({
            user_id: survey.user_id,
            type: 'MIRROR',
            title: analysis.title,
            summary: analysis.summary,
            keywords: analysis.keywords,
            scores: analysis.scores,
          }, { onConflict: 'user_id,type' });

        if (personaError) throw personaError;
        aiUpdated = true;
      } catch (aiError) {
        // DB trigger already produced/updated a deterministic MIRROR.
        // Keep the survey submission successful even when AI is temporarily unavailable.
        console.error('MIRROR AI refresh failed; deterministic fallback kept', aiError);
      }
    }

    return Response.json(
      {
        ok: true,
        responseCount,
        mirrorReady: responseCount >= minResponses,
        aiUpdated,
      },
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('submit-survey error', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Survey submission failed' },
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
