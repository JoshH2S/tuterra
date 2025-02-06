
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface QuizData {
  title: string;
  courseId: string;
  teacherId: string;
  file: File;
  questions: any[];
}

export async function storeQuizData(
  supabaseUrl: string,
  supabaseServiceKey: string,
  data: QuizData
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Create quiz record
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({
      title: data.title,
      course_id: data.courseId,
      teacher_id: data.teacherId,
    })
    .select()
    .single();

  if (quizError) {
    console.error('Error creating quiz:', quizError);
    throw new Error('Failed to create quiz');
  }

  // Store file in Storage
  const fileExt = data.file.name.split('.').pop();
  const sanitizedFileName = data.file.name.replace(/[^\x00-\x7F]/g, '');
  const uniqueFilePath = `${data.courseId}/${crypto.randomUUID()}-${sanitizedFileName}`;
  
  const { error: storageError } = await supabase.storage
    .from('course_materials')
    .upload(uniqueFilePath, data.file);

  if (storageError) {
    console.error('Error uploading file:', storageError);
    throw new Error('Failed to upload file');
  }

  // Store file metadata
  const { error: materialError } = await supabase
    .from('course_materials')
    .insert({
      course_id: data.courseId,
      file_name: data.file.name,
      file_type: data.file.type,
      size: data.file.size,
      storage_path: uniqueFilePath,
    });

  if (materialError) {
    console.error('Error storing file metadata:', materialError);
    throw new Error('Failed to store file metadata');
  }

  // Store questions
  const formattedQuestions = data.questions.map((q: any) => ({
    quiz_id: quiz.id,
    question: q.question,
    correct_answer: q.correct_answer,
    topic: q.topic,
    options: q.options
  }));

  const { error: questionsError } = await supabase
    .from('quiz_questions')
    .insert(formattedQuestions);

  if (questionsError) {
    console.error('Error storing questions:', questionsError);
    throw new Error('Failed to store questions');
  }

  return quiz.id;
}
