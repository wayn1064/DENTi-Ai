import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, PhoneCall, CheckCircle2, AlertTriangle, Plus, Loader2, ClipboardX } from 'lucide-react';

interface AsRequest {
  id: string;
  equipmentName: string;
  vendor: string;
  requestDate: string;
  issue: string;
  status: 'REPAIR_IN_PROGRESS' | 'REPAIR_COMPLETED' | 'NEED_INSPECTION' | string;
  isLoanerUsed: boolean;
}

const StatusBadge = ({ status }: { status: AsRequest['status'] }) => {
  switch (status) {
    case 'REPAIR_COMPLETED':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-xs font-bold w-fit"><CheckCircle2 size={14} /> 수리 완료</span>;
    case 'REPAIR_IN_PROGRESS':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold w-fit"><Wrench size={14} /> 수리 진행 중</span>;
    case 'NEED_INSPECTION':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold w-fit"><AlertTriangle size={14} /> 점검 필요</span>;
    default:
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-bold w-fit">{status}</span>;
  }
};

const SupplyAs = () => {
  const [logs, setLogs] = useState<AsRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/supply/as?hospitalId=WAYN-001');
        const dbLogs = res.data.map((log: any) => ({
          ...log,
          requestDate: log.requestDate ? new Date(log.requestDate).toLocaleDateString() : '-'
        }));
        setLogs(dbLogs);
      } catch (err) {
        console.error('Failed to fetch AS logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const inProgressCount = logs.filter(l => l.status === 'REPAIR_IN_PROGRESS').length;
  const loanerUsedCount = logs.filter(l => l.isLoanerUsed).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">장비 A/S 관리</h1>
          <p className="text-[#6B7280] mt-1">병원 내 주요 의료 장비의 고장 신고, 수리 진행 상태 및 대체 장비 현황을 추적합니다.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#16A34A] text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition shadow-sm whitespace-nowrap">
          <Plus size={18} />
          A/S 접수하기
        </button>
      </header>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-gray-500 mb-2">진행 중인 A/S</h3>
            <p className="text-3xl font-bold text-[#16A34A]">{inProgressCount}<span className="text-sm text-gray-400 ml-1 font-medium">건</span></p>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center border-l-4 border-l-amber-500">
            <h3 className="font-bold text-gray-500 mb-2">대체 장비(Loaner) 운용</h3>
            <p className="text-3xl font-bold text-amber-600">{loanerUsedCount}<span className="text-sm text-gray-400 ml-1 font-medium">건</span></p>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center cursor-pointer hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><PhoneCall size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-800">주요 벤더 연락망</h3>
                <p className="text-sm text-blue-600 font-semibold mt-1">연락처 보기 &rarr;</p>
              </div>
            </div>
         </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-sm font-semibold text-gray-500">
                <th className="py-4 px-6">접수 번호 (일자)</th>
                <th className="py-4 px-6">장비명 및 모델</th>
                <th className="py-4 px-6">신고 내용 (증상)</th>
                <th className="py-4 px-6">담당 업체</th>
                <th className="py-4 px-6 text-center">대체 장비</th>
                <th className="py-4 px-6">처리 상태</th>
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
                    <p>등록된 A/S 접수 내역이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-500">{log.id}</span>
                        <span className="font-bold text-gray-800 mt-0.5">{log.requestDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <span className="font-bold text-[#1A365D] block">{log.equipmentName}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={log.issue}>
                      {log.issue}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                        {log.vendor}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {log.isLoanerUsed ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">사용중</span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplyAs;
