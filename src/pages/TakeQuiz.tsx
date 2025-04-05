
import { QuizContainer } from "@/components/quiz-taking/QuizContainer";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";

const TakeQuiz = () => {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full">
      <QuizContainer />
      <div className="container mx-auto px-4 w-full mt-auto">
        <QuizDisclaimer />
      </div>
    </div>
  );
};

export default TakeQuiz;
