

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SupportedLanguage, ReviewReport, CodeIssue, IssueSeverity, IssueCategory } from '../types';
import { GEMINI_MODEL_NAME, GEMINI_API_KEY_ERROR_MESSAGE } from '../constants';

let ai: GoogleGenAI | null = null;

const getGenAIClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error(GEMINI_API_KEY_ERROR_MESSAGE);
    throw new Error(GEMINI_API_KEY_ERROR_MESSAGE);
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


export const reviewCodeWithGemini = async (code: string, language: SupportedLanguage): Promise<ReviewReport> => {
  const client = getGenAIClient();

  const prompt = `
You are an highly advanced AI code reviewer. Your primary goal is to provide an exceptionally detailed, accurate, and constructive review of the provided ${language} code.

Analyze the code for:
1.  **Errors and Bugs:** Identify any syntactic or logical errors.
2.  **Security Vulnerabilities:** Scrutinize for common and uncommon security flaws (e.g., injection, XSS, insecure data handling, etc.).
3.  **Performance Issues:** Pinpoint any performance bottlenecks or inefficient code patterns.
4.  **Best Practices:** Check adherence to language-specific best practices and common coding conventions.
5.  **Readability and Maintainability:** Assess code clarity, organization, and ease of future maintenance.
6.  **Code Complexity:** Briefly assess the code's complexity (e.g., cyclomatic complexity if applicable, or general structural complexity) and mention if it's appropriately simple or overly convoluted.

Provide your feedback as a single, valid JSON object adhering to the following structure. Do NOT include any text outside of this JSON object, including markdown fences like \`\`\`json or \`\`\`.

{
  "overallAssessment": "A comprehensive summary (3-5 sentences) of the code's quality. This MUST include: key strengths, critical weaknesses, a brief code complexity assessment (e.g., 'Code complexity appears low due to straightforward logic...' or 'The code exhibits moderate complexity with nested structures that could be simplified...'), and an overall impression of its production-readiness.",
  "issues": [
    {
      "severity": "CRITICAL | HIGH | MEDIUM | LOW | INFO",
      "category": "BUG | VULNERABILITY | PERFORMANCE | STYLE | BEST_PRACTICE | READABILITY | MAINTAINABILITY | COMPLEXITY | OTHER",
      "lineNumber": "The specific line number (e.g., '10') or range (e.g., '10-15') where the issue occurs. Use 'N/A' if not applicable to a specific line.",
      "description": "A very clear, precise, and detailed explanation of the issue. Explain *why* it's an issue.",
      "suggestion": "A concrete, actionable, and 'perfect' solution. If suggesting code changes, provide the complete, corrected code snippet using markdown format: \`\`\`${language.toLowerCase()}\n// your corrected code here\n\`\`\`. The snippet should be directly usable by the developer. Explain *how* the suggestion resolves the issue."
    }
  ]
}

If no significant issues are found, the "issues" array can be empty. The "overallAssessment" should still be comprehensive.
Your suggestions should be specific enough that a developer can directly implement them.
Prioritize accuracy and depth in your analysis. Be meticulous.

Code to review:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`
`;

  let responseTextForErrorContext: string | undefined = undefined;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.15, 
        topP: 0.85, 
        topK: 35,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for potentially faster responses
      }
    });

    responseTextForErrorContext = response.text;
    let jsonStr = responseTextForErrorContext?.trim() ?? '';
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    const parsedData = JSON.parse(jsonStr) as ReviewReport;

    if (typeof parsedData.overallAssessment !== 'string' || !Array.isArray(parsedData.issues)) {
      console.error("Invalid JSON structure received:", parsedData);
      throw new Error("Received an invalid JSON structure for the review report. The AI's response might not conform to the expected schema.");
    }
    
    parsedData.issues = parsedData.issues.map((issue: any): CodeIssue => ({
        severity: Object.values(IssueSeverity).includes(issue.severity?.toUpperCase()) ? issue.severity.toUpperCase() : IssueSeverity.INFO,
        category: Object.values(IssueCategory).includes(issue.category?.toUpperCase()) ? issue.category.toUpperCase() : IssueCategory.OTHER,
        lineNumber: String(issue.lineNumber ?? 'N/A'),
        description: String(issue.description ?? 'No description provided.'),
        suggestion: String(issue.suggestion ?? 'No suggestion provided.')
    }));

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    let errorMessage = "An error occurred while generating the code review.";

    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "The provided Gemini API key is not valid. Please check your API_KEY environment variable.";
        } else if (error.message.includes("FETCH_ERROR") || error.message.toLowerCase().includes("network error")) {
            errorMessage = "A network error occurred while contacting the Gemini API. Please check your internet connection and try again.";
        } else if (error.message.includes("500") || error.message.toLowerCase().includes("rpc failed") || error.message.toLowerCase().includes("service unavailable") || error.message.toLowerCase().includes("internal error")) {
             errorMessage = `The AI service seems to be temporarily unavailable or encountered an internal error. Please try again in a few moments. (Details: ${error.message})`;
        } else {
            errorMessage = error.message;
        }
    } else {
        errorMessage = String(error);
    }
    
    if (error instanceof SyntaxError) {
        const snippet = responseTextForErrorContext ? responseTextForErrorContext.substring(0, 200) + "..." : 'N/A (raw response not available)';
        errorMessage = `Failed to parse review feedback as JSON. The AI's response might be malformed or incomplete. Raw response snippet: ${snippet}`;
    }

    throw new Error(errorMessage);
  }
};