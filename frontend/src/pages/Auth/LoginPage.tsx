import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    hospitalId: '', // 로그인용 (WAYN-Ai 부여)
    hospitalName: '', // 가입용 (병원 실명)
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const getApiUrl = () => {
    return import.meta.env.VITE_WAYN_AI_API_URL || 'http://localhost:5001';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 개발용 백도어 로직
    if (isLoginMode && formData.email === '1' && formData.password === '1') {
      alert('최고시스템관리자 권한으로 로그인되었습니다. (백도어)');
      localStorage.setItem('isAuthenticated', 'true');
      if (onLoginSuccess) onLoginSuccess();
      return;
    }

    setIsLoading(true);
    try {
      const BASE_URL = getApiUrl();
      
      if (isLoginMode) {
        // 로그인 로직
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          hospitalCode: formData.hospitalId,
          email: formData.email,
          password: formData.password
        });
  
        if (response.status === 200) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data));
          
          if (onLoginSuccess) onLoginSuccess();
        }
      } else {
        // 회원가입 로직
        const response = await axios.post(`${BASE_URL}/api/tenants/join`, {
          hospitalName: formData.hospitalName,
          email: formData.email,
          password: formData.password
        });
  
        if (response.status === 201 || response.status === 200) {
          alert("가입 내역이 본사로 전송되었습니다.\n승인 대기 중 상태이며, 승인 시 부여된 회원병원 ID로 로그인 가능합니다.");
          setIsLoginMode(true); // 가입 성공 후 로그인 탭으로 자동 이동
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('서버와의 통신에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A365D] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1A365D] mb-2">DENTi-Ai</h1>
          <p className="text-gray-500 text-sm">WAYN-Ai 통합 계정 서비스</p>
        </div>

        <div className="flex rounded-md bg-gray-100 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${isLoginMode ? 'bg-white text-[#1A365D] shadow' : 'text-gray-500'}`}
            onClick={() => setIsLoginMode(true)}
          >
            기존 병원 로그인
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${!isLoginMode ? 'bg-white text-[#1A365D] shadow' : 'text-gray-500'}`}
            onClick={() => setIsLoginMode(false)}
          >
            신규 도입 문의
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isLoginMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본사 부여 회원병원 ID</label>
              <input 
                type="text" 
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                placeholder="예: WAYN-001" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] outline-none"
                required 
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">운영 중인 병원명</label>
              <input 
                type="text" 
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="예: 서울미소치과" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] outline-none"
                required 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@hospital.com" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] outline-none"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1A365D] outline-none"
              required 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1A365D] text-white font-semibold py-3 rounded-lg hover:bg-[#132847] transition disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '승인 요청하기')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
