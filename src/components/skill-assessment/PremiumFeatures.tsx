
interface AdvancedAnalysisSectionProps {
  userTier?: string;
  skills?: { name: string; score: number }[];
  recommendations?: string[];
  skillBenchmarks?: Record<string, number>;
}
