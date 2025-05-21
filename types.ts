export enum SupportedLanguage {
  JAVASCRIPT = "JavaScript",
  PYTHON = "Python",
  TYPESCRIPT = "TypeScript",
  JAVA = "Java",
  CPP = "C++",
  C = "C",
  GO = "Go",
  RUST = "Rust",
  HTML = "HTML",
  CSS = "CSS",
  JSON = "JSON",
  MARKDOWN = "Markdown",
  PHP = "PHP",
  RUBY = "Ruby",
  CSHARP = "C#",
  KOTLIN = "Kotlin",
  SWIFT = "Swift",
  SQL = "SQL",
  SHELL = "Shell Script",
}

export enum IssueSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFO = "INFO",
}

export enum IssueCategory {
  BUG = "BUG",
  VULNERABILITY = "VULNERABILITY",
  PERFORMANCE = "PERFORMANCE",
  STYLE = "STYLE",
  BEST_PRACTICE = "BEST_PRACTICE",
  READABILITY = "READABILITY",
  MAINTAINABILITY = "MAINTAINABILITY",
  COMPLEXITY = "COMPLEXITY", // Added for potential explicit complexity issues
  OTHER = "OTHER", // For categories Gemini might invent
}

export interface CodeIssue {
  severity: IssueSeverity | string; 
  category: IssueCategory | string;
  lineNumber?: string | number; 
  description: string;
  suggestion: string; // May contain markdown code blocks for suggested code
}

export interface ReviewReport {
  /** 
   * A brief summary of the code quality, highlighting key strengths and weaknesses.
   * This may also include a Code Complexity Assessment (e.g., "low," "moderate," "high" with justification).
   */
  overallAssessment: string;
  issues: CodeIssue[];
}