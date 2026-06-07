import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';
import { initCapacitorPlugins } from './lib/notifications';

// Initialize Capacitor native plugins (safe no-op on web)
initCapacitorPlugins().catch(console.warn);

// Register web service worker only for non-hybrid (plain browser) environments
// Capacitor handles native push notifications for iOS/Android
if (Capacitor.getPlatform() === 'web' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed — app works without it
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);