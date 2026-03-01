import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateStepsRequest {
  course_id: string;
  module_id: string;
}

// In-memory lock to prevent duplicate simultaneous generation within the same Edge runtime
const generationLocks = new Map<string, Promise<any>>();

function inferSubjectType(topic: string, context: string): 'humanities' | 'technical' | 'business' {
  const text = (topic + ' ' + context).toLowerCase();
  const technical = ['python', 'javascript', 'typescript', 'excel', 'sql', 'code', 'programming', 'data', 'algorithm', 'machine learning', 'software', 'html', 'css', 'react', 'database', 'api', 'cloud', 'cybersecurity', 'networking'];
  const business = ['marketing', 'economics', 'finance', 'entrepreneur', 'management', 'strategy', 'accounting', 'startup', 'investment', 'sales', 'branding', 'leadership', 'operations', 'supply chain'];
  if (technical.some(k => text.includes(k))) return 'technical';
  if (business.some(k => text.includes(k))) return 'business';
  return 'humanities';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with service role key to bypass RLS for reliable step checking
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Still verify the user is authenticated
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { course_id, module_id }: GenerateStepsRequest = await req.json();

    if (!course_id || !module_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: course_id, module_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In-memory lock: if the same runtime is already generating for this module, piggyback on that promise
    if (generationLocks.has(module_id)) {
      console.log('⏳ Same-instance generation in progress for module:', module_id, '- waiting...');
      try {
        const result = await generationLocks.get(module_id);
        return new Response(
          JSON.stringify(result),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Piggybacked generation failed, will check DB:', error);
      }
    }

    // Check if steps already exist for this module
    console.log('Checking for existing steps for module:', module_id);
    
    const { data: existingSteps, error: checkError } = await supabase
      .from('module_steps')
      .select('*')
      .eq('module_id', module_id)
      .order('step_index', { ascending: true });

    if (checkError) {
      console.error('Error checking for existing steps:', checkError);
    }

    if (existingSteps && existingSteps.length > 0) {
      console.log('✅ Returning', existingSteps.length, 'cached steps for module:', module_id);
      return new Response(
        JSON.stringify({ success: true, steps: existingSteps, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('No existing steps found for module:', module_id, '- generating...');

    // Create a promise for the generation and store it in the in-memory lock
    const generationPromise = (async () => {
      try {
    // Fetch course and module details
    const { data: course, error: courseError } = await supabase
      .from('generated_courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
          throw new Error('Course not found');
    }

    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', module_id)
      .single();

    if (moduleError || !module) {
          throw new Error('Module not found');
    }

    console.log('Generating steps for module:', module.title);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build the prompt for step generation
    const checkpointType = module.checkpoints_schema?.type || 'quiz';

    // Documentary mode: detect subject type and build style injection
    const isDocumentary = course.format_preferences?.documentary === true;
    const subjectType = isDocumentary
      ? inferSubjectType(course.topic, course.context_summary || course.description || '')
      : null;

    const documentaryBlock = isDocumentary ? `
DOCUMENTARY MODE — ACTIVE:
The first slide of each teach step must open with 2–4 sentences of cinematic contextual framing before transitioning into instruction. The narrative opener sets the scene: name the era, the place, the forces at play, or the moment of discovery. No invented dialogue. No fabricated details. Factually grounded at all times.
${subjectType === 'humanities' ? 'SUBJECT TYPE — HUMANITIES: Use historical anchors — dates, geography, named figures, social tensions. Ground the reader in time and place before explaining ideas.' : ''}${subjectType === 'technical' ? 'SUBJECT TYPE — TECHNICAL: Keep the narrative opener brief (2–3 sentences max). Immediately transition into clear, procedural, actionable instruction. Avoid dramatic language.' : ''}${subjectType === 'business' ? 'SUBJECT TYPE — BUSINESS: Frame through transformation, market shift, or strategic decision. Balance narrative with practical application and real-world consequences.' : ''}
Rules: Never say "everything changed forever." No romanticisation. Restrained, intelligent tone. Narrative framing must enhance understanding — never distract from it.
` : '';

    const prompt = `You are a master educator writing rich, narrative course content. Your slides must read like a knowledgeable professor explaining ideas to a curious, engaged student — not like a summary or bullet-point outline.

EXAMPLE OF EXCELLENT SLIDE CONTENT (model every slide after this standard):
Title: "Judea Under Roman Rule"
Content: "In the first century CE, the region of Judea was under the authority of the Roman Empire. Rome governed through local rulers — such as Herod the Great and later Roman prefects like Pontius Pilate — while maintaining military presence to suppress unrest. The Jewish people lived with strong expectations of divine intervention. Many believed God would send a Messiah, a deliverer who would restore Israel's independence and fulfill covenant promises. This tension — imperial domination and religious expectation — formed the backdrop for the emergence of Christianity."
Notice: specific names and dates, developed narrative paragraphs, a named tension or conflict, a closing synthesis that explains the "so what." Every slide content field must reach this depth.
${documentaryBlock}
Course Topic: ${course.topic}
Course Level: ${course.level}
Course Context: ${course.context_summary || course.description}

Module: ${module.title}
Module Summary: ${module.summary}
Estimated Duration: ${module.estimated_minutes} minutes

Create 6 learning steps following this sequence:
1. TEACH step - Comprehensive introduction with 4 slides (each slide focuses on one concept)
2. PROMPT step - Interactive question to check understanding
3. TEACH step - Deeper exploration with 4 slides (advanced concepts, applications, examples)
4. QUIZ step - 3 multiple choice questions
5. PROMPT step - Scenario-based application question
6. CHECKPOINT step - ${checkpointType === 'quiz' ? '5 assessment questions' : 'Written reflection prompt'}

Generate JSON with this structure:
{
  "steps": [
    {
      "step_index": 0,
      "step_type": "teach",
      "title": "Introduction to [Topic]",
      "content": {
        "slides": [
          {
            "title": "Setting the Scene",
            "content": "Write 150-200 words of flowing narrative prose. Name specific people, places, dates, and forces at work. Open with the defining tension or question of this topic. Explain WHY it matters. Close with a synthesis sentence that bridges to what comes next. Do NOT write a summary — write an explanation.",
            "keyPoints": [
              "Specific key insight with a named example or figure",
              "The central tension or dynamic with concrete detail",
              "Why this matters: a real consequence or implication"
            ]
          },
          {
            "title": "Core Concept: [Name It]",
            "content": "Write 150-200 words of narrative prose. Define the core concept precisely, then explain it through a concrete example or historical moment. Describe how it works in practice, who is involved, and what its effects are. End with a clear statement of its significance.",
            "keyPoints": [
              "The precise definition with a clarifying distinction",
              "A named example that illustrates the concept in action",
              "The broader implication or consequence"
            ]
          },
          {
            "title": "How It Works in Practice",
            "content": "Write 150-200 words of narrative prose. Walk through a real or representative example step by step. Use specific names, numbers, or events. Describe cause and effect. Show what happens when this concept plays out in the real world.",
            "keyPoints": [
              "Step 1 or factor 1 with specific detail",
              "Step 2 or factor 2 with specific detail",
              "The outcome or result and what it reveals"
            ]
          },
          {
            "title": "Key Takeaways & What to Watch For",
            "content": "Write 150-200 words of narrative prose. Synthesize the most important insights from this lesson. Explain the common misconceptions students have. Then name the key things to watch for — the signs, patterns, or questions that reveal real understanding of this topic.",
            "keyPoints": [
              "The most important insight and why it is often misunderstood",
              "A common mistake or misconception to avoid",
              "The question or pattern that distinguishes surface understanding from real mastery"
            ]
          }
        ]
      }
    },
    {
      "step_index": 1,
      "step_type": "prompt",
      "title": "Check Your Understanding",
      "content": {
        "slides": null,
        "question": "Interactive question...",
        "expectedResponse": "What a good answer would include...",
        "hints": ["Hint 1", "Hint 2"],
        "questions": null,
        "instructions": null,
        "submissionType": null,
        "reflectionPrompts": null
      },
      "rubric": null
    },
    {
      "step_index": 2,
      "step_type": "teach",
      "title": "Advanced Concepts",
      "content": {
        "slides": [
          {
            "title": "Building on What You Know",
            "content": "Write 150-200 words of narrative prose. Begin by naming exactly what was established in the first lesson, then introduce the complication, nuance, or deeper layer. Explain what changes when you look more closely — what was missing from the simpler view?",
            "keyPoints": [
              "The connection to what was already taught",
              "The new complexity or nuance being introduced",
              "Why this deeper layer matters"
            ]
          },
          {
            "title": "Deeper Dive: [Specific Aspect]",
            "content": "Write 150-200 words of narrative prose. Go deep on one advanced aspect of this topic. Use a specific example, case, or scenario to ground the explanation. Address the edge cases, exceptions, or debates that exist in this area.",
            "keyPoints": [
              "The advanced aspect explained precisely",
              "A named exception or edge case",
              "How experts or practitioners think about this"
            ]
          },
          {
            "title": "Real-World Application",
            "content": "Write 150-200 words of narrative prose. Describe a real or realistic scenario where this knowledge is applied. Walk through who makes what decision, what information they use, and what the stakes are. Make the abstract concrete.",
            "keyPoints": [
              "The scenario and the key actors or decision-makers",
              "How the concepts from this module directly apply",
              "What good judgment or expertise looks like here"
            ]
          },
          {
            "title": "Synthesis & Mastery",
            "content": "Write 150-200 words of narrative prose. Bring together all the major threads of this module into a coherent picture. Explain how the pieces relate to each other. Name what a true expert would know that a novice would not. Point to what comes next in this subject.",
            "keyPoints": [
              "The central insight that ties the module together",
              "What distinguishes novice from expert understanding",
              "The open questions or next steps in this field"
            ]
          }
        ],
        "question": null,
        "expectedResponse": null,
        "hints": null,
        "questions": null,
        "instructions": null,
        "submissionType": null,
        "reflectionPrompts": null
      },
      "rubric": null
    },
    {
      "step_index": 3,
      "step_type": "quiz",
      "title": "Knowledge Check",
      "content": {
        "slides": null,
        "question": null,
        "expectedResponse": null,
        "hints": null,
        "questions": [
          {
            "id": "q1",
            "question": "Question text?",
            "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
            "correctAnswer": "A",
            "explanation": "Clear explanation of why A is correct and why other options are wrong",
            "points": 1
          }
        ],
        "instructions": null,
        "submissionType": null,
        "reflectionPrompts": null
      },
      "rubric": null
    },
    {
      "step_index": 4,
      "step_type": "prompt",
      "title": "Apply Your Knowledge",
      "content": {
        "question": "Scenario-based question...",
        "expectedResponse": "What a good answer includes...",
        "hints": ["Think about...", "Consider..."]
      }
    },
    {
      "step_index": 5,
      "step_type": "checkpoint",
      "title": "Module Assessment",
      "content": {
        ${checkpointType === 'quiz' ? `
        "instructions": "Complete this assessment to finish the module.",
        "submissionType": "choice",
        "questions": [
          {
            "id": "cp1",
            "question": "Assessment question?",
            "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
            "correctAnswer": "B",
            "explanation": "Explanation...",
            "points": 2
          }
        ]` : `
        "instructions": "Reflect on what you've learned in this module.",
        "submissionType": "text",
        "reflectionPrompts": [
          "What was the most important concept you learned?",
          "How might you apply this knowledge?",
          "What questions do you still have?"
        ]`}
      },
      "rubric": [
        {
          "criterion": "Understanding",
          "weight": 40,
          "levels": {
            "excellent": "Demonstrates deep understanding",
            "good": "Shows solid comprehension",
            "satisfactory": "Basic understanding shown",
            "needsImprovement": "Needs more review"
          }
        },
        {
          "criterion": "Application",
          "weight": 30,
          "levels": {
            "excellent": "Excellent practical application",
            "good": "Good application of concepts",
            "satisfactory": "Some application shown",
            "needsImprovement": "Limited application"
          }
        },
        {
          "criterion": "Completeness",
          "weight": 30,
          "levels": {
            "excellent": "Thorough and complete",
            "good": "Mostly complete",
            "satisfactory": "Partially complete",
            "needsImprovement": "Incomplete"
          }
        }
      ]
    }
  ]
}

WRITING RULES FOR TEACH SLIDE CONTENT (non-negotiable):
- Write 150-200 words of NARRATIVE PROSE per slide — never a summary, never a list dressed as prose
- Name specific people, places, events, dates, and forces. Vague generalities are not acceptable.
- Each slide must have a clear arc: establish context → develop the idea → close with a synthesis or implication
- Use precise language. If discussing history: name the rulers, empires, and dates. If discussing science: name the mechanism. If discussing business: name the companies or markets.
- keyPoints must be substantive sentences with concrete detail, not vague labels like "Important concept 1"
- Slide titles should name the specific concept, not use generic placeholders (e.g., "Judea Under Roman Rule", not "Historical Context")
- First teach step: grounds the learner in the foundational facts, tensions, and context
- Second teach step: advances into nuance, application, and synthesis


Guidelines for interactive elements:
- PROMPT questions should be thought-provoking and require synthesis of taught material, not mere recall
- QUIZ questions MUST have clear correct answers with detailed explanations
- QUIZ questions MUST include points (typically 1 point each)
- Explanations should explain why the correct answer is right AND why others are wrong
- CHECKPOINT should comprehensively assess key module concepts
- All content appropriate for ${course.level} level
- No job guarantees or certification language

CRITICAL: Set unused content fields to null based on step type:
- TEACH steps: Set question, expectedResponse, hints, questions, instructions, submissionType, reflectionPrompts to null. Set rubric to null.
- PROMPT steps: Set slides, questions, instructions, submissionType, reflectionPrompts to null. Set rubric to null.
- QUIZ steps: Set slides, question, expectedResponse, hints, instructions, submissionType, reflectionPrompts to null. Set rubric to null.
- CHECKPOINT steps: Set slides, question, expectedResponse, hints to null. Use either questions OR reflectionPrompts (set the other to null). Include rubric array.
- REFLECTION steps: Set slides, question, expectedResponse, hints, questions, instructions, submissionType to null. Set rubric to null.

IMPORTANT: The TEACH steps are the foundation of learning. A student reading only the slides must come away with enough understanding to answer all subsequent prompts, quizzes, and the checkpoint without needing outside resources. Thin, vague, or generic content is a failure.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a master educator and instructional designer. You write course content with the depth, specificity, and narrative quality of an expert professor. Your slide prose is rich, substantive, and grounded in concrete detail — never generic or vague. You follow the provided JSON schema exactly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 6000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "module_steps",
            strict: true,
            schema: {
              type: "object",
              properties: {
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      step_index: { type: "integer" },
                      step_type: {
                        type: "string",
                        enum: ["teach", "prompt", "quiz", "checkpoint", "reflection"]
                      },
                      title: { type: "string" },
                      content: {
                        type: "object",
                        properties: {
                          slides: {
                            type: ["array", "null"],
                            items: {
                              type: "object",
                              properties: {
                                title: { type: "string" },
                                content: { type: "string" },
                                keyPoints: {
                                  type: "array",
                                  items: { type: "string" }
                                },
                              },
                              required: ["title", "content", "keyPoints"],
                              additionalProperties: false
                            }
                          },
                          question: { type: ["string", "null"] },
                          expectedResponse: { type: ["string", "null"] },
                          hints: {
                            type: ["array", "null"],
                            items: { type: "string" }
                          },
                          questions: {
                            type: ["array", "null"],
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                question: { type: "string" },
                                options: {
                                  type: "object",
                                  properties: {
                                    A: { type: "string" },
                                    B: { type: "string" },
                                    C: { type: "string" },
                                    D: { type: "string" }
                                  },
                                  required: ["A", "B", "C", "D"],
                                  additionalProperties: false
                                },
                                correctAnswer: {
                                  type: "string",
                                  enum: ["A", "B", "C", "D"]
                                },
                                explanation: { type: "string" },
                                points: { type: "integer" }
                              },
                              required: ["id", "question", "options", "correctAnswer", "explanation", "points"],
                              additionalProperties: false
                            }
                          },
                          instructions: { type: ["string", "null"] },
                          submissionType: {
                            type: ["string", "null"],
                            enum: ["text", "choice", "file", null]
                          },
                          reflectionPrompts: {
                            type: ["array", "null"],
                            items: { type: "string" }
                          }
                        },
                        required: [
                          "slides",
                          "question", 
                          "expectedResponse",
                          "hints",
                          "questions",
                          "instructions",
                          "submissionType",
                          "reflectionPrompts"
                        ],
                        additionalProperties: false
                      },
                      rubric: {
                        type: ["array", "null"],
                        items: {
                          type: "object",
                          properties: {
                            criterion: { type: "string" },
                            weight: { type: "integer" },
                            levels: {
                              type: "object",
                              properties: {
                                excellent: { type: "string" },
                                good: { type: "string" },
                                satisfactory: { type: "string" },
                                needsImprovement: { type: "string" }
                              },
                              required: ["excellent", "good", "satisfactory", "needsImprovement"],
                              additionalProperties: false
                            }
                          },
                          required: ["criterion", "weight", "levels"],
                          additionalProperties: false
                        }
                      }
                    },
                    required: ["step_index", "step_type", "title", "content", "rubric"],
                    additionalProperties: false
                  }
                }
              },
              required: ["steps"],
              additionalProperties: false
            }
          }
        }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to generate steps');
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Parse the generated content (no fence stripping needed with structured output)
    let stepsData;
    try {
      stepsData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse generated steps:', parseError);
      throw new Error('Failed to parse generated content');
    }

    // Validate the structure
    if (!stepsData?.steps || !Array.isArray(stepsData.steps) || stepsData.steps.length !== 6) {
      console.error('Invalid steps structure:', stepsData);
      throw new Error('Generated content does not match expected structure');
    }

    // Normalize/validate generated steps to match UI + evaluator expectations:
    // - Ensure quiz step has exactly 3 questions (slice extras)
    // - Ensure checkpoint quiz uses configured questionCount (default 5)
    // - Ensure all question IDs are present + unique within the step
    try {
      const checkpointQuestionCount =
        (module.checkpoints_schema?.questionCount && Number(module.checkpoints_schema.questionCount)) || 5;

      if (stepsData?.steps && Array.isArray(stepsData.steps)) {
        stepsData.steps = stepsData.steps.map((s: any) => {
          if (!s?.content) return s;

          const isQuiz = s.step_type === 'quiz';
          const isCheckpointQuiz =
            s.step_type === 'checkpoint' && (module.checkpoints_schema?.type || 'quiz') === 'quiz';

          if ((isQuiz || isCheckpointQuiz) && Array.isArray(s.content.questions)) {
            // Enforce question count
            const expectedCount = isQuiz ? 3 : checkpointQuestionCount;
            if (s.content.questions.length > expectedCount) {
              s.content.questions = s.content.questions.slice(0, expectedCount);
            }

            // Ensure unique IDs
            const used = new Set<string>();
            s.content.questions = s.content.questions.map((q: any, idx: number) => {
              const baseId = typeof q?.id === 'string' && q.id.trim().length > 0
                ? q.id.trim()
                : `q${s.step_index}_${idx + 1}`;

              let id = baseId;
              let n = 2;
              while (used.has(id)) {
                id = `${baseId}_${n}`;
                n++;
              }
              used.add(id);

              return { ...q, id };
            });
          }

          return s;
        });
      }
    } catch (normalizeErr) {
      console.error('Failed to normalize generated steps:', normalizeErr);
      // Non-fatal; continue with best-effort content
    }

    // Insert steps into database
    const stepsToInsert = stepsData.steps.map((step: any) => ({
      module_id,
      step_index: step.step_index,
      step_type: step.step_type,
      title: step.title,
      content: step.content,
      rubric: step.rubric || null,
      is_completed: false
    }));

    // Idempotent write: ignore duplicates if another request raced us, then re-select authoritative steps
    const { error: upsertError } = await supabase
      .from('module_steps')
      .upsert(stepsToInsert, { onConflict: 'module_id,step_index', ignoreDuplicates: true });

    if (upsertError) {
      console.error('Error upserting steps:', upsertError);
      throw new Error(upsertError.message || 'Failed to save steps');
    }

    const { data: finalSteps, error: fetchFinalError } = await supabase
      .from('module_steps')
      .select('*')
      .eq('module_id', module_id)
      .order('step_index', { ascending: true });

    if (fetchFinalError || !finalSteps || finalSteps.length === 0) {
      throw new Error(fetchFinalError?.message || 'Failed to retrieve steps after generation');
    }

    console.log('Created/loaded steps:', finalSteps.length);
    return { success: true, steps: finalSteps, cached: false };

      } catch (error) {
        console.error('Error in generation:', error);
        throw error;
      }
    })();

    // Store the promise in the in-memory lock so duplicate same-instance requests can piggyback
    generationLocks.set(module_id, generationPromise);

    try {
      const result = await generationPromise;
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      generationLocks.delete(module_id);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
