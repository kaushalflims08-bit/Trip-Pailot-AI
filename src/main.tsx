import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline Service Worker for PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
