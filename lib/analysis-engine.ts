import { categorizeRequirement } from "./ai/parser";

type RequirementInput = { key: string; text: string };
export type FindingResult = {
  requirementId: string;
  relatedRequirementId?: string;
  type: "DUPLICATE" | "AMBIGUITY" | "CONFLICT" | "CONSISTENCY";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  title: string;
  description: string;
  suggestion: string;
};

export { categorizeRequirement };

const vagueTerms = /\b(fast|quickly|easy|user[- ]friendly|soon|appropriate|sufficient|large|small|minimal|max(?:imum)? performance|etc\.?)\b/i;
const negation = /\b(not|never|must not|shall not|cannot|can't|without)\b/i;
const numberPattern = /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|seconds?|minutes?|hours?|%|percent|gb|mb)?\b/i;

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function similarity(left: string, right: string) {
  const a = new Set(normalize(left).split(" ").filter(Boolean));
  const b = new Set(normalize(right).split(" ").filter(Boolean));
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.max(1, new Set([...a, ...b]).size);
}

export function extractRequirements(text: string): RequirementInput[] {
  const requirementStart = /^(?:REQ[-_ ]?\d{1,5}\s*[:.)-]\s*)?(?:the system|users?|administrators?|customers?|applications?|managers?|the platform|the service)\s+(?:shall|must|should|will|can|may)\b/i;
  const lines = text.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean);
  const requirements: RequirementInput[] = [];
  for (const line of lines) {
    const match = line.match(/^((?:REQ[-_ ]?)?\d{1,5})\s*[:.)-]\s*(.+)$/i);
    const statement = match?.[2]?.trim() || line;
    if (requirementStart.test(line) || (match && requirementStart.test(statement)) || (!match && line.length >= 12 && !/^(?:introduction|scope|overview|requirements?|notes?|appendix)\b/i.test(line))) {
      requirements.push({ key: `REQ-${String(requirements.length + 1).padStart(3, "0")}`, text: statement });
    }
  }
  return requirements;
}

export function analyzeRequirements(requirements: Array<RequirementInput & { id: string }>): FindingResult[] {
  const findings: FindingResult[] = [];
  for (const requirement of requirements) {
    if (vagueTerms.test(requirement.text)) {
      findings.push({
        requirementId: requirement.id,
        type: "AMBIGUITY",
        severity: "MEDIUM",
        confidence: 0.93,
        title: "Vague or non-measurable wording",
        description: `“${requirement.text}” contains wording that different reviewers may interpret differently.`,
        suggestion: "Replace the vague term with a measurable threshold and define the conditions under which it applies.",
      });
    }
    if (!/\b(shall|must|should|will|can)\b/i.test(requirement.text)) {
      findings.push({
        requirementId: requirement.id,
        type: "CONSISTENCY",
        severity: "LOW",
        confidence: 0.82,
        title: "Requirement lacks a normative verb",
        description: "The statement does not clearly express an expected system behavior or constraint.",
        suggestion: "State the actor, required behavior, object, and acceptance condition using a normative verb such as “shall”.",
      });
    }
  }

  for (let index = 0; index < requirements.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < requirements.length; otherIndex += 1) {
      const left = requirements[index];
      const right = requirements[otherIndex];
      const score = similarity(left.text, right.text);
      if (normalize(left.text) === normalize(right.text) || score >= 0.9) {
        findings.push({
          requirementId: left.id,
          relatedRequirementId: right.id,
          type: "DUPLICATE",
          severity: "MEDIUM",
          confidence: Math.min(0.99, Math.max(0.8, score)),
          title: "Duplicate or highly similar requirement",
          description: `${left.key} and ${right.key} express substantially the same requirement.`,
          suggestion: "Keep one canonical requirement and remove or link the duplicate.",
        });
      }
      const leftSubject = normalize(left.text).split(" ").slice(0, 5).join(" ");
      const rightSubject = normalize(right.text).split(" ").slice(0, 5).join(" ");
      const sameSubject = leftSubject === rightSubject || (leftSubject.includes(rightSubject) && rightSubject.length > 12) || (rightSubject.includes(leftSubject) && leftSubject.length > 12);
      const numericMismatch = numberPattern.test(left.text) && numberPattern.test(right.text) && left.text.match(numberPattern)?.[0] !== right.text.match(numberPattern)?.[0];
      if (sameSubject && (negation.test(left.text) !== negation.test(right.text) || numericMismatch)) {
        findings.push({
          requirementId: left.id,
          relatedRequirementId: right.id,
          type: "CONFLICT",
          severity: "HIGH",
          confidence: 0.84,
          title: "Potentially conflicting requirements",
          description: `${left.key} and ${right.key} appear to apply to the same subject but specify incompatible constraints.`,
          suggestion: "Confirm the intended business rule and consolidate both statements into one unambiguous requirement.",
        });
      }
    }
  }
  const terminology = new Map<string, string[]>([
    ["login", ["sign in", "authenticate"]],
    ["customer", ["client", "user"]],
  ]);
  for (const [canonical, alternatives] of terminology) {
    const canonicalRequirements = requirements.filter((item) => normalize(item.text).includes(canonical));
    const alternativeRequirements = requirements.filter((item) => alternatives.some((term) => normalize(item.text).includes(term)));
    if (canonicalRequirements.length && alternativeRequirements.length) {
      findings.push({
        requirementId: canonicalRequirements[0].id,
        relatedRequirementId: alternativeRequirements[0].id,
        type: "CONSISTENCY",
        severity: "LOW",
        confidence: 0.86,
        title: "Terminology varies across requirements",
        description: `The document uses “${canonical}” and an alternate term for the same concept.`,
        suggestion: `Choose one canonical term, such as “${canonical}”, and use it consistently.`,
      });
    }
  }
  return findings;
}
