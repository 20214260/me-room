import { corsHeaders } from "./cors.ts";
import { Persona, PersonaType, TraitTag } from "./types.ts";
import { scoresFromTags } from "./scoring.ts";
import { generatePersonaCopy } from "./openai.ts";

type RequestBody = {
  tagIds: string[];
  answer?: string;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// analyze-self, analyze-ideal 두 함수가 그대로 재사용하는 핸들러입니다.
// type과 tagTable만 다르고 나머지 로직(검증 → 점수 계산 → AI 호출 →
// Persona 형태로 응답)은 완전히 동일합니다.
export function createAnalyzeHandler(type: PersonaType, tagTable: TraitTag[]) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const tagIds = Array.isArray(body.tagIds) ? body.tagIds : [];
    const answer = (body.answer ?? "").trim();

    // 프론트 self/form.tsx와 동일한 3~5개 제약을 서버에서도 검증합니다.
    if (tagIds.length < 3 || tagIds.length > 5) {
      return jsonResponse(
        { error: "tagIds must contain between 3 and 5 items" },
        400,
      );
    }

    const picked = tagTable.filter((tag) => tagIds.includes(tag.id));
    if (picked.length !== tagIds.length) {
      return jsonResponse({ error: "Unknown tagId included" }, 400);
    }

    const scores = scoresFromTags(picked);
    const labels = picked.map((tag) => tag.label);
    const keywords = [...labels];
    if (answer) keywords.unshift(answer.slice(0, 18));

    try {
      const { title, summary } = await generatePersonaCopy(
        type,
        labels,
        answer,
        scores,
      );

      const persona: Persona = {
        id: `${type.toLowerCase()}-${Date.now()}`,
        type,
        title,
        summary,
        keywords: keywords.slice(0, 4),
        scores,
      };

      return jsonResponse(persona);
    } catch (err) {
      console.error(`[${type}] OpenAI generation failed:`, err);
      return jsonResponse(
        { error: "Failed to generate persona. Please try again." },
        502,
      );
    }
  };
}
