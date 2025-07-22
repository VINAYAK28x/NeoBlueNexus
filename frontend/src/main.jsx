import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { CustomerProvider } from './CustomerContext.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
<CustomerProvider>
<App />
        </CustomerProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);