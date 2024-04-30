import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as Sentry from "@sentry/react";

Sentry.init({
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  dsn: "https://11abcb57930e503bf5003f07e720a08f@o4507168918601728.ingest.us.sentry.io/4507168922402816",
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
