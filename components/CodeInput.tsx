import React, { useState, useRef } from 'react';
import { SupportedLanguage } from '../types';
import { PROGRAMMING_LANGUAGES } from '../constants';

interface CodeInputProps {
  initialCode: string;
  initialLanguage: SupportedLanguage;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onReviewRequest: () => void;
  isLoading: boolean;
}

const extensionToLanguageMap: Record<string, SupportedLanguage> = {
  'js': SupportedLanguage.JAVASCRIPT,
  'mjs': SupportedLanguage.JAVASCRIPT,
  'jsx': SupportedLanguage.JAVASCRIPT, // Common practice, though JSX isn't a separate language in the enum
  'py': SupportedLanguage.PYTHON,
  'pyw': SupportedLanguage.PYTHON,
  'ts': SupportedLanguage.TYPESCRIPT,
  'tsx': SupportedLanguage.TYPESCRIPT,
  'mts': SupportedLanguage.TYPESCRIPT,
  'java': SupportedLanguage.JAVA,
  'cpp': SupportedLanguage.CPP,
  'cxx': SupportedLanguage.CPP,
  'cc': SupportedLanguage.CPP,
  'hpp': SupportedLanguage.CPP,
  'hxx': SupportedLanguage.CPP,
  'hh': SupportedLanguage.CPP,
  'c': SupportedLanguage.C,
  'h': SupportedLanguage.C, // Often C, but can be C++
  'go': SupportedLanguage.GO,
  'rs': SupportedLanguage.RUST,
  'html': SupportedLanguage.HTML,
  'htm': SupportedLanguage.HTML,
  'css': SupportedLanguage.CSS,
  'json': SupportedLanguage.JSON,
  'md': SupportedLanguage.MARKDOWN,
  'markdown': SupportedLanguage.MARKDOWN,
  'php': SupportedLanguage.PHP,
  'php3': SupportedLanguage.PHP,
  'php4': SupportedLanguage.PHP,
  'php5': SupportedLanguage.PHP,
  'phtml': SupportedLanguage.PHP,
  'rb': SupportedLanguage.RUBY,
  'cs': SupportedLanguage.CSHARP,
  'kt': SupportedLanguage.KOTLIN,
  'kts': SupportedLanguage.KOTLIN,
  'swift': SupportedLanguage.SWIFT,
  'sql': SupportedLanguage.SQL,
  'sh': SupportedLanguage.SHELL,
  'bash': SupportedLanguage.SHELL,
  'zsh': SupportedLanguage.SHELL,
};


export const CodeInput: React.FC<CodeInputProps> = ({
  initialCode,
  initialLanguage,
  onCodeChange,
  onLanguageChange,
  onReviewRequest,
  isLoading
}) => {
  const [internalCode, setInternalCode] = useState(initialCode);
  const [internalLanguage, setInternalLanguage] = useState(initialLanguage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;
    setInternalCode(newCode);
    onCodeChange(newCode);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value as SupportedLanguage;
    setInternalLanguage(lang);
    onLanguageChange(lang);
  };

  const handleClearCode = () => {
    setInternalCode('');
    onCodeChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInternalCode(text);
        onCodeChange(text);

        // Auto-detect language from file extension
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        if (fileExtension && extensionToLanguageMap[fileExtension]) {
          const detectedLanguage = extensionToLanguageMap[fileExtension];
          if (PROGRAMMING_LANGUAGES.includes(detectedLanguage)) { // Ensure it's a supported language
             setInternalLanguage(detectedLanguage);
             onLanguageChange(detectedLanguage);
          }
        }
      };
      reader.onerror = (e) => {
        console.error("Error reading file:", e);
        alert("Error reading file. Please ensure it's a valid text file.");
      };
      reader.readAsText(file);
    }
  };
  
  // Common button styles
  const actionButtonClasses = "px-3 py-2.5 bg-slate-600 hover:bg-slate-500 text-gray-200 font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400 text-xs sm:text-sm";

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <div>
          <label htmlFor="language-select" className="block text-sm font-medium text-sky-300 mb-1">
            Language
          </label>
          <select
            id="language-select"
            value={internalLanguage}
            onChange={handleLanguageChange}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-100 placeholder-slate-400"
            disabled={isLoading}
            aria-label="Select programming language"
          >
            {PROGRAMMING_LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-slate-700 text-gray-100">
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2 sm:space-x-3 justify-start sm:justify-end mt-2 sm:mt-0">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.js,.mjs,.jsx,.ts,.tsx,.mts,.py,.pyw,.java,.c,.cpp,.cxx,.cc,.h,.hpp,.hxx,.hh,.go,.rs,.html,.htm,.css,.json,.md,.markdown,.php,.php3,.php4,.php5,.phtml,.rb,.cs,.kt,.kts,.swift,.sql,.sh,.bash,.zsh"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleFileUploadClick}
            disabled={isLoading}
            className={`${actionButtonClasses} whitespace-nowrap`}
            title="Upload code from file (language auto-detected from extension)"
            aria-label="Upload code from file (language auto-detected from extension)"
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={handleClearCode}
            disabled={isLoading || !internalCode}
            className={actionButtonClasses}
            title="Clear code input"
            aria-label="Clear code input"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <label htmlFor="code-input" className="block text-sm font-medium text-sky-300 mb-1">
          Code Snippet / Uploaded Content
        </label>
        <textarea
          id="code-input"
          value={internalCode}
          onChange={handleCodeChange}
          placeholder={`Paste your ${internalLanguage} code here, or upload a file (language auto-detected for uploads)...`}
          className="w-full flex-grow p-3 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200 text-sm font-mono resize-none placeholder-slate-500"
          rows={15}
          spellCheck="false"
          disabled={isLoading}
          aria-label="Code input area"
        />
      </div>

      <button
        onClick={onReviewRequest}
        disabled={isLoading || !internalCode.trim()}
        className="w-full bg-black text-white font-semibold py-3 px-4 rounded-md shadow-md transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-400 hover:shadow-lg hover:-translate-y-0.5 transform transition-transform"
        aria-label="Request code review"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Reviewing...
          </span>
        ) : '🚀 Review Code 🚀'}
      </button>
    </div>
  );
};