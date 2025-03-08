
interface QuizPaginationProps {
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

export const QuizPagination = ({ 
  currentPage, 
  totalPages,
  onChangePage 
}: QuizPaginationProps) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <div className="text-sm text-gray-500">
        Page {currentPage + 1} of {totalPages}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChangePage(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === currentPage 
                ? "bg-primary" 
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
