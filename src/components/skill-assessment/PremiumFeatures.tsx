
interface AdvancedAnalysisSectionProps {
  userTier?: string;
  skills?: { name: string; score: number }[];
  recommendations?: string[];
  skillBenchmarks?: Record<string, number>;
}

export const AdvancedAnalysisSection = ({ 
  userTier, 
  skills = [], 
  recommendations = [],
  skillBenchmarks = {}
}: AdvancedAnalysisSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Skills Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-3">Skills Analysis</h3>
        {skills.length > 0 ? (
          <div className="space-y-3">
            {skills.map(skill => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-sm">{skill.score}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${skill.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No skills data available</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-3">Recommendations</h3>
        {recommendations.length > 0 ? (
          <ul className="space-y-2 pl-5 list-disc">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm">{recommendation}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recommendations available</p>
        )}
      </div>
    </div>
  );
};
