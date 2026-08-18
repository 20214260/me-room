import { createAnalyzeHandler } from "../_shared/analyzeHandler.ts";
import { idealTags } from "../_shared/traits.ts";

// 입력: { tagIds: string[3~5], answer?: string }
// 출력: Persona (type: "IDEAL") — analyze-self와 완전히 동일한 로직을
// tagTable만 바꿔서 재사용합니다.
Deno.serve(createAnalyzeHandler("IDEAL", idealTags));
