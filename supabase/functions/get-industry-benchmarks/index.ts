
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, role } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch average scores for the industry and role
    const { data: assessmentResults, error: resultsError } = await supabase
      .from('skill_assessment_results')
      .select('score, skill_scores, assessment_id')
      .eq('assessment_id', await getAssessmentIdByRoleAndIndustry(supabase, role, industry))
      .limit(100);

    if (resultsError) throw resultsError;

    // Fetch skill benchmarks from dedicated table
    const { data: skillBenchmarkData, error: benchmarkError } = await supabase
      .from('skill_benchmarks')
      .select('skill_name, benchmark_score')
      .eq('role', role)
      .eq('industry', industry);

    if (benchmarkError) throw benchmarkError;

    // Calculate average score
    const totalScores = assessmentResults.length > 0 
      ? assessmentResults.reduce((acc, curr) => acc + curr.score, 0) 
      : 0;
    const averageScore = assessmentResults.length > 0 
      ? Math.round(totalScores / assessmentResults.length) 
      : 70; // Default fallback value

    // Convert skill benchmarks to expected format
    const skillBenchmarks = {};
    if (skillBenchmarkData && skillBenchmarkData.length > 0) {
      skillBenchmarkData.forEach(benchmark => {
        skillBenchmarks[benchmark.skill_name] = benchmark.benchmark_score;
      });
    } else {
      // Generate fallback benchmarks from assessment results
      const skillScoresMap = {};
      
      assessmentResults.forEach(result => {
        if (result.skill_scores) {
          Object.entries(result.skill_scores).forEach(([skill, data]) => {
            if (!skillScoresMap[skill]) {
              skillScoresMap[skill] = [];
            }
            skillScoresMap[skill].push(data.score);
          });
        }
      });
      
      // Calculate averages for each skill
      Object.entries(skillScoresMap).forEach(([skill, scores]) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        skillBenchmarks[skill] = Math.round(average);
      });
    }

    return new Response(
      JSON.stringify({
        benchmarks: [{
          industry,
          role,
          averageScore
        }],
        skillBenchmarks
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching benchmarks:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch benchmarks", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to get assessment ID by role and industry
async function getAssessmentIdByRoleAndIndustry(supabase, role, industry) {
  const { data, error } = await supabase
    .from('skill_assessments')
    .select('id')
    .eq('role', role)
    .eq('industry', industry)
    .limit(1)
    .single();

  if (error) {
    console.error("Error getting assessment ID:", error);
    return null;
  }

  return data?.id;
}
