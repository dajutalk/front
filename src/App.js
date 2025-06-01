import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Login';
import SignupPage from './components/Signup';
import StockPage from './StockPage';
import StockMain from "./StockMain";
import StockDetail from "./StockDetail";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 인증 상태 확인 중...');
        
        // 카카오 로그인 콜백인지 확인
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          console.log('🥕 카카오 로그인 콜백 감지, 인증 확인 생략');
          setIsAuthenticated(false); // 로그인 페이지에서 콜백 처리하도록
          setIsLoading(false);
          return;
        }
        
        // 네트워크 연결 먼저 확인
        const healthResponse = await fetch('http://localhost:8000/health', {
          credentials: 'include'
        });
        
        if (!healthResponse.ok) {
          console.error('🚨 서버 연결 실패');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });
        
        console.log('📡 인증 응답 상태:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ 인증된 사용자:', userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ 인증 실패 - 로그인 필요');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('🚨 인증 확인 중 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 기본 경로 - 인증 상태에 따라 분기 */}
        <Route 
          path="/" 
          element={
            isAuthenticated === true 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* 인증되지 않은 사용자용 라우트 */}
        <Route 
          path="/login" 
          element={
            isAuthenticated === true 
              ? <Navigate to="/dashboard" replace /> 
              : <LoginPage />
          } 
        />
        <Route 
          path="/signup" 
          element={
            isAuthenticated === true 
              ? <Navigate to="/dashboard" replace /> 
              : <SignupPage />
          } 
        />
        
        {/* 인증된 사용자용 라우트 */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated === true 
              ? <StockMain /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/stock" 
          element={
            isAuthenticated === true 
              ? <StockPage /> 
              : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/stock/:symbol" 
          element={
            isAuthenticated === true 
              ? <StockDetail /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        {/* 404 처리 */}
        <Route 
          path="*" 
          element={
            isAuthenticated === true 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
