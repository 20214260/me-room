import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { analyzeDaily, analyzePersona } from '../_shared/openai.ts';

type InitialBody = {
  mode: 'initial';
  type: 'SELF' | 'IDEAL';
  tags: string[];
  text: string;
  baselineScores: Record<string, number>;
};

type DailyBody = {
  mode: 'daily';
  currentPersona: any;
  text: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) throw new Error('Supabase environment is not configured');

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
    }

    const body = await req.json() as InitialBody | DailyBody;

    if (body.mode === 'initial') {
      if (!['SELF', 'IDEAL'].includes(body.type)) {
        return Response.json({ error: 'Invalid persona type' }, { status: 400, headers: corsHeaders });
      }

      const analysis = await analyzePersona({
        type: body.type,
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 5) : [],
        freeText: typeof body.text === 'string' ? body.text.slice(0, 500) : '',
        baselineScores: body.baselineScores as any,
      });

      return Response.json({ analysis }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (body.mode === 'daily') {
      if (!body.currentPersona || typeof body.text !== 'string' || body.text.trim().length < 2) {
        return Response.json({ error: 'Invalid daily input' }, { status: 400, headers: corsHeaders });
      }

      const analysis = await analyzeDaily({
        currentPersona: body.currentPersona,
        text: body.text.trim().slice(0, 500),
      });

      return Response.json({ analysis }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return Response.json({ error: 'Unsupported mode' }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error('analyze-persona error', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
