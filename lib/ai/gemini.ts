export async function analyzeWithGemini(text: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: `Analyze these software requirements and return a concise executive summary. Do not invent requirements.\n\n${text.slice(0, 100000)}` }] }] }),
  });
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || null;
}

export type AiAnalysis = {
  requirements: Array<{
    key: string; type: string; explanation: string; testability: string;
    rewrite: string | null; implementationNotes: string | null;
  }>;
  findings: Array<{
    requirementKey: string; relatedRequirementKey: string | null; category: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; confidence: number;
    title: string; description: string; whyItMatters: string; suggestedFix: string;
    testability: string; businessImpact: string | null;
  }>;
  executiveSummary: string; projectSummary: string; risks: string[];
  quality: { completeness: number; consistency: number; verifiability: number; security: number; performance: number; clarity: number; overall: number };
  testCases: Array<{ requirementKey: string; testId: string; preconditions: string; steps: string; expectedResult: string; priority: string }>;
};

export async function analyzeRequirementIntelligence(text: string): Promise<AiAnalysis | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `You are ReqGuard, a senior business analyst, QA architect, and solution architect. Analyze the SRS below. Return ONLY valid JSON matching this exact shape: {"requirements":[{"key":"FR-001","type":"Functional","explanation":"","testability":"Testable","rewrite":null,"implementationNotes":null}],"findings":[{"requirementKey":"FR-001","relatedRequirementKey":null,"category":"Ambiguity","severity":"MEDIUM","confidence":94,"title":"","description":"","whyItMatters":"","suggestedFix":"","testability":"Partially Testable","businessImpact":null}],"executiveSummary":"","projectSummary":"","risks":[],"quality":{"completeness":0,"consistency":0,"verifiability":0,"security":0,"performance":0,"clarity":0,"overall":0},"testCases":[{"requirementKey":"FR-001","testId":"TC-001","preconditions":"","steps":"","expectedResult":"","priority":"High"}]}. Identify every requirement, assign stable FR/NFR/BR/SEC/PERF/COMP/UI IDs, compare all requirements for contradictions and duplicates, assess security/performance gaps, create 3-10 test cases per requirement, and do not invent facts. Executive summary must be 250-500 words. Scores are 0-100. SRS:\\n${text.slice(0, 100000)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
  });
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!raw) return null;
  return JSON.parse(raw) as AiAnalysis;
}
