
export class QuestionValidator {
  private readonly VALID_CATEGORIES = new Set([
    'technical',
    'behavioral',
    'problem solving',
    'situational',
    'experience',
    'core',
    'cultural fit'
  ]);

  private readonly VALID_DIFFICULTIES = new Set([
    'easy',
    'medium',
    'hard'
  ]);

  isValidQuestion(question: any): boolean {
    return (
      this.isValidText(question.text) &&
      this.isValidCategory(question.category) &&
      this.isValidDifficulty(question.difficulty) &&
      this.isValidTime(question.estimatedTimeSeconds) &&
      this.isValidKeywords(question.keywords)
    );
  }

  private isValidText(text: any): boolean {
    return typeof text === 'string' && text.length >= 10;
  }

  private isValidCategory(category: any): boolean {
    return typeof category === 'string' && 
           this.VALID_CATEGORIES.has(category.toLowerCase());
  }

  private isValidDifficulty(difficulty: any): boolean {
    return typeof difficulty === 'string' && 
           this.VALID_DIFFICULTIES.has(difficulty.toLowerCase());
  }

  private isValidTime(time: any): boolean {
    return typeof time === 'number' && time >= 60 && time <= 300;
  }

  private isValidKeywords(keywords: any): boolean {
    return Array.isArray(keywords) && 
           keywords.length > 0 && 
           keywords.every(k => typeof k === 'string');
  }
}
