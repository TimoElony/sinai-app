import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://26467e2d4dfb22cf077bbaec75f56680@o4509323518148608.ingest.de.sentry.io/4509323520376912",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
