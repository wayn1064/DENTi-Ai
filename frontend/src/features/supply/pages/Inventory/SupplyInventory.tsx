import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Clock, Image as ImageIcon, Barcode, Hash, Building2, Calendar, Settings2, Package, Save, PackagePlus, Database, Download, ShoppingCart, Minus, X, ArrowRight, Loader2 } from 'lucide-react';
import { SlideOver } from '../../../../shared/ui/SlideOver';
import { Modal } from '../../../../shared/ui/Modal';

interface OrderQuantityProp {
  onAdd: (qty: number) => void;
}

const OrderQuantityInput = ({ onAdd }: OrderQuantityProp) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white w-24">
        <button 
          onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }} 
          className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition flex items-center justify-center border-r border-gray-200"
        >
          <Minus size={14} />
        </button>
        <input 
          type="text" 
          value={qty} 
          readOnly 
          className="w-full text-center text-sm font-bold focus:outline-none bg-transparent" 
        />
        <button 
          onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }} 
          className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition flex items-center justify-center border-l border-gray-200"
        >
          <Plus size={14} />
        </button>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onAdd(qty); setQty(1); }}
        className="bg-emerald-50 text-[#16A34A] p-2 rounded-lg hover:bg-emerald-100 transition shadow-sm border border-emerald-100" 
        title="장바구니 담기"
      >
        <ShoppingCart size={18} />
      </button>
    </div>
  );
};

// LOGiS-Ai 유통회사 제품마스터 DB Mock 데이터
const LOGIS_MASTER_DB = [
  { id: 'LOGIS-101', name: '오스템 TSIII SA Fixture (4.0x10)', category: '재료', barcode: '8801234567890', lot: 'LOT-2026-A1', price: 120000, currentStock: 0, safetyStock: 0, itemNo: 'OS-TS3-4010', size: '4.0x10', unit: 'EA', qty: 1, manufacturer: '오스템임플란트', importer: '', distributor: '오스템(직납)', expDate: '2029-12-31', isReported: true },
  { id: 'LOGIS-102', name: '3M Filtek Z350 (A2)', category: '재료', barcode: '8800987654321', lot: '3M-Z350-A2-25', price: 45000, currentStock: 0, safetyStock: 0, itemNo: '3M-Z350-A2', size: '4g', unit: 'Syr', qty: 1, manufacturer: '3M ESPE', importer: '한국쓰리엠', distributor: '신흥', expDate: '2028-06-30', isReported: true },
  { id: 'LOGIS-103', name: '멸균 거즈 (10x10)', category: '기타용품', barcode: '8801122334455', lot: 'GZ-2026-01', price: 15000, currentStock: 0, safetyStock: 0, itemNo: 'GZ-1010-200', size: '10x10cm', unit: 'Box', qty: 200, manufacturer: '대한위재', importer: '', distributor: '세일글로발', expDate: '2029-01-01', isReported: false },
  { id: 'LOGIS-104', name: '리도카인 앰플 (1:100,000)', category: '의약품', barcode: '8805544332211', lot: 'LD-2601-01', price: 25000, currentStock: 0, safetyStock: 0, itemNo: 'HU-LIDO-100', size: '1.8ml', unit: 'Box', qty: 50, manufacturer: '휴온스', importer: '', distributor: '휴온스메디케어', expDate: '2027-11-01', isReported: true },
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  safetyStock?: number; // fallback logic
  unit: string;
  size?: string;
  price?: number;
  expirationDate?: string;
  location?: string;
  vendor?: string;
  lastOrderDate?: string;
  notes?: string;
}

interface CartItem {
  item: InventoryItem;
  qty: number;
}

const CATEGORIES = ['전체', '재료', '의약품', '기구', '장비', '비품', '기타용품'];

const SupplyInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isMasterDBModalOpen, setIsMasterDBModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get('/api/supply/inventory?hospitalId=WAYN-001');
        setInventory(res.data);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredItems = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = selectedCategory === '전체' || item.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsSlideOverOpen(true);
  };

  const handleAddToCart = (item: InventoryItem, qty: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { item, qty }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const totalCartPrice = cart.reduce((sum, cartItem) => sum + ((cartItem.item.price || 0) * cartItem.qty), 0);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">재고 현황</h1>
          <p className="text-[#6B7280] mt-1">치과 내 모든 소모품, 기재, 약제의 실시간 재고와 유효기간을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMasterDBModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm whitespace-nowrap active:scale-95"
          >
            <Database size={18} />
            재료마스터불러오기
          </button>
          <button 
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex items-center gap-2 bg-[#16A34A] text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition shadow-sm whitespace-nowrap active:scale-95"
          >
            <Plus size={18} />
            신규 품목 등록
          </button>
        </div>
      </header>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="품목코드, 품목명, 카테고리 등 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition whitespace-nowrap font-medium active:scale-95">
            <Filter size={18} />
            상세 필터
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-1 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category 
                ? 'bg-[#16A34A] text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-sm font-bold text-slate-500 tracking-wide">
                <th className="py-4 px-6">품목 정보</th>
                <th className="py-4 px-6 text-center">카테고리</th>
                <th className="py-4 px-6 text-center">규격</th>
                <th className="py-4 px-6 text-right">단가</th>
                <th className="py-4 px-6 text-right">현재 재고 / 안전 재고</th>
                <th className="py-4 px-6 text-center">유통기한/상태</th>
                <th className="py-4 px-6 text-center">발주 수량/장바구니</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mb-4 mx-auto" size={32} />
                    <p>재고 데이터를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400">
                    <Search size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-500">'{searchTerm}'에 해당하는 품목이 없거나 등록된 재고가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const safetyStock = item.safetyStock ?? item.minStock ?? 0;
                  const isLowStock = item.currentStock < safetyStock;
                  let isExpiringSoon = false;
                  if (item.expirationDate) {
                    const today = new Date('2026-03-12');
                    const expDate = new Date(item.expirationDate);
                    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 30) isExpiringSoon = true;
                  }

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-green-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-800 text-base">{item.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{item.category}</span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">{item.size || '-'}</td>
                      <td className="py-4 px-6 text-right text-sm font-mono font-medium text-blue-700">
                        {item.price ? `${item.price.toLocaleString()}원` : '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <span className={`font-bold text-lg ${isLowStock ? 'text-red-500' : 'text-gray-900'}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-500 font-medium">{safetyStock} {item.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1.5">
                          {item.expirationDate ? (
                            <div className={`flex items-center gap-1 text-[0.7rem] font-bold ${isExpiringSoon ? 'text-amber-500 bg-amber-50 px-2 py-0.5 rounded' : 'text-gray-500 bg-gray-50 px-2 py-0.5 rounded'}`}>
                              <Clock size={12} /> {item.expirationDate.substring(2)}까지
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {isLowStock ? (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-600 rounded text-[0.7rem] font-bold w-full justify-center">
                              발주 필요
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[0.7rem] font-bold w-full justify-center">
                              적정 유지
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <OrderQuantityInput onAdd={(qty) => handleAddToCart(item, qty)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-400">
              <Search size={48} className="text-gray-200" />
              <p className="font-medium text-gray-500">'{searchTerm}'에 해당하는 품목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto overflow-hidden">
            <div className="bg-green-100 object-cover w-12 h-12 rounded-full flex items-center justify-center text-green-700 font-bold shadow-sm shrink-0">
              <ShoppingCart size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-lg flex items-center gap-2">
                발주 장바구니 
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}개 품목</span>
              </p>
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide mt-1 text-sm text-gray-600 pb-1 w-full max-w-[50vw]">
                {cart.map((cartItem) => (
                  <span key={cartItem.item.id} className="whitespace-nowrap flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                    {cartItem.item.name} <span className="font-bold text-green-700">{cartItem.qty}개</span>
                    <button onClick={() => removeFromCart(cartItem.item.id)} className="ml-1 text-gray-400 hover:text-red-500"><X size={14}/></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 pl-4 sm:border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500">총 예상 금액</p>
              <p className="text-2xl font-black text-gray-900 font-mono tracking-tight">{totalCartPrice.toLocaleString()}<span className="text-base font-bold ml-1">원</span></p>
            </div>
            <button className="bg-[#16A34A] text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center gap-2 whitespace-nowrap">
              발주서 작성 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 품목 상세 SlideOver 패널 */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="품목 상세 정보"
        footer={
          <div className="flex gap-3 w-full">
            <button className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition">수정</button>
            <button className="flex-1 bg-[#16A34A] text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition shadow-md">장바구니 담기</button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">{selectedItem.category}</span>
                <span className="text-gray-400 font-mono text-sm">{selectedItem.id}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">현재 재고</p>
                <p className={`text-2xl font-black ${selectedItem.currentStock < (selectedItem.safetyStock ?? selectedItem.minStock ?? 0) ? 'text-red-500' : 'text-[#16A34A]'}`}>
                  {selectedItem.currentStock} <span className="text-sm font-semibold text-gray-500">{selectedItem.unit}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">안전 재고 수준</p>
                <p className="text-lg font-bold text-gray-700">{selectedItem.safetyStock ?? selectedItem.minStock ?? 0} <span className="text-sm font-medium">{selectedItem.unit}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-800 border-b pb-2">기본 정보</h4>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="text-sm text-gray-500 font-medium">보관 위치</span>
                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{selectedItem.location}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="text-sm text-gray-500 font-medium">주요 거래처</span>
                <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">{selectedItem.vendor}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="text-sm text-gray-500 font-medium">최근 입고일</span>
                <span className="text-sm font-semibold text-gray-800">{selectedItem.lastOrderDate}</span>
              </div>
              
              {selectedItem.expirationDate && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                  <span className="text-sm text-gray-500 font-medium">유효 기간</span>
                  <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                    <Clock size={14} /> {selectedItem.expirationDate}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">특이사항 (Notes)</h4>
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 font-medium leading-relaxed">
                {selectedItem.notes || '등록된 특이사항이 없습니다.'}
              </div>
            </div>

          </div>
        )}
      </SlideOver>

      {/* 신규 품목 등록 Modal */}
      <Modal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        maxWidth="max-w-5xl lg:max-w-[70vw] w-full"
        title={
          <div className="flex items-center gap-2 text-green-800">
            <PackagePlus size={24} />
            <span>신규 품목 등록</span>
          </div>
        }
        footer={
          <>
            <button onClick={() => setIsNewItemModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">취소</button>
            <button onClick={() => setIsNewItemModalOpen(false)} className="px-5 py-2 rounded-lg font-bold bg-[#16A34A] text-white hover:bg-green-700 shadow-md transition flex items-center gap-2">
              <Save size={16} /> 등록하기
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* 상단: 제품명 및 카테고리 (1/2열 모두에 영향을 주는 상단 배치) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">제품명 <span className="text-red-500">*</span></label>
              <input type="text" placeholder="제품명을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">카테고리 <span className="text-red-500">*</span></label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium">
                {CATEGORIES.filter(c => c !== '전체').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1열 */}
            <div className="space-y-3">
              <h4 className="font-bold text-green-700 border-b pb-2 mb-3 flex items-center gap-2">
                <Package size={18} /> 품목 주요 정보
              </h4>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">제품 사진</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-xs font-semibold">클릭하여 파일 업로드 (또는 드래그)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">바코드</label>
                <div className="flex relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="바코드 스캐너 입력 가능" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">LOT 번호</label>
                <input type="text" placeholder="입고된 제품의 LOT 번호" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">공급 가격 (원)</label>
                <input 
                  type="text" 
                  placeholder="0" 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-right font-mono font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">현재 재고</label>
                  <input 
                    type="text" 
                    defaultValue="0" 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-green-700 text-right" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">안전 재고</label>
                  <input 
                    type="text" 
                    defaultValue="0" 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right font-bold text-amber-600" 
                  />
                </div>
              </div>
            </div>

            {/* 2열 */}
            <div className="space-y-3">
              <h4 className="font-bold text-blue-700 border-b pb-2 mb-3 flex items-center gap-2">
                <Settings2 size={18} /> 관리 상세 정보
              </h4>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">품목 번호</label>
                <div className="flex relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="내부 관리용 품목 번호" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">규격 (Size)</label>
                  <input type="text" placeholder="예: 4.0x10" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">포장 단위</label>
                  <input type="text" placeholder="EA, Box 등" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">수량</label>
                  <input 
                    type="text" 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      e.target.value = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }}
                    placeholder="수량" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-right font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">제조사</label>
                  <div className="flex relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="제조기업" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">수입사</label>
                  <input type="text" placeholder="수입 대행사 명" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">유통사</label>
                  <input type="text" placeholder="주요 납품 라인" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">유통 기한</label>
                  <div className="flex relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* 치과재료대 구입신고품목 항목 (이동됨) */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between mt-2">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">치과재료대 구입 신고 품목</h4>
                  <p className="text-xs text-blue-700/70 mt-0.5">건강보험심사평가원(심평원) 신고 대상인 경우 체크하세요.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

            </div>
          </div>
        </div>
      </Modal>

      {/* LOGiS-Ai 마스터 DB 불러오기 Modal */}
      <Modal
        isOpen={isMasterDBModalOpen}
        onClose={() => setIsMasterDBModalOpen(false)}
        maxWidth="max-w-7xl w-[95vw]"
        title={
          <div className="flex items-center gap-2 text-blue-800">
            <Database size={24} />
            <span>LOGiS-Ai 유통회사 제품마스터 DB</span>
          </div>
        }
        footer={
          <>
            <button onClick={() => setIsMasterDBModalOpen(false)} className="px-5 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">닫기</button>
            <button onClick={() => setIsMasterDBModalOpen(false)} className="px-5 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition flex items-center gap-2">
              <Download size={16} /> 선택 항목 등록
            </button>
          </>
        }
      >
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <p className="text-sm text-blue-900 font-medium">유통회사 &lt;LOGiS-Ai&gt;의 최신 제품마스터 DB입니다. 등록할 품목을 선택하여 내 병원 재고로 가져올 수 있습니다.</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="마스터 DB 검색..." className="pl-9 pr-4 py-1.5 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 tracking-wide uppercase">
                  <th className="py-3 px-4 text-center w-12"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" /></th>
                  <th className="py-3 px-4 text-center">제품사진</th>
                  <th className="py-3 px-4">제품명</th>
                  <th className="py-3 px-4">카테고리</th>
                  <th className="py-3 px-4">바코드</th>
                  <th className="py-3 px-4">규격</th>
                  <th className="py-3 px-4">포장단위</th>
                  <th className="py-3 px-4 text-right">금액</th>
                  <th className="py-3 px-4">유통사</th>
                  <th className="py-3 px-4">유통기한</th>
                  <th className="py-3 px-4 text-center">심평원신고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {LOGIS_MASTER_DB.map((dbItem) => (
                  <tr key={dbItem.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 text-center"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" /></td>
                    <td className="py-3 px-4 text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 mx-auto">
                        <ImageIcon size={16} />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">{dbItem.name}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">{dbItem.category}</span></td>
                    <td className="py-3 px-4 text-gray-500 font-mono">{dbItem.barcode}</td>
                    <td className="py-3 px-4 text-gray-600">{dbItem.size}</td>
                    <td className="py-3 px-4 text-gray-600">{dbItem.unit}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-blue-700">{dbItem.price.toLocaleString()}원</td>
                    <td className="py-3 px-4 text-gray-600">{dbItem.distributor}</td>
                    <td className="py-3 px-4 text-gray-600">{dbItem.expDate}</td>
                    <td className="py-3 px-4 text-center">
                      {dbItem.isReported ? <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">대상</span> : <span className="text-gray-400 font-bold text-xs">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupplyInventory;
