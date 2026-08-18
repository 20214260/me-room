import { PersonaScores, PersonaType } from "./types.ts";

type PersonaCopy = { title: string; summary: string };

const typeContext: Record<PersonaType, string> = {
  SELF: "이 사람이 스스로 생각하는 지금의 자기 모습",
  IDEAL: "이 사람이 앞으로 되고 싶어하는 미래의 모습",
  MIRROR: "친구들이 보는 이 사람의 모습",
};

export async function generatePersonaCopy(
  type: PersonaType,
  labels: string[],
  answer: string,
  scores: PersonaScores,
): Promise<PersonaCopy> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const system =
    "너는 성향 분석 앱의 캐릭터 카피라이터야. " +
    "입력으로 받은 태그와 점수를 바탕으로 짧고 인상적인 한국어 캐릭터 칭호와 " +
    "2문장 설명을 만들어. 반드시 JSON만 응답하고 다른 텍스트는 절대 포함하지 마.";

  const user = `
[분석 대상] ${typeContext[type]}
[선택한 태그] ${labels.join(", ")}
[덧붙인 문장] ${answer || "(없음)"}
[6개 성향 점수 0~100]
- 관계 에너지: ${scores.socialEnergy}
- 감정 표현: ${scores.expression}
- 주도성: ${scores.initiative}
- 공감성: ${scores.empathy}
- 안정성: ${scores.stability}
- 실행력: ${scores.execution}

아래 JSON 형식으로만 응답해:
{"title": "네 단어 이하 캐릭터 칭호", "summary": "2문장, 80자 내외 설명"}
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response missing content");

  const parsed = JSON.parse(content) as PersonaCopy;
  if (!parsed.title || !parsed.summary) {
    throw new Error("OpenAI response missing title/summary");
  }
  return parsed;
}
