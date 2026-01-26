# Slide-Based Learning Feature - Complete Technical Documentation

## Overview
This document contains all the relevant code for the slide-based learning feature implemented in the Tuterra AI Courses system. The feature transforms traditional single-page TEACH steps into interactive, slide-based presentations that ensure comprehensive learning before proceeding to assessments.

## Table of Contents
1. [Type Definitions](#type-definitions)
2. [AI Content Generation](#ai-content-generation)
3. [Frontend Components](#frontend-components)
4. [Hooks and State Management](#hooks-and-state-management)
5. [Evaluation System](#evaluation-system)
6. [Complete Flow Diagram](#complete-flow-diagram)

---

## Type Definitions

### Core Types (`src/types/course-engine.ts`)

```typescript
// New slide structure for TEACH steps
export interface ContentSlide {
  title: string;
  content: string;
  keyPoints?: string[];
  visualHint?: string; // Suggestion for what visual/diagram would help
}

export interface StepContent {
  // For 'teach' type - NEW: slide-based content
  text?: string; // Legacy format (backward compatibility)
  keyPoints?: string[]; // Legacy format
  slides?: ContentSlide[]; // NEW: slide-based content for teach steps
  
  // For 'prompt' type
  question?: string;
  expectedResponse?: string;
  hints?: string[];
  
  // For 'quiz' type
  questions?: QuizQuestion[];
  
  // For 'checkpoint' type
  instructions?: string;
  submissionType?: 'text' | 'choice' | 'file';
  
  // For 'reflection' type
  reflectionPrompts?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  points?: number;
}

export interface ModuleStep {
  id: string;
  module_id: string;
  step_index: number;
  step_type: StepType;
  title?: string;
  content: StepContent;
  rubric?: RubricItem[];
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export type StepType = 'teach' | 'prompt' | 'quiz' | 'checkpoint' | 'reflection';
```

---

## AI Content Generation

### Edge Function (`supabase/functions/generate-module-steps/index.ts`)

```typescript
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication and setup code...
    const { course_id, module_id }: GenerateStepsRequest = await req.json();

    // Check for existing steps
    const { data: existingSteps } = await supabase
      .from('module_steps')
      .select('*')
      .eq('module_id', module_id)
      .order('step_index', { ascending: true });

    if (existingSteps && existingSteps.length > 0) {
      return new Response(
        JSON.stringify({ success: true, steps: existingSteps, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch course and module details
    const { data: course } = await supabase
      .from('generated_courses')
      .select('*')
      .eq('id', course_id)
      .single();

    const { data: module } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', module_id)
      .single();

    const checkpointType = module.checkpoints_schema?.type || 'quiz';
    
    // AI PROMPT FOR SLIDE-BASED CONTENT GENERATION
    const prompt = `You are an expert instructional designer. Create learning steps for a course module.

Course Topic: ${course.topic}
Course Level: ${course.level}
Course Context: ${course.context_summary || course.description}

Module: ${module.title}
Module Summary: ${module.summary}
Estimated Duration: ${module.estimated_minutes} minutes

Create 6 learning steps following this sequence:
1. TEACH step - Comprehensive introduction with 3-4 slides (each slide focuses on one concept)
2. PROMPT step - Interactive question to check understanding
3. TEACH step - Deeper exploration with 3-4 slides (advanced concepts, applications, examples)
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
            "title": "Welcome & Overview",
            "content": "Engaging introduction paragraph that sets context and explains why this topic matters. Include a hook, real-world relevance, and what learners will gain. 2-3 substantial paragraphs (150-200 words).",
            "keyPoints": [
              "Key concept 1 with clear explanation",
              "Important detail 2 with context",
              "Practical insight 3"
            ],
            "visualHint": "Suggest a diagram, chart, or visual that would help (e.g., 'A flowchart showing the process', 'Timeline of events')"
          },
          {
            "title": "Core Concept",
            "content": "Deep dive into the main concept. Explain it clearly with definitions, examples, and analogies. Break down complex ideas into digestible parts. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Fundamental principle 1",
              "Related concept 2",
              "Important distinction 3"
            ]
          },
          {
            "title": "Practical Examples",
            "content": "Real-world examples and applications. Show how this concept is used in practice. Include specific scenarios, case studies, or demonstrations. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Example 1 with explanation",
              "Example 2 with context",
              "Common use case 3"
            ]
          },
          {
            "title": "Tips & Common Pitfalls",
            "content": "Expert insights, best practices, and common mistakes to avoid. Provide actionable advice and pro tips. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Best practice 1",
              "Common mistake to avoid 2",
              "Pro tip 3"
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
        "question": "Interactive question...",
        "expectedResponse": "What a good answer would include...",
        "hints": ["Hint 1", "Hint 2"]
      }
    },
    {
      "step_index": 2,
      "step_type": "teach",
      "title": "Advanced Concepts",
      "content": {
        "slides": [
          {
            "title": "Building on Basics",
            "content": "Connect to previous learning and introduce more advanced aspects. Show how concepts build upon each other. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Connection to previous concepts",
              "Advanced aspect 1",
              "Advanced aspect 2"
            ]
          },
          {
            "title": "Deep Dive",
            "content": "Explore nuances, edge cases, and sophisticated applications. Provide detailed analysis and technical depth appropriate for the level. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Nuanced detail 1",
              "Edge case or exception 2",
              "Technical insight 3"
            ]
          },
          {
            "title": "Real-World Applications",
            "content": "Advanced real-world scenarios, professional applications, or complex use cases. Show mastery-level usage. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Professional application 1",
              "Complex scenario 2",
              "Industry practice 3"
            ]
          },
          {
            "title": "Mastery & Next Steps",
            "content": "Summary of advanced concepts, integration of all learning, and pathways for continued growth. 2-3 paragraphs (150-200 words).",
            "keyPoints": [
              "Key mastery indicator 1",
              "Integration point 2",
              "Path for further learning 3"
            ]
          }
        ]
      }
    },
    {
      "step_index": 3,
      "step_type": "quiz",
      "title": "Knowledge Check",
      "content": {
        "questions": [
          {
            "id": "q1",
            "question": "Question text?",
            "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
            "correctAnswer": "A",
            "explanation": "Why A is correct...",
            "points": 1
          }
        ]
      }
    }
  ]
}

Guidelines for TEACH steps:
- Structure content as 3-4 SLIDES per teach step, each with a clear focus
- Each slide should have 150-200 words of content (2-3 substantial paragraphs)
- Each slide should have 3-4 focused key points
- Build a logical progression: Overview → Core Concept → Examples → Tips
- For language courses: include pronunciation tips, cultural notes, dialogues, and usage contexts across slides
- For technical courses: include code examples, diagram descriptions, and edge cases distributed across slides
- Make content engaging, visual, and interactive - think "presentation mode"
- Use descriptive slide titles that preview the content
- First teach step: Introduces foundations with clarity and engagement
- Second teach step: Advances to sophisticated applications and mastery
- Each slide should stand alone but contribute to a cohesive learning journey

Guidelines for interactive elements:
- PROMPT questions should check understanding of taught material
- QUIZ questions should have clear correct answers with explanations
- CHECKPOINT should comprehensively assess key module concepts
- All content appropriate for ${course.level} level
- No job guarantees or certification language

IMPORTANT: The TEACH steps are the foundation of learning. They MUST be substantial enough that students can answer subsequent questions without external resources.`;

    // Generate content with OpenAI
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
            content: 'You are an expert instructional designer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0]?.message?.content;

    // Parse and normalize generated content
    let stepsData;
    try {
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      stepsData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse generated steps:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // NORMALIZATION: Ensure consistent question counts and unique IDs
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
    } catch (normError) {
      console.warn('Failed to normalize steps, proceeding with raw data:', normError);
    }

    // Insert steps into database with duplicate key handling
    const stepsToInsert = stepsData.steps.map((step: any) => ({
      module_id,
      step_index: step.step_index,
      step_type: step.step_type,
      title: step.title,
      content: step.content,
      rubric: step.rubric || null,
      is_completed: false
    }));

    const { data: insertedSteps, error: stepsError } = await supabase
      .from('module_steps')
      .insert(stepsToInsert)
      .select()
      .order('step_index', { ascending: true });

    if (stepsError) {
      // Handle duplicate key errors gracefully
      if (stepsError.code === '23505' || stepsError.message.includes('duplicate key')) {
        console.log('Steps already exist (duplicate key), fetching existing steps...');
        const { data: existingSteps, error: fetchError } = await supabase
          .from('module_steps')
          .select('*')
          .eq('module_id', module_id)
          .order('step_index', { ascending: true });
        
        if (fetchError || !existingSteps || existingSteps.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve existing steps', details: fetchError?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, steps: existingSteps, cached: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to save steps', details: stepsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, steps: insertedSteps, cached: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Frontend Components

### SlideNavigator Component (`src/components/course-engine/SlideNavigator.tsx`)

```typescript
import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Lightbulb, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { ContentSlide } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SlideNavigatorProps {
  slides: ContentSlide[];
  onComplete?: () => void;
  autoMarkComplete?: boolean; // If true, marks as complete when reaching last slide
}

export function SlideNavigator({ slides, onComplete, autoMarkComplete = true }: SlideNavigatorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));

  const currentSlide = slides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      setViewedSlides(prev => new Set(prev).add(nextIndex));
    } else if (isLastSlide && autoMarkComplete && onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setViewedSlides(prev => new Set(prev).add(index));
  };

  const allSlidesViewed = viewedSlides.size === slides.length;

  return (
    <div className="space-y-6">
      {/* Slide Progress Indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-200",
              index === currentSlideIndex && "scale-125"
            )}
            aria-label={`Go to slide ${index + 1}`}
          >
            {viewedSlides.has(index) ? (
              <Circle
                className={cn(
                  "h-2.5 w-2.5",
                  index === currentSlideIndex 
                    ? "fill-primary text-primary" 
                    : "fill-primary/40 text-primary/40"
                )}
              />
            ) : (
              <Circle className="h-2 w-2 text-muted-foreground/40" />
            )}
          </button>
        ))}
      </div>

      {/* Slide Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Slide Title */}
          {currentSlide.title && (
            <div>
              <h2 className="text-2xl font-bold text-[#091747] mb-2">
                {currentSlide.title}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>
          )}

          {/* Slide Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700">
              {currentSlide.content}
            </div>
          </div>

          {/* Key Points */}
          {currentSlide.keyPoints && currentSlide.keyPoints.length > 0 && (
            <PremiumCard className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-[#091747]">
                <Lightbulb className="h-5 w-5 text-primary" />
                Key Takeaways
              </h3>
              <ul className="space-y-3">
                {currentSlide.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          )}

          {/* Visual Hint (if provided) */}
          {currentSlide.visualHint && (
            <PremiumCard className="p-4 bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">💡 Visual Tip: </span>
                {currentSlide.visualHint}
              </p>
            </PremiumCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstSlide}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>

        {isLastSlide ? (
          <Button
            onClick={handleNext}
            disabled={!allSlidesViewed}
            className="gap-2"
          >
            {autoMarkComplete ? "Continue to Next Step" : "Complete"}
            <CheckCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Helpful message */}
      {isLastSlide && !allSlidesViewed && (
        <p className="text-sm text-center text-amber-700 bg-amber-50 p-3 rounded-lg">
          💡 Please review all slides before continuing
        </p>
      )}
    </div>
  );
}
```

### Updated StepRenderer Component (`src/components/course-engine/StepRenderer.tsx`)

```typescript
import { useState } from "react";
import { CheckCircle, Lightbulb, Send, BookOpen, HelpCircle, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { ModuleStep, SubmissionData, QuizQuestion } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { SlideNavigator } from "./SlideNavigator";

interface StepRendererProps {
  step: ModuleStep;
  onSubmit: (submission: SubmissionData) => Promise<void>;
  isSubmitting: boolean;
  onTeachComplete?: () => void; // Called when user completes viewing all slides
}

export function StepRenderer({ step, onSubmit, isSubmitting, onTeachComplete }: StepRendererProps) {
  const [response, setResponse] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);

  const handleTextSubmit = async () => {
    if (!response.trim()) return;
    await onSubmit({ text: response, response });
    setResponse("");
  };

  const handleQuizSubmit = async () => {
    await onSubmit({ answers: quizAnswers });
  };

  const getStepIcon = () => {
    switch (step.step_type) {
      case 'teach': return <BookOpen className="h-5 w-5" />;
      case 'prompt': return <HelpCircle className="h-5 w-5" />;
      case 'quiz': return <CheckCircle className="h-5 w-5" />;
      case 'checkpoint': return <CheckCircle className="h-5 w-5" />;
      case 'reflection': return <PenTool className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStepLabel = () => {
    switch (step.step_type) {
      case 'teach': return 'Learn';
      case 'prompt': return 'Practice';
      case 'quiz': return 'Quiz';
      case 'checkpoint': return 'Checkpoint';
      case 'reflection': return 'Reflect';
      default: return 'Step';
    }
  };

  // Render teaching content
  if (step.step_type === 'teach') {
    // Use slide-based navigation if slides are available
    if (step.content.slides && step.content.slides.length > 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getStepIcon()}
              {getStepLabel()}
            </Badge>
            {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
          </div>

          <SlideNavigator 
            slides={step.content.slides} 
            onComplete={onTeachComplete}
            autoMarkComplete={true}
          />
        </div>
      );
    }

    // Fallback to legacy single-page format for backward compatibility
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {step.content.text && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {step.content.text}
            </p>
          </div>
        )}

        {step.content.keyPoints && step.content.keyPoints.length > 0 && (
          <PremiumCard className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              Key Points
            </h3>
            <ul className="space-y-2">
              {step.content.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        )}
      </div>
    );
  }

  // Render prompt/reflection
  if (step.step_type === 'prompt' || step.step_type === 'reflection') {
    const prompts = step.step_type === 'reflection' 
      ? step.content.reflectionPrompts 
      : [step.content.question];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {prompts?.map((prompt, index) => (
          <div key={index} className="space-y-4">
            <p className="text-base font-medium">{prompt}</p>
          </div>
        ))}

        {step.content.hints && step.content.hints.length > 0 && (
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <p className="mt-2 text-sm text-muted-foreground italic pl-6">
                {step.content.hints[0]}
              </p>
            )}
          </div>
        )}

        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          className="min-h-[150px]"
        />

        <Button 
          onClick={handleTextSubmit} 
          disabled={!response.trim() || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Response
            </>
          )}
        </Button>
      </div>
    );
  }

  // Render quiz/checkpoint
  if (step.step_type === 'quiz' || step.step_type === 'checkpoint') {
    const questions = step.content.questions || [];
    const allAnswered = questions.every(q => quizAnswers[q.id]);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {step.content.instructions && (
          <p className="text-muted-foreground">{step.content.instructions}</p>
        )}

        <div className="space-y-8">
          {questions.map((question, qIndex) => (
            <PremiumCard key={question.id} className="p-4">
              <p className="font-medium mb-4">
                {qIndex + 1}. {question.question}
              </p>
              <RadioGroup
                value={quizAnswers[question.id] || ''}
                onValueChange={(value) => setQuizAnswers(prev => ({
                  ...prev,
                  [question.id]: value
                }))}
                className="space-y-3"
              >
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option} 
                      id={`${question.id}-${option}`}
                      className="flex-shrink-0"
                    />
                    <Label 
                      htmlFor={`${question.id}-${option}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium mr-2">{option}.</span>
                      {question.options[option]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </PremiumCard>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleQuizSubmit} 
            disabled={!allAnswered || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Answers
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
```

### Updated CourseRunnerPage (`src/pages/CourseRunnerPage.tsx`)

```typescript
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Loader2,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PremiumCard } from "@/components/ui/premium-card";
import { useCourseRunner } from "@/hooks/useCourseRunner";
import { StepRenderer } from "@/components/course-engine/StepRenderer";
import { ModuleSidebar } from "@/components/course-engine/ModuleSidebar";
import { FeedbackDisplay } from "@/components/course-engine/FeedbackDisplay";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const CourseRunnerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    course,
    modules,
    currentModule,
    currentStep,
    steps,
    progress,
    isLoading,
    isLoadingSteps,
    isSubmitting,
    lastFeedback,
    loadCourse,
    submitStep,
    navigateToStep,
    navigateToModule,
    getProgressPercentage,
  } = useCourseRunner();

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id, loadCourse]);

  useEffect(() => {
    if (lastFeedback) {
      setShowFeedback(true);
    }
  }, [lastFeedback]);

  const handleSubmit = async (submission: any) => {
    const result = await submitStep(submission);
    if (result.success && result.nextStepId) {
      // Auto-advance after feedback is dismissed
    }
  };

  const handleNextStep = () => {
    setShowFeedback(false);
    
    if (!currentStep || !steps.length) return;
    
    const currentIndex = steps.findIndex(s => s.id === currentStep.id);
    if (currentIndex < steps.length - 1) {
      navigateToStep(steps[currentIndex + 1].id);
    } else if (currentModule) {
      // Check if there's a next module
      const nextModuleIndex = currentModule.module_index + 1;
      const nextModule = modules.find(m => m.module_index === nextModuleIndex);
      if (nextModule) {
        navigateToModule(nextModuleIndex);
      } else {
        // Course complete!
        navigate(`/courses/generated/${id}`);
      }
    }
  };

  const handlePreviousStep = () => {
    if (!currentStep || !steps.length) return;
    
    const currentIndex = steps.findIndex(s => s.id === currentStep.id);
    if (currentIndex > 0) {
      navigateToStep(steps[currentIndex - 1].id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PremiumCard className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            This course may have been deleted or you don't have access.
          </p>
          <Button onClick={() => navigate('/courses/generated')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </PremiumCard>
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const currentStepIndex = currentStep ? steps.findIndex(s => s.id === currentStep.id) : -1;
  const isFirstStep = currentStepIndex === 0 && currentModule?.module_index === 0;
  const isLastStep = currentStepIndex === steps.length - 1 && 
    currentModule?.module_index === modules.length - 1;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r transform transition-transform duration-200",
        isMobile && !showSidebar && "-translate-x-full",
        !isMobile && "relative translate-x-0"
      )}>
        <ModuleSidebar
          course={course}
          modules={modules}
          currentModule={currentModule}
          currentStep={currentStep}
          steps={steps}
          progress={progress}
          onModuleSelect={(index) => {
            navigateToModule(index);
            if (isMobile) setShowSidebar(false);
          }}
          onStepSelect={(stepId) => {
            navigateToStep(stepId);
            if (isMobile) setShowSidebar(false);
          }}
          onBack={() => navigate(`/courses/generated/${id}`)}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Progress Bar */}
        <div className="border-b bg-card px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {currentModule?.title}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progressPercent}% complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {isLoadingSteps ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            ) : showFeedback && lastFeedback ? (
              <FeedbackDisplay 
                feedback={lastFeedback} 
                onContinue={handleNextStep}
              />
            ) : currentStep ? (
              <StepRenderer
                step={currentStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onTeachComplete={handleNextStep}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No content available</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        {!showFeedback && currentStep && (
          <div className="border-t bg-card px-6 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isFirstStep}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
              </div>

              {/* Only show Continue button for legacy teach steps without slides */}
              {currentStep.step_type === 'teach' && 
               (!currentStep.content.slides || currentStep.content.slides.length === 0) && (
                <Button onClick={handleNextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {/* Spacer for non-teach steps or slide-based teach steps */}
              {(currentStep.step_type !== 'teach' || 
                (currentStep.content.slides && currentStep.content.slides.length > 0)) && (
                <div className="w-[100px]" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRunnerPage;
```

---

## Hooks and State Management

### Course Runner Hook (`src/hooks/useCourseRunner.ts`)

```typescript
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  GeneratedCourse,
  CourseModule,
  ModuleStep,
  CourseProgress,
  StepSubmission,
  SubmissionData,
  AIFeedback,
  CourseLevel,
  FormatPreferences,
} from '@/types/course-engine';

interface UseCourseRunnerReturn {
  course: GeneratedCourse | null;
  modules: CourseModule[];
  currentModule: CourseModule | null;
  currentStep: ModuleStep | null;
  steps: ModuleStep[];
  progress: CourseProgress | null;
  isLoading: boolean;
  isLoadingSteps: boolean;
  isSubmitting: boolean;
  lastFeedback: AIFeedback | null;
  loadCourse: (courseId: string) => Promise<void>;
  loadModuleSteps: (moduleId: string) => Promise<void>;
  submitStep: (submission: SubmissionData) => Promise<{ success: boolean; nextStepId?: string }>;
  navigateToStep: (stepId: string) => void;
  navigateToModule: (moduleIndex: number) => void;
  getProgressPercentage: () => number;
}

export const useCourseRunner = (): UseCourseRunnerReturn => {
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [steps, setSteps] = useState<ModuleStep[]>([]);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentStep, setCurrentStep] = useState<ModuleStep | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<AIFeedback | null>(null);

  const loadCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('generated_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const transformedCourse: GeneratedCourse = {
        id: courseData.id,
        user_id: courseData.user_id,
        topic: courseData.topic,
        goal: courseData.goal || undefined,
        title: courseData.title,
        description: courseData.description || undefined,
        level: courseData.level as CourseLevel,
        pace_weeks: courseData.pace_weeks,
        format_preferences: (courseData.format_preferences || {}) as FormatPreferences,
        learning_objectives: Array.isArray(courseData.learning_objectives)
          ? courseData.learning_objectives as unknown as GeneratedCourse['learning_objectives']
          : [],
        status: courseData.status as GeneratedCourse['status'],
        context_summary: courseData.context_summary || undefined,
        created_at: courseData.created_at,
        updated_at: courseData.updated_at,
      };

      setCourse(transformedCourse);

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_index', { ascending: true });

      if (modulesError) throw modulesError;
      
      // Transform modules
      const transformedModules: CourseModule[] = (modulesData || []).map(m => ({
        id: m.id,
        course_id: m.course_id,
        module_index: m.module_index,
        title: m.title,
        summary: m.summary || undefined,
        estimated_minutes: m.estimated_minutes,
        checkpoints_schema: (m.checkpoints_schema || { type: 'quiz', questionCount: 5, passingScore: 70 }) as unknown as CourseModule['checkpoints_schema'],
        is_completed: m.is_completed,
        completed_at: m.completed_at || undefined,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      
      setModules(transformedModules);

      // Fetch or create progress
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!progressData) {
        const { data: newProgress, error: progressError } = await supabase
          .from('course_progress')
          .insert({
            course_id: courseId,
            user_id: user.id,
            current_module_id: transformedModules?.[0]?.id,
            module_completion: {},
          })
          .select()
          .single();

        if (progressError) throw progressError;
        progressData = newProgress;
      }

      // Transform progress data
      const transformedProgress: CourseProgress = {
        id: progressData.id,
        course_id: progressData.course_id,
        user_id: progressData.user_id,
        current_module_id: progressData.current_module_id || undefined,
        current_step_id: progressData.current_step_id || undefined,
        module_completion: (progressData.module_completion || {}) as unknown as CourseProgress['module_completion'],
        total_steps_completed: progressData.total_steps_completed,
        total_checkpoints_passed: progressData.total_checkpoints_passed,
        last_activity_at: progressData.last_activity_at,
        started_at: progressData.started_at,
        completed_at: progressData.completed_at || undefined,
        created_at: progressData.created_at,
        updated_at: progressData.updated_at,
      };

      setProgress(transformedProgress);

      // Set current module from transformed data
      if (transformedModules && transformedModules.length > 0) {
        const currentMod = transformedProgress?.current_module_id
          ? transformedModules.find(m => m.id === transformedProgress.current_module_id)
          : transformedModules[0];
        setCurrentModule(currentMod || transformedModules[0]);
      }
    } catch (err) {
      console.error('Error loading course:', err);
      toast({
        title: 'Error',
        description: 'Failed to load course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadModuleSteps = useCallback(async (moduleId: string) => {
    if (!course) return;

    setIsLoadingSteps(true);
    setSteps([]);

    try {
      const response = await supabase.functions.invoke('generate-module-steps', {
        body: {
          course_id: course.id,
          module_id: moduleId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load steps');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Failed to load steps');
      }

      setSteps(result.steps);

      // Set current step
      if (result.steps.length > 0) {
        const incompleteStep = result.steps.find((s: ModuleStep) => !s.is_completed);
        setCurrentStep(incompleteStep || result.steps[0]);
      }
    } catch (err) {
      console.error('Error loading steps:', err);
      toast({
        title: 'Error',
        description: 'Failed to load module content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSteps(false);
    }
  }, [course]);

  // Auto-load steps when current module changes
  useEffect(() => {
    if (currentModule) {
      loadModuleSteps(currentModule.id);
    }
  }, [currentModule, loadModuleSteps]);

  const submitStep = useCallback(async (submission: SubmissionData) => {
    if (!currentStep || !course) {
      return { success: false };
    }

    setIsSubmitting(true);
    setLastFeedback(null);

    try {
      const response = await supabase.functions.invoke('evaluate-step', {
        body: {
          step_id: currentStep.id,
          course_id: course.id,
          submission,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setLastFeedback(result.feedback);

      // Update step completion locally
      if (result.is_passing) {
        setSteps(prev =>
          prev.map(s =>
            s.id === currentStep.id
              ? { ...s, is_completed: true, completed_at: new Date().toISOString() }
              : s
          )
        );

        // Update progress
        setProgress(prev => prev ? {
          ...prev,
          total_steps_completed: (prev.total_steps_completed || 0) + 1,
          last_activity_at: new Date().toISOString(),
        } : null);
      }

      return {
        success: true,
        nextStepId: result.next_step_id,
      };
    } catch (err) {
      console.error('Error submitting step:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit your response. Please try again.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, course]);

  const navigateToStep = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setCurrentStep(step);
      setLastFeedback(null);
    }
  }, [steps]);

  const navigateToModule = useCallback((moduleIndex: number) => {
    const module = modules.find(m => m.module_index === moduleIndex);
    if (module) {
      setCurrentModule(module);
      setLastFeedback(null);
    }
  }, [modules]);

  const getProgressPercentage = useCallback(() => {
    if (!modules.length) return 0;

    const completedModules = modules.filter(m => m.is_completed).length;
    return Math.round((completedModules / modules.length) * 100);
  }, [modules]);

  return {
    course,
    modules,
    currentModule,
    currentStep,
    steps,
    progress,
    isLoading,
    isLoadingSteps,
    isSubmitting,
    lastFeedback,
    loadCourse,
    loadModuleSteps,
    submitStep,
    navigateToStep,
    navigateToModule,
    getProgressPercentage,
  };
};
```

---

## Evaluation System

### Step Evaluation Edge Function (`supabase/functions/evaluate-step/index.ts`)

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluateStepRequest {
  step_id: string;
  course_id: string;
  submission: {
    answers?: { [questionId: string]: string };
    text?: string;
    response?: string;
    reflections?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication setup...
    const { step_id, course_id, submission }: EvaluateStepRequest = await req.json();

    // Fetch step details
    const { data: step, error: stepError } = await supabase
      .from('module_steps')
      .select('*, course_modules!inner(*, generated_courses!inner(*))')
      .eq('id', step_id)
      .single();

    if (stepError || !step) {
      return new Response(
        JSON.stringify({ error: 'Step not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const course = step.course_modules.generated_courses;
    const module = step.course_modules;

    // Get previous attempt count
    const { count: attemptCount } = await supabase
      .from('step_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('step_id', step_id)
      .eq('user_id', userId);

    const attemptNumber = (attemptCount || 0) + 1;

    let feedback;
    let score = null;
    let isPassing = true;

    // Handle different step types
    if (step.step_type === 'quiz' || step.step_type === 'checkpoint') {
      // Auto-grade quiz/checkpoint with multiple choice
      if (submission.answers && step.content.questions) {
        let correctCount = 0;
        const totalQuestions = step.content.questions.length;
        
        step.content.questions.forEach((q: any) => {
          if (submission.answers?.[q.id] === q.correctAnswer) {
            correctCount++;
          }
        });

        score = Math.round((correctCount / totalQuestions) * 100);
        const passingScore = module.checkpoints_schema?.passingScore || 70;
        isPassing = score >= passingScore;

        feedback = {
          overallScore: score,
          feedback: isPassing 
            ? `Great job! You scored ${score}% (${correctCount}/${totalQuestions} correct).`
            : `You scored ${score}% (${correctCount}/${totalQuestions} correct). You need ${passingScore}% to pass. Review the material and try again!`,
          strengths: isPassing ? ['Good understanding of key concepts'] : [],
          improvements: isPassing ? [] : ['Review the module content before retrying'],
          nextStepGuidance: isPassing 
            ? 'You can proceed to the next step!' 
            : 'Take time to review the teaching sections before retrying.'
        };
      }
    } else if (step.step_type === 'prompt' || (step.step_type === 'checkpoint' && submission.text)) {
      // Use AI to evaluate written responses
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (openAIApiKey && (submission.text || submission.response)) {
        const userResponse = submission.text || submission.response || '';
        
        const evaluationPrompt = `You are evaluating a student's response in an educational course.

Course: ${course.topic} (${course.level} level)
Module: ${module.title}
Step: ${step.title}

Question/Prompt: ${step.content.question || step.content.instructions || 'Complete the reflection.'}
Expected Response Criteria: ${step.content.expectedResponse || 'Thoughtful engagement with the material'}

Student's Response:
"${userResponse}"

${step.rubric ? `Evaluation Rubric: ${JSON.stringify(step.rubric)}` : ''}

Provide feedback in this JSON format:
{
  "overallScore": <number 0-100>,
  "feedback": "Constructive feedback paragraph (2-3 sentences, no markdown)",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Suggestion 1", "Suggestion 2"],
  "nextStepGuidance": "What the student should do next",
  "conceptsToReview": ["Concept 1", "Concept 2"] // if score < 70
}

Be encouraging but honest. Focus on learning, not criticism.`;

        try {
          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a supportive educational evaluator. Always respond with valid JSON only.'
                },
                {
                  role: 'user',
                  content: evaluationPrompt
                }
              ],
              temperature: 0.5,
              max_tokens: 800,
            }),
          });

          if (openAIResponse.ok) {
            const openAIData = await openAIResponse.json();
            const generatedFeedback = openAIData.choices[0]?.message?.content;
            
            if (generatedFeedback) {
              const cleanedFeedback = generatedFeedback
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
              feedback = JSON.parse(cleanedFeedback);
              score = feedback.overallScore;
              isPassing = score >= 60; // Lower threshold for prompts
            }
          }
        } catch (aiError) {
          console.error('AI evaluation error:', aiError);
        }
      }
      
      // Fallback if AI evaluation fails
      if (!feedback) {
        feedback = {
          overallScore: 80,
          feedback: 'Thank you for your thoughtful response. Your engagement with the material shows understanding.',
          strengths: ['Completed the response'],
          improvements: ['Continue exploring the topic'],
          nextStepGuidance: 'You can proceed to the next step!'
        };
        score = 80;
        isPassing = true;
      }
    } else if (step.step_type === 'teach') {
      // Teach steps don't need evaluation
      feedback = {
        feedback: 'Content reviewed. Continue to the next step!',
        nextStepGuidance: 'Proceed to the next step.'
      };
      isPassing = true;
    } else if (step.step_type === 'reflection') {
      // Auto-pass reflections with minimal feedback
      feedback = {
        feedback: 'Thank you for your reflection. Taking time to think about what you\'ve learned strengthens retention.',
        strengths: ['Engaged in self-reflection'],
        nextStepGuidance: 'Continue to the next step!'
      };
      isPassing = true;
    }

    // Save the submission
    const { data: savedSubmission, error: submissionError } = await supabase
      .from('step_submissions')
      .insert({
        step_id,
        user_id: userId,
        course_id,
        submission,
        ai_feedback: feedback,
        score,
        is_passing: isPassing,
        attempt_number: attemptNumber
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error saving submission:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update step completion if passing
    if (isPassing) {
      await supabase
        .from('module_steps')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', step_id);

      // Update progress
      const { data: allSteps } = await supabase
        .from('module_steps')
        .select('id, is_completed, step_type')
        .eq('module_id', module.id);

      const completedSteps = allSteps?.filter(s => s.is_completed).length || 0;
      const totalSteps = allSteps?.length || 0;
      const completedCheckpoints = allSteps?.filter(s => s.is_completed && s.step_type === 'checkpoint').length || 0;

      await supabase
        .from('course_progress')
        .update({
          current_step_id: step_id,
          total_steps_completed: completedSteps,
          total_checkpoints_passed: completedCheckpoints,
          last_activity_at: new Date().toISOString()
        })
        .eq('course_id', course_id)
        .eq('user_id', userId);

      // Check if module is complete
      if (completedSteps === totalSteps) {
        await supabase
          .from('course_modules')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('id', module.id);
      }
    }

    // Find next step
    let nextStepId = null;
    if (isPassing) {
      const { data: nextStep } = await supabase
        .from('module_steps')
        .select('id')
        .eq('module_id', module.id)
        .gt('step_index', step.step_index)
        .order('step_index', { ascending: true })
        .limit(1)
        .maybeSingle();

      nextStepId = nextStep?.id || null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        submission: savedSubmission,
        feedback,
        score,
        is_passing: isPassing,
        next_step_id: nextStepId,
        attempt_number: attemptNumber
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Complete Flow Diagram

```
USER LEARNING FLOW:
1. User creates AI course → generate-course Edge Function
2. User starts learning → CourseRunnerPage loads
3. System fetches/generates module steps → generate-module-steps Edge Function
4. User encounters TEACH step with slides:
   ├── SlideNavigator renders 3-4 slides
   ├── User navigates through slides (Previous/Next/Click indicators)
   ├── System tracks viewed slides
   ├── User must view ALL slides before continuing
   └── "Continue to Next Step" button enabled when all viewed
5. User proceeds to PROMPT step:
   ├── StepRenderer shows question + hints
   ├── User types response
   └── Submits → evaluate-step Edge Function (AI evaluation)
6. User gets feedback → FeedbackDisplay component
7. User proceeds to QUIZ step:
   ├── StepRenderer shows multiple choice questions
   ├── User selects answers
   └── Submits → evaluate-step Edge Function (auto-grading)
8. User gets feedback with score (e.g., "3 out of 3 correct")
9. Process repeats for remaining steps in module
10. Module completion → progress tracking updated
11. User moves to next module or completes course

TECHNICAL FLOW:
generate-module-steps → StepRenderer → SlideNavigator → evaluate-step → FeedbackDisplay

KEY FEATURES:
✅ Slide-based TEACH steps (3-4 slides each)
✅ Progress tracking within slides
✅ Mandatory slide viewing before progression
✅ Smooth animations between slides
✅ Visual progress indicators
✅ Backward compatibility with legacy content
✅ AI-generated comprehensive content
✅ Consistent question counts (3 for quiz, 5 for checkpoint)
✅ Unique question IDs to prevent scoring mismatches
✅ Duplicate key error handling
✅ Rich feedback system with strengths/improvements
✅ Mobile-responsive design
```

---

## Database Schema

The feature relies on these key database tables:

- `generated_courses` - Course metadata
- `course_modules` - Module structure and checkpoints schema
- `module_steps` - Individual learning steps with content (including slides)
- `step_submissions` - User responses and AI feedback
- `course_progress` - User progress tracking

The `module_steps.content` JSONB field now supports both legacy format (`text`, `keyPoints`) and new slide format (`slides[]`) for backward compatibility.

---

## Deployment Notes

1. Deploy Edge Functions: `npx supabase functions deploy generate-module-steps` and `npx supabase functions deploy evaluate-step`
2. Ensure OpenAI API key is configured in Supabase Edge Function secrets
3. Test with a new course creation to see slide-based content
4. Existing courses will use legacy format until steps are regenerated

This comprehensive system transforms traditional learning content into an engaging, slide-based experience while maintaining robust evaluation and progress tracking.
