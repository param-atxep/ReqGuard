export function calculateQualityScore(requirementCount: number, findings: Array<{ type: string }>) {
  const ambiguity = findings.filter((finding) => finding.type === "AMBIGUITY").length;
  const consistency = findings.filter((finding) => finding.type === "CONSISTENCY").length;
  const completeness = requirementCount ? 100 : 0;
  const clarity = Math.max(0, 100 - (ambiguity / Math.max(1, requirementCount)) * 100);
  const consistencyScore = Math.max(0, 100 - (consistency / Math.max(1, requirementCount)) * 100);
  const traceability = requirementCount ? 100 : 0;
  const testability = Math.max(0, 100 - (ambiguity / Math.max(1, requirementCount)) * 50);
  return Math.round(completeness * 0.25 + clarity * 0.2 + consistencyScore * 0.2 + traceability * 0.2 + testability * 0.15);
}
