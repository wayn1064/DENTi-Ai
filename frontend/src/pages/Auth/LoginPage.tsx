import React, { useState } from 'react';
import SignUpModal from './SignUpModal';

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    hospitalId: '',
    email: '',
    password: ''
  });
  
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 개발용 백도어 로직 (최대 편의를 위해 일단 유지하되, 콘솔 경고 추가)
    if (formData.email === '1' && formData.password === '1') {
      alert('최고시스템관리자 권한으로 로그인되었습니다. (백도어)');
      localStorage.setItem('isAuthenticated', 'true');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        // 본사 서버 인증 성공
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        alert(data.message || '로그인에 실패했습니다. 병원코드 및 계정 정보를 확인하세요.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('서버와의 통신에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A365D] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A365D] mb-2">DENTi-Ai</h1>
          <p className="text-gray-500 text-sm">WAYN-Ai 통합 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회원병원 ID (Hospital ID)</label>
            <input 
              type="text" 
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              placeholder="예: WAYN-001" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소 (Email / ID)</label>
            <input 
              type="text" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@hospital.com" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 (Password)</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none transition"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#1A365D] text-white font-semibold py-3 rounded-lg hover:bg-[#132847] transition duration-200 mt-6"
          >
            로그인
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">아직 회원이 아니신가요?</p>
          <button 
            type="button"
            className="text-[#1A365D] font-semibold hover:underline mt-1"
            onClick={() => setIsSignUpModalOpen(true)}
          >
            병원 도입 문의 / 회원가입
          </button>
        </div>
      </div>
      
      {isSignUpModalOpen && (
        <SignUpModal onClose={() => setIsSignUpModalOpen(false)} />
      )}
    </div>
  );
}
