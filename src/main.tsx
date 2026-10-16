import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedDemoData } from './services/seedService';
import { seedDemoParents } from './services/parentService';

seedDemoData();
seedDemoParents();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
