import React, { useState, useCallback } from 'react';
import { CodeInput } from './components/CodeInput';
import { ReviewOutput } from './components/ReviewOutput';
import { Spinner } from './components/Spinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { reviewCodeWithGemini } from './services/geminiService';
import { SupportedLanguage, ReviewReport } from './types';
import { GithubIcon } from './components/GithubIcon';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SupportedLanguage.JAVASCRIPT);
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReviewRequest = useCallback(async (currentCode: string, language: SupportedLanguage) => {
    if (!currentCode.trim()) {
      setError("Please enter some code to review.");
      setReviewReport(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setReviewReport(null);

    // process.env.API_KEY is expected to be set in the execution environment
    
    try {
      const report = await reviewCodeWithGemini(currentCode, language);
      setReviewReport(report);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during the review.");
      }
      console.error("Review Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-4 md:p-8 flex flex-col">
      <header className="mb-6 md:mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400">
          AI Code Reviewer
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Get instant, advanced feedback on your code.
        </p>
      </header>

      <main className="flex-grow container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
          <CodeInput
            initialCode={code}
            initialLanguage={selectedLanguage}
            onCodeChange={setCode}
            onLanguageChange={setSelectedLanguage}
            onReviewRequest={() => handleReviewRequest(code, selectedLanguage)}
            isLoading={isLoading}
          />
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 min-h-[400px] md:h-auto md:max-h-[calc(100vh-220px)] overflow-y-auto">
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
          {error && !isLoading && <ErrorDisplay message={error} />}
          {reviewReport && !isLoading && !error && <ReviewOutput report={reviewReport} />}
          {!isLoading && !error && !reviewReport && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-6 text-sky-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
              <h2 className="text-xl font-semibold text-slate-400 mb-2">Ready for Review</h2>
              <p className="text-sm max-w-sm">
                Paste your code in the editor, select the language, and click "Review Code" to get an AI-powered analysis.
                The review will highlight potential issues, suggest improvements, and assess code complexity.
              </p>
            </div>
          )}
        </div>
      </main>
       <footer className="text-center mt-8 py-4 text-slate-500 text-sm">
        <p>Powered by Sandipan Majumder</p>
        <a href="https://github.com/Sandipan2005" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-sky-400 transition-colors">
          <GithubIcon className="w-4 h-4 mr-1" /> View on GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;