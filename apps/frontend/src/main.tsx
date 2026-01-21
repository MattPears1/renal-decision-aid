import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize i18n
import './config/i18n';

// Initial loading fallback component (before i18n is ready)
function InitialLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-nhs-pale-grey border-t-nhs-blue rounded-full animate-spin" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<InitialLoader />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
