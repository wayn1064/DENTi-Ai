import { useState, useEffect } from 'react';
import axios from 'axios';
import { Archive, Plus, ShieldCheck, ShieldAlert, FileSignature, Loader2, ClipboardX } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';

interface SterilizationLog {
  id: string;
  date: string;
  time: string;
  equipment: string;
  cycleNumber: string;
  items: string;
  operator: string;
  sporeTestResult: 'PASS' | 'FAIL' | 'PENDING' | 'N/A' | string;
}

const SporeBadge = ({ result }: { result: SterilizationLog['sporeTestResult'] }) => {
  switch (result) {
    case 'PASS':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-xs font-bold w-fit"><ShieldCheck size={14} /> 적합 (Pass)</span>;
    case 'FAIL':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold w-fit"><ShieldAlert size={14} /> 부적합 (Fail)</span>;
    case 'PENDING':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold w-fit"><Archive size={14} /> 배양 중</span>;
    case 'N/A':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-bold w-fit">해당 없음</span>;
    default:
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-bold w-fit">{result}</span>;
  }
};

const SupplySterilization = () => {
  const [logs, setLogs] = useState<SterilizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ equipment: 'Autoclave A (B-Class)', cycleType: 'Standard 121°C', items: '', operator: '' });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/supply/sterilization?hospitalId=WAYN-001');
        const dbLogs = res.data.map((log: any) => {
           const logDate = new Date(log.runDate);
           return {
             ...log,
             date: logDate.toLocaleDateString(),
             time: logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           };
        });
        setLogs(dbLogs);
      } catch (err) {
        console.error('Failed to fetch sterilization logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">멸균 및 소독 내역</h1>
          <p className="text-[#6B7280] mt-1">JCI 및 보건소 감염관리 평가 대비용 전자 멸균 일지 및 Spore Test 결과를 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#16A34A] text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition shadow-sm whitespace-nowrap active:scale-95"
        >
          <Plus size={18} />
          새 일지 작성
        </button>
      </header>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-sm font-semibold text-gray-500 tracking-wide">
                <th className="py-4 px-6">작동 일시</th>
                <th className="py-4 px-6">멸균 장비 및 사이클</th>
                <th className="py-4 px-6">멸균 품목 요약</th>
                <th className="py-4 px-6">책임자</th>
                <th className="py-4 px-6">생물학적 인디케이터 (Spore Test)</th>
                <th className="py-4 px-6 text-right">전자 서명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mb-4 mx-auto" size={32} />
                    <p>데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <ClipboardX size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>등록된 멸균 및 소독 일지가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-green-50/30 transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{log.date}</span>
                        <span className="text-sm text-gray-500">{log.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1A365D] block">{log.equipment}</span>
                        <span className="text-xs text-gray-400 mt-0.5 font-mono">Cycle: {log.cycleNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">{log.items}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{log.operator}</td>
                    <td className="py-4 px-6">
                      <SporeBadge result={log.sporeTestResult} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-400 hover:text-[#16A34A] transition hover:scale-110" title="서명 확인">
                        <FileSignature size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="전자 멸균 일지 등록"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">취소</button>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold bg-[#16A34A] text-white hover:bg-green-700 shadow-md transition flex items-center gap-2">
              <FileSignature size={16} /> 전자서명 및 등록
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">멸균 장비 <span className="text-red-500">*</span></label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
              >
                <option value="Autoclave A (B-Class)">Autoclave A (B-Class)</option>
                <option value="Autoclave B (S-Class)">Autoclave B (S-Class)</option>
                <option value="EO Gas 멸균기">EO Gas 멸균기</option>
                <option value="플라즈마 멸균기">플라즈마 멸균기</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">사이클 프로그램 <span className="text-red-500">*</span></label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                value={formData.cycleType}
                onChange={(e) => setFormData({...formData, cycleType: e.target.value})}
              >
                <option value="Standard 121°C">표준 121°C (30분)</option>
                <option value="Standard 134°C">표준 134°C (15분)</option>
                <option value="Prion 134°C">Prion 134°C (18분)</option>
                <option value="Fast Cycle">급속 (핸드피스)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">멸균 품목 요약 <span className="text-red-500">*</span></label>
            <textarea 
              rows={2} 
              placeholder="예: 기본 기구 10세트, 발치 기구 3세트" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              value={formData.items}
              onChange={(e) => setFormData({...formData, items: e.target.value})}
            />
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <div>
                   <h4 className="font-bold text-blue-900 text-sm">Spore Test (생물학적 인디케이터) 삽입 여부</h4>
                   <p className="text-xs text-blue-700/70 mt-0.5">최소 주 1회 또는 각막/임플란트 수술용 기구 멸균 시 필수입니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
             </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">담당자 서명명 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="담당자명 (예: 김수진)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.operator}
              onChange={(e) => setFormData({...formData, operator: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplySterilization;
