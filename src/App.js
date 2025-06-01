import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Login';
import SignupPage from './components/Signup';
import StockPage from './StockPage';
import StockMain from "./StockMain";
import StockDetail from "./StockDetail";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = 로딩중
  
  useEffect(() => {
    // 로그인 상태 확인
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('인증된 사용자:', userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('인증 확인 실패:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <StockMain /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/stock" 
          element={isAuthenticated ? <StockPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/stock/:symbol" 
          element={isAuthenticated ? <StockDetail /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
