import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Login';
import StockPage from './StockPage';
import StockMain from "./StockMain";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<StockMain />} />
        <Route path="/stock" element={<StockPage />} />
      </Routes>
    </Router>
  );
}

export default App;
