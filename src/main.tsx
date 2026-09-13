import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { GameProfileProvider } from './context/GameProfileContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <GameProfileProvider>
        <App />
      </GameProfileProvider>
    </LanguageProvider>
  </StrictMode>,
);
