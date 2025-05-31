import React from 'react';

const LoginPage = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>로그인/회원가입</h2>
      <form style={styles.form}>
        <input type="text" placeholder="아이디" style={styles.input} />
        <div style={styles.passwordContainer}>
          <input type="password" placeholder="비밀번호" style={styles.input} />
          <span style={styles.eyeIcon}>👁️</span>
        </div>
        <button type="submit" style={styles.loginButton}>로그인</button>
      </form>

      <button
        style={styles.kakaoButton}
        onClick={() => {
          // TODO: 카카오 로그인 URL로 리다이렉트
          window.location.href = 'http://localhost:8000/api/auth/kakao/callback';
        }}
      >
        💬 카카오 로그인
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
    border: '1px solid #ccc',
    borderRadius: '8px'
  },
  title: {
    fontSize: '1.2rem',
    marginBottom: '1rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box' // ✅ 크기 맞춤
  },
  passwordContainer: {
    position: 'relative'
  },
  eyeIcon: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    cursor: 'pointer'
  },
  loginButton: {
    backgroundColor: 'black',
    color: 'white',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '4px',
    width: '100%',
    cursor: 'pointer'
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    border: 'none' // ✅ 파란색 네모 제거
  },
  findInfo: {
    color: '#666'
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    color: 'black',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '4px',
    width: '100%',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};

export default LoginPage;
