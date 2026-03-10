import { useState } from 'react';
import FormEngine, { type AnswerMap } from './components/FormEngine';
import formConfig from './data/formConfig.json';
import { submitToGoogleForm } from './utils/submitToGoogleForm';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Type assertion since imported JSON doesn't exactly match TS types automatically
  // but matches the structure at runtime
  const config = formConfig as any;

  const handleSubmit = async (answers: AnswerMap, pageHistory: string) => {
    setIsSubmitting(true);
    const success = await submitToGoogleForm(config.formId, answers, pageHistory);
    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    } else {
      alert("There was an issue submitting your response. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Thank You!</h1>
          <p className="text-slate-600 text-lg">Your responses have been recorded successfully in the Google Form.</p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-6 text-slate-600 font-medium animate-pulse">Saving responses...</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-block p-4 rounded-2xl bg-blue-100/50 mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Understanding Learning Ecosystems
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            A short survey to understand how different roles perceive the current education and learning environment.
          </p>
          <button
            onClick={() => setIsStarted(true)}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-10 py-4 rounded-full shadow-xl shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95"
          >
            Start Survey
          </button>
        </div>
      </div>
    );
  }

  return <FormEngine config={config} onSubmit={handleSubmit} />;
}

export default App;
