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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

  const handleKakaoLogin = () => {
    console.log('🥕 카카오 로그인 시도');
    // 백엔드 API 문서에 맞는 엔드포인트로 리다이렉트
    window.location.href = 'http://localhost:8000/auth/kakao/redirect';
  };

  // 카카오 로그인 콜백 처리 (페이지 로드 시 URL 파라미터 확인)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      console.log('🥕 카카오 로그인 콜백 감지:', { code, state });
      handleKakaoCallback(code, state);
    }
  }, []);

  const handleKakaoCallback = async (code, state) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🥕 카카오 콜백 처리 중...', { code, state });
      
      // 백엔드의 카카오 콜백 엔드포인트로 POST 요청
      const response = await fetch('http://localhost:8000/auth/kakao/callback', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          state: state
        })
      });

      console.log('📡 카카오 콜백 응답 상태:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ 카카오 로그인 성공:', userData);
        
        // 로그인 성공 시 대시보드로 이동
        navigate('/dashboard');
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('❌ 카카오 로그인 실패:', errorData);
        setError(errorData.detail || '카카오 로그인에 실패했습니다.');
        
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('🚨 카카오 로그인 에러:', error);
      setError('카카오 로그인 중 오류가 발생했습니다.');
      
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
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
            
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span>처리 중...</span>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.09 0 2.14-.18 3.12-.5-.55-.83-.87-1.82-.87-2.88 0-2.93 2.38-5.31 5.31-5.31.34 0 .68.03 1.01.08C21.48 8.89 17.09 2 12 2z"/>
                  </svg>
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
