import React, { useState, useCallback } from 'react';
import { ReviewReport, CodeIssue, IssueSeverity } from '../types';

interface ReviewOutputProps {
  report: ReviewReport;
}

const getSeverityStyles = (severity: IssueSeverity | string): { bg: string, border: string, text: string } => {
  switch (severity) {
    case IssueSeverity.CRITICAL:
      return { bg: 'bg-red-600', border: 'border-red-700', text: 'text-white' };
    case IssueSeverity.HIGH:
      return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white' };
    case IssueSeverity.MEDIUM:
      return { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-slate-900' };
    case IssueSeverity.LOW:
      return { bg: 'bg-sky-500', border: 'border-sky-600', text: 'text-white' };
    case IssueSeverity.INFO:
      return { bg: 'bg-slate-500', border: 'border-slate-600', text: 'text-white' };
    default:
      return { bg: 'bg-gray-500', border: 'border-gray-600', text: 'text-white' };
  }
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Optionally, provide user feedback for copy failure
    }
  }, [textToCopy]);

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
        copied ? 'bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
      } transition-colors duration-150`}
      aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const IssueCard: React.FC<{ issue: CodeIssue }> = ({ issue }) => {
  const severityStyles = getSeverityStyles(issue.severity);

  // This function parses the suggestion string and separates text from code blocks.
  // It returns an array of React elements (text or preformatted code blocks with copy buttons).
  const formatSuggestionContent = (suggestion: string) => {
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
    let match;

    while ((match = codeBlockRegex.exec(suggestion)) !== null) {
      // Text before the code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="whitespace-pre-line my-1">
            {suggestion.substring(lastIndex, match.index).trim()}
          </p>
        );
      }
      // Code block
      const lang = match[1] || 'plaintext'; // Default to plaintext if no language specified
      const code = match[2].trim();
      parts.push(
        <div key={`code-${match.index}`} className="relative my-2">
          <pre 
            className={`bg-slate-900 p-3 pr-16 rounded-md text-sm font-mono overflow-x-auto text-gray-200 border border-slate-700 language-${lang}`}
            aria-label={`Suggested code block in ${lang}`}
          >
            <code>{code}</code>
          </pre>
          <CopyButton textToCopy={code} />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    // Text after the last code block
    if (lastIndex < suggestion.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="whitespace-pre-line my-1">
          {suggestion.substring(lastIndex).trim()}
        </p>
      );
    }
    return parts.filter(part => (typeof part === 'string' ? part.trim() !== '' : true));
  };


  return (
    <div className="bg-slate-700/50 rounded-lg shadow-xl p-4 md:p-5 border border-slate-600/70">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span 
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityStyles.bg} ${severityStyles.border} ${severityStyles.text}`}
          aria-label={`Severity: ${issue.severity}`}
        >
          {issue.severity}
        </span>
        <span 
          className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-600 text-sky-300 border border-slate-500"
          aria-label={`Category: ${issue.category}`}
        >
          {issue.category}
        </span>
        {issue.lineNumber && issue.lineNumber !== "N/A" && (
          <span className="text-xs text-slate-400" aria-label={`Line number: ${issue.lineNumber}`}>Line: {issue.lineNumber}</span>
        )}
      </div>
      <div className="mb-3">
        <h3 className="font-semibold text-sky-200 text-base mb-1">Description:</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{issue.description}</p>
      </div>
      
      {issue.suggestion && issue.suggestion.trim() && issue.suggestion !== "No suggestion provided." && (
        <div>
          <h4 className="font-semibold text-sky-200 text-base mb-1">Suggestion:</h4>
          <div className="text-slate-300 text-sm prose prose-sm prose-invert max-w-none">
             {formatSuggestionContent(issue.suggestion)}
          </div>
        </div>
      )}
    </div>
  );
};

export const ReviewOutput: React.FC<ReviewOutputProps> = ({ report }) => {
  return (
    <div className="space-y-6 h-full">
      <div>
        <h2 className="text-2xl font-semibold text-sky-300 mb-2 border-b border-slate-700 pb-2">Overall Assessment</h2>
        <div className="text-slate-300 bg-slate-700/30 p-4 rounded-md border border-slate-600/50 leading-relaxed whitespace-pre-line">
          {report.overallAssessment}
        </div>
      </div>

      {report.issues && report.issues.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-sky-300 mb-3 border-b border-slate-700 pb-2">
            Identified Issues ({report.issues.length})
          </h2>
          <div className="space-y-5">
            {report.issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {(!report.issues || report.issues.length === 0) && !report.overallAssessment.toLowerCase().includes("error") && ( // Check for errors in assessment
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-green-400 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-xl font-semibold text-slate-300">Excellent! No major issues found.</p>
          <p className="text-sm text-slate-400 mt-1">The AI reviewer found the code to be in good shape according to the assessment.</p>
        </div>
      )}
    </div>
  );
};