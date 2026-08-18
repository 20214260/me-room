import { createAnalyzeHandler } from "../_shared/analyzeHandler.ts";
import { selfTags } from "../_shared/traits.ts";

// 입력: { tagIds: string[3~5], answer?: string }
// 출력: Persona (type: "SELF") — 프론트 src/types/persona.ts와 동일 형태
Deno.serve(createAnalyzeHandler("SELF", selfTags));
