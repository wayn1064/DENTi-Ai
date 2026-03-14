import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, AlertCircle, Package, Loader2 } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { mockPubSub } from '../../../../shared/lib/mockPubSub';
import { createApprovalChain } from '../../../../shared/lib/approvalFactory';
import type { ApprovalStep, ModuleType } from '../../../../shared/lib/approvalFactory';

interface OrderItem {
  id: string;
  orderNumber: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: 'PENDING_APPROVAL' | 'ORDERED' | 'DELIVERED' | string;
  requestDate: string;
  requester: string;
  approvalChain: ApprovalStep[];
  currentStepIndex: number;
}

// 병원의 활성화된 모듈 상태 시뮬레이션 (A: 중앙공급실 단독, B: 풀 패키지)
const MOCK_ACTIVE_MODULES_B: ModuleType[] = ['SUPPLY', 'HR', 'CLINIC', 'DIRECTOR'];

const OrderStatusBadge = ({ status }: { status: OrderItem['status'] }) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold w-fit"><Clock size={14} /> 결재 대기중</span>;
    case 'ORDERED':
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold w-fit"><AlertCircle size={14} /> 발주 진행 중</span>;
    case 'DELIVERED':
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold w-fit"><CheckCircle2 size={14} /> 입고 완료</span>;
    default:
      return <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold w-fit">{status}</span>;
  }
};

const SupplyOrders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ itemName: '', quantity: 1, urgency: 'NORMAL', reason: '' });
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/supply/orders?hospitalId=WAYN-001');
        const dbOrders = res.data.map((order: any) => ({
          ...order,
          // Simulate approval chain for now until Approval engine is fully linked
          approvalChain: createApprovalChain(MOCK_ACTIVE_MODULES_B),
          currentStepIndex: order.status === 'DELIVERED' ? 4 : 1,
          requestDate: order.requestDate ? new Date(order.requestDate).toLocaleDateString() : '-'
        }));
        setOrders(dbOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderSubmit = () => {
    // 의존성 분리 (원장실로 바로 호출하지 않고 이벤트 버스 사용)
    mockPubSub.publish('APPROVAL_REQUESTED', {
      department: '중앙공급실',
      item: `${formData.itemName} (${formData.quantity}개)`,
      timestamp: new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING_APPROVAL').length;
  const orderedCount = orders.filter(o => o.status === 'ORDERED').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">발주 관리</h1>
          <p className="text-[#6B7280] mt-1">부서별 발주 요청을 확인하고 원장실 결재 및 입고 상태를 추적합니다.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1A365D] text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-900 transition shadow-sm whitespace-nowrap active:scale-95"
        >
          <Package size={18} />
          새 발주 요청
        </button>
      </header>

      {/* Orders View */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex gap-6 overflow-x-auto">
          {/* 간이 칸반 보드 카드 요약 (데스크탑) */}
          <div className="min-w-[200px] flex-1 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <h3 className="font-bold text-amber-800 mb-1 flex items-center gap-2"><Clock size={16} /> 결재 대기</h3>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}<span className="text-sm font-medium ml-1">건</span></p>
          </div>
          <div className="min-w-[200px] flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-2"><AlertCircle size={16} /> 발주 진행 중</h3>
            <p className="text-2xl font-bold text-blue-600">{orderedCount}<span className="text-sm font-medium ml-1">건</span></p>
          </div>
          <div className="min-w-[200px] flex-1 bg-green-50/50 p-4 rounded-xl border border-green-100">
            <h3 className="font-bold text-green-800 mb-1 flex items-center gap-2"><CheckCircle2 size={16} /> 입고 완료</h3>
            <p className="text-2xl font-bold text-green-600">{deliveredCount}<span className="text-sm font-medium ml-1">건</span></p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-sm font-semibold text-gray-500">
                <th className="py-4 px-6">발주 번호</th>
                <th className="py-4 px-6">품목명 (수량)</th>
                <th className="py-4 px-6">요청자</th>
                <th className="py-4 px-6">요청 일자</th>
                <th className="py-4 px-6 text-center">진행 상태</th>
                <th className="py-4 px-6 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mb-4 mx-auto" size={32} />
                    <p>발주 데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>등록된 발주 내역이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <Fragment key={order.id}>
                    <tr 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="py-4 px-6 text-sm text-gray-500 font-medium">{order.orderNumber}</td>
                      <td className="py-4 px-6 font-bold text-gray-800">
                        {order.itemName} <span className="text-sm font-medium text-gray-500">x {order.quantity}{order.unit}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{order.requester}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{order.requestDate}</td>
                      <td className="py-4 px-6 flex justify-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-sm font-semibold text-[#16A34A] hover:text-green-800 p-2 rounded hover:bg-green-50 transition">
                          {expandedOrderId === order.id ? '접기' : '결재선 보기'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-blue-50/10 border-b border-gray-100">
                        <td colSpan={6} className="px-6 py-6 border-l-4 border-[#1A365D]">
                          <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <AlertCircle size={16} className="text-[#1A365D]" /> 라이선스 기반 동적 결재선 진행 현황
                              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 ml-2">
                                {order.approvalChain.length}단계 결재 체인
                              </span>
                            </h4>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
                              {order.approvalChain.map((step, idx) => {
                                const isCompleted = idx < order.currentStepIndex;
                                const isCurrent = idx === order.currentStepIndex;
                                
                                return (
                                  <div key={idx} className="flex items-center shrink-0">
                                    <div className={`flex flex-col items-center justify-center p-3 w-32 rounded-xl border ${
                                      isCompleted ? 'bg-[#1A365D] border-[#1A365D] text-white shadow-md' :
                                      isCurrent ? 'bg-white border-[#1A365D] border-2 text-[#1A365D] shadow-sm' :
                                      'bg-gray-50 border-gray-200 text-gray-400'
                                    }`}>
                                      <span className="text-xs font-semibold mb-1 opacity-80">STEP {idx + 1}</span>
                                      <span className="font-bold text-sm text-center">{step.name}</span>
                                      {isCompleted && <CheckCircle2 size={14} className="mt-1.5" />}
                                      {isCurrent && <Clock size={14} className="mt-1.5 animate-pulse" />}
                                    </div>
                                    {idx < order.approvalChain.length - 1 && (
                                      <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-[#1A365D]' : 'bg-gray-300'}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {order.currentStepIndex < order.approvalChain.length - 1 && (
                              <div className="flex justify-end mt-2 content-end">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    mockPubSub.publish('APPROVAL_STEP_COMPLETED', { orderId: order.id, step: order.currentStepIndex });
                                    alert(`[Simulated] ${order.approvalChain[order.currentStepIndex].name} 승인 처리됨`);
                                  }}
                                  className="bg-[#1A365D] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-900 transition flex items-center gap-2"
                                >
                                  {order.approvalChain[order.currentStepIndex].name} 승인
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="신규 발주 및 결재 요청"
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">취소</button>
            <button onClick={handleOrderSubmit} className="px-5 py-2 rounded-lg font-bold bg-[#1A365D] text-white hover:bg-blue-900 shadow-md transition">신청하기</button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">발주 품목명 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="예: 멸균 거즈 (10x10)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">수량 <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="1" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">긴급도</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
              >
                <option value="NORMAL">일반 (정기발주)</option>
                <option value="URGENT">긴급 (재고소진)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">결재 요청 사유</label>
            <textarea 
              rows={3} 
              placeholder="결재권자(원장님)에게 전달할 메모를 작성하세요." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplyOrders;
