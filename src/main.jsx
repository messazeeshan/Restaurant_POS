import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import CustomerApp from './components/customer/CustomerApp.jsx';
import './index.css';

const isCustomerView = new URLSearchParams(window.location.search).get('view') === 'customer';

createRoot(document.getElementById('root')).render(
  isCustomerView ? <CustomerApp /> : <App />
);
