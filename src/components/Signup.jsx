import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  const [validation, setValidation] = useState({
    email: { available: null, message: '', checked: false },
    nickname: { available: null, message: '', checked: false }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 입력값이 변경되면 중복 확인 상태 초기화
    if (name === 'email' || name === 'nickname') {
      setValidation(prev => ({
        ...prev,
        [name]: { available: null, message: '', checked: false }
      }));
    }
  };

  // 이메일 중복 확인
  const checkEmail = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      setValidation(prev => ({
        ...prev,
        email: { available: false, message: '올바른 이메일 형식이 아닙니다', checked: true }
      }));
      return;
    }

    console.log('📧 이메일 중복 확인:', formData.email);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);

      const response = await fetch('http://localhost:8000/auth/check-email', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('📡 이메일 확인 응답:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 이메일 확인 결과:', result);
        setValidation(prev => ({
          ...prev,
          email: { 
            available: result.available, 
            message: result.message,
            checked: true 
          }
        }));
      } else {
        const errorData = await response.json();
        console.error('❌ 이메일 확인 실패:', errorData);
        setValidation(prev => ({
          ...prev,
          email: { available: false, message: errorData.detail || '이메일 확인 중 오류가 발생했습니다', checked: true }
        }));
      }
    } catch (error) {
      console.error('🚨 이메일 확인 네트워크 에러:', error);
      setValidation(prev => ({
        ...prev,
        email: { available: false, message: '서버 연결 오류가 발생했습니다', checked: true }
      }));
    }
  };

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!formData.nickname || formData.nickname.length < 2 || formData.nickname.length > 20) {
      setValidation(prev => ({
        ...prev,
        nickname: { available: false, message: '닉네임은 2~20자리여야 합니다', checked: true }
      }));
      return;
    }

    console.log('👤 닉네임 중복 확인:', formData.nickname);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nickname', formData.nickname);

      const response = await fetch('http://localhost:8000/auth/check-nickname', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('📡 닉네임 확인 응답:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 닉네임 확인 결과:', result);
        setValidation(prev => ({
          ...prev,
          nickname: { 
            available: result.available, 
            message: result.message,
            checked: true 
          }
        }));
      } else {
        const errorData = await response.json();
        console.error('❌ 닉네임 확인 실패:', errorData);
        setValidation(prev => ({
          ...prev,
          nickname: { available: false, message: errorData.detail || '닉네임 확인 중 오류가 발생했습니다', checked: true }
        }));
      }
    } catch (error) {
      console.error('🚨 닉네임 확인 네트워크 에러:', error);
      setValidation(prev => ({
        ...prev,
        nickname: { available: false, message: '서버 연결 오류가 발생했습니다', checked: true }
      }));
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = () => {
    return (
      validation.email.available &&
      validation.nickname.available &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 회원가입 시도:', formData);
    
    // 유효성 검사
    if (!validation.email.available) {
      setError('이메일 중복 확인을 완료해주세요.');
      return;
    }
    
    if (!validation.nickname.available) {
      setError('닉네임 중복 확인을 완료해주세요.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('nickname', formData.nickname);

      console.log('📤 회원가입 데이터 전송:', {
        email: formData.email,
        password: '****',
        nickname: formData.nickname
      });

      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      console.log('📡 회원가입 응답 상태:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ 회원가입 성공:', userData);
        
        // 회원가입 성공 시 자동 로그인되므로 대시보드로 이동
        alert('회원가입이 완료되었습니다!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('❌ 회원가입 실패:', errorData);
        setError(errorData.detail || errorData.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('🚨 회원가입 네트워크 에러:', error);
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
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            새 계정을 만드세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이메일을 입력하세요"
                />
                <button
                  type="button"
                  onClick={checkEmail}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  확인
                </button>
              </div>
              {validation.email.checked && (
                <p className={`text-xs mt-1 ${validation.email.available ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.email.message}
                </p>
              )}
            </div>
            
            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임 (2~20자)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  minLength={2}
                  maxLength={20}
                  value={formData.nickname}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="채팅에서 사용할 닉네임"
                />
                <button
                  type="button"
                  onClick={checkNickname}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  확인
                </button>
              </div>
              {validation.nickname.checked && (
                <p className={`text-xs mt-1 ${validation.nickname.available ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.nickname.message}
                </p>
              )}
            </div>
            
            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 (최소 6자)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs mt-1 text-red-600">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
