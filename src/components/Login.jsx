import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 카카오 로그인 완료 후 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('login');
    const errorStatus = urlParams.get('error');
    
    if (loginStatus === 'success') {
      console.log('✅ 카카오 로그인 성공 감지');
      
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // 로그인 전 페이지로 돌아가거나 대시보드로 이동
      const beforeLogin = localStorage.getItem('beforeKakaoLogin');
      localStorage.removeItem('beforeKakaoLogin');
      
      if (beforeLogin && beforeLogin !== '/login') {
        navigate(beforeLogin);
      } else {
        navigate('/dashboard');
      }
      
      // 인증 상태 업데이트
      window.location.reload();
      
    } else if (errorStatus === 'kakao_failed') {
      console.error('❌ 카카오 로그인 실패 감지');
      setError('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const handleKakaoLogin = () => {
    console.log('🥕 카카오 로그인 시작...');
    
    // 현재 페이지 URL을 저장 (로그인 후 돌아올 위치)
    localStorage.setItem('beforeKakaoLogin', window.location.pathname);
    
    // 카카오 로그인 시작
    window.location.href = 'http://localhost:8000/auth/kakao/redirect';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);

      console.log('📤 로그인 시도:', { email: formData.email, password: '****' });

      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      console.log('📡 로그인 응답 상태:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ 로그인 성공:', userData);
        
        // 로그인 성공 시 대시보드로 이동
        navigate('/dashboard');
        
        // 페이지 새로고침으로 앱 전체 인증 상태 업데이트
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('❌ 로그인 실패:', errorData);
        setError(errorData.detail || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('🚨 로그인 네트워크 에러:', error);
      setError('네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정에 로그인하세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요 (최소 6자)"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            
            {/* 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: '#FEE500',
                color: '#000'
              }}
            >
              {isLoading ? (
                <span>처리 중...</span>
              ) : (
                <>
                  <span className="text-lg mr-2">🟡</span>
                  카카오로 로그인
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
