import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './Assets/Styles/global.css';
import './Assets/Styles/ui.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);