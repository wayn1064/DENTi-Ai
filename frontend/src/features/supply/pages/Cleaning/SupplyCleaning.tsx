import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardCheck, Droplets, User, Calendar, Plus, Loader2, ClipboardX } from 'lucide-react';

interface CleaningLog {
  id: string;
  zone: '대기실' | '진료실' | '기공실' | '중앙공급실' | string;
  date: string;
  checkedBy: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | string;
  notes: string;
}

const StatusBadge = ({ status }: { status: CleaningLog['status'] }) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-md text-xs font-bold w-fit"><ClipboardCheck size={14} /> 점검 완료</span>;
    case 'IN_PROGRESS':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold w-fit"><Droplets size={14} /> 진행 중</span>;
    case 'PENDING':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-bold w-fit">대기 중</span>;
    default:
      return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-bold w-fit">{status}</span>;
  }
};

const SupplyCleaning = () => {
  const [logs, setLogs] = useState<CleaningLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/supply/cleaning?hospitalId=WAYN-001');
        const dbLogs = res.data.map((log: any) => ({
          ...log,
          date: log.date ? new Date(log.date).toLocaleDateString() : '-'
        }));
        setLogs(dbLogs);
      } catch (err) {
        console.error('Failed to fetch cleaning logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">청소관리</h1>
          <p className="text-[#6B7280] mt-1">병원 내 각 구역(Zone)별 청소 상태와 감염관리 체크리스트 이행 여부를 기록합니다.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#16A34A] text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition shadow-sm whitespace-nowrap">
          <Plus size={18} />
          점검표 작성
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['대기실', '진료실', '기공실', '중앙공급실'].map((zone) => {
          const log = logs.find(l => l.zone === zone && l.date === new Date().toLocaleDateString());
          const isCompleted = log?.status === 'COMPLETED';
          
          return (
            <div key={zone} className={`p-5 rounded-2xl border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'} transition-colors`}>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{zone}</h3>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">금일 상태</span>
                {log ? <StatusBadge status={log.status} /> : <span className="text-sm font-bold text-gray-400">데이터 없음</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Calendar size={20} className="text-[#16A34A]" /> 최근 점검 일지</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-sm font-semibold text-gray-500">
                <th className="py-4 px-6">점검 일자</th>
                <th className="py-4 px-6">관리 구역</th>
                <th className="py-4 px-6">점검자</th>
                <th className="py-4 px-6">진행 상태</th>
                <th className="py-4 px-6">특이사항 (Notes)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mb-4 mx-auto" size={32} />
                    <p>데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <ClipboardX size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>등록된 청소 관리 내역이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">{log.date}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">{log.zone}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 flex items-center gap-2">
                      <div className="bg-gray-200 p-1.5 rounded-full"><User size={14} className="text-gray-500" /></div>
                      {log.checkedBy}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{log.notes || '-'}</td>
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

export default SupplyCleaning;
