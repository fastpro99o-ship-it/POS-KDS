'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import MenuGrid from '@/components/MenuGrid';
import OrderBasket from '@/components/OrderBasket';
import Sidebar from '@/components/Sidebar';
import useSoundAlert from '@/hooks/useSoundAlert';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/lib/LanguageContext';

const ORDER_TYPES = ['Dine-In', 'Takeaway', 'Delivery'];
const TABLES = Array.from({ length: 20 }, (_, i) => String(i + 1));

export default function OrderPage() {
    const isOnline = useOnlineStatus();
    const { playNewOrderSound } = useSoundAlert();
    const { t, dir, lang } = useLanguage();
    const [basketItems, setBasketItems] = useState([]);
    const [table, setTable] = useState('1');
    const [orderType, setOrderType] = useState('Dine-In');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [showMobileBasket, setShowMobileBasket] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Sync Offline Orders when back online
    useEffect(() => {
        if (isOnline) {
            const pendingOrders = JSON.parse(localStorage.getItem('kds_pending_orders') || '[]');
            if (pendingOrders.length > 0) {
                // Background Sync
                Promise.all(pendingOrders.map(async (orderPayload) => {
                    try {
                        const res = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderPayload),
                        });
                        if (res.ok) {
                            return orderPayload.id; // Return successful ID to remove
                        }
                    } catch (e) {
                        return null; // Keep if failed
                    }
                })).then((results) => {
                    const successfulIds = results.filter(Boolean);
                    if (successfulIds.length > 0) {
                        const newPending = pendingOrders.filter(o => !successfulIds.includes(o.id));
                        localStorage.setItem('kds_pending_orders', JSON.stringify(newPending));
                        toast.success(`تم مزامنة ${successfulIds.length} طلبات كانت في وضع عدم الاتصال! 🔄`);
                        // Crucial: Tell other open tabs (KDS, Admin) that new Data is available
                        window.dispatchEvent(new Event('local-storage-update'));
                    }
                });
            }
        }
    }, [isOnline]);

    const handleAdd = useCallback((item) => {
        setBasketItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1, note: '' }];
        });
        toast.success(`${item.name} أضيف للطلب`, { duration: 1500 });
    }, []);

    const handleQtyChange = useCallback((id, delta) => {
        setBasketItems(prev => {
            const updated = prev.map(i => {
                if (i.id === id) {
                    const newQty = i.qty + delta;
                    if (newQty <= 0) return null; // We'll filter out nulls
                    return { ...i, qty: newQty };
                }
                return i;
            }).filter(Boolean);
            return updated;
        });
    }, []);

    const handleRemove = useCallback((id) => {
        setBasketItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const handleNote = useCallback((id, note) => {
        setBasketItems(prev => prev.map(i => i.id === id ? { ...i, note } : i));
    }, []);

    const saveOfflineOrder = (payload) => {
        const offlineId = 'offline-' + Date.now() + Math.random().toString(36).substr(2, 5);
        const orderRecord = { ...payload, id: offlineId, status: 'pending', created_at: new Date().toISOString() };

        // 1. Add to Local Storage for KDS Screen
        const existingKds = JSON.parse(localStorage.getItem('kds_orders') || '[]');
        localStorage.setItem('kds_orders', JSON.stringify([orderRecord, ...existingKds]));

        // 2. Queue for Sync
        const pendingQueue = JSON.parse(localStorage.getItem('kds_pending_orders') || '[]');
        pendingQueue.push(orderRecord);
        localStorage.setItem('kds_pending_orders', JSON.stringify(pendingQueue));

        // Let other tabs know
        window.dispatchEvent(new Event('local-storage-update'));

        setSubmitted({ orderId: offlineId, table, type: orderType, items: basketItems });
        setBasketItems([]);
        toast.success('تم الحفظ محلياً (وضع الأوفلاين) 📶');
        playNewOrderSound();
    };

    const handleSubmit = async () => {
        if (basketItems.length === 0) {
            toast.error('الطلب فارغ! أضف أصناف أولاً');
            return;
        }

        setIsSubmitting(true);
        const totalAmount = basketItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
        
        // Calculate tax based on the total. The image shows Subtotal $40, Tax $4, Total $44 (10% tax). 
        // We will pass totalAmount to backend directly, backend doesn't necessarily track tax separately right now,
        // but let's keep it simple.

        const payload = {
            table,
            type: orderType,
            total_amount: totalAmount, // Adjust to your current logic
            payment_method: paymentMethod,
            items: basketItems.map(i => ({
                name: i.name,
                qty: i.qty,
                price: i.price,
                station: i.station,
                note: i.note || '',
                emoji: i.emoji // Added emoji for visual consistency if needed later
            })),
        };

        if (!isOnline) {
            saveOfflineOrder(payload);
            setIsSubmitting(false);
            setBasketItems([]);
            toast.success('تم حفظ الطلب محلياً (أوفلاين) 📶');
            return;
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted({ orderId: data.orderId, table, type: orderType, items: basketItems });
                setBasketItems([]);
                setPaymentMethod('Cash');
                toast.success('تم إرسال الطلب للمطبخ! 🍽️');
                playNewOrderSound();
            } else {
                toast.error('حدث خطأ، سيتم الحفظ محلياً');
                saveOfflineOrder(payload);
            }
        } catch (e) {
            toast.error('تعذر الاتصال بالخادم، تم تفعيل وضع الأوفلاين 📶');
            saveOfflineOrder(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', { month: 'long', day: 'numeric', year: 'numeric' });
    const subtotal = basketItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const totalItems = basketItems.reduce((sum, i) => sum + i.qty, 0);

    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir={dir}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-[#E8ECEF] bg-white lg:bg-transparent">
                
                {/* Top Header */}
                <header className="h-[88px] shrink-0 px-8 flex items-center justify-between bg-white border-b border-[#E8ECEF]">
                    <h1 className="text-2xl font-bold text-[#1a1a1a]">Paris Food</h1>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                            <span className="text-sm">{currentDate}</span>
                        </div>
                        <button className="text-gray-400 relative">
                            <span className="material-symbols-outlined text-[24px]">notifications</span>
                            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FF4B2B] border-2 border-white"></div>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-sm">
                            RF
                        </div>
                    </div>
                </header>

                {/* Submitted Notification */}
                {submitted && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-xl p-4 shadow-xl flex items-center gap-4">
                        <span className="material-symbols-outlined text-green-600 text-[24px]">check_circle</span>
                        <div>
                            <p className="font-bold text-green-800">{t('orderSent')}</p>
                            <p className="text-sm text-green-600">{t('table')} {submitted.table} · #{submitted.orderId}</p>
                        </div>
                        <button onClick={() => setSubmitted(null)} className="ml-4 text-green-500">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                )}

                {/* Body Area */}
                <div className="flex-1 overflow-hidden p-6 sm:p-8 bg-[#FDFDFD]">
                    <MenuGrid onAdd={handleAdd} />
                </div>
            </main>

            {/* Right Sidebar (Order Detail) */}
            <aside className="w-[380px] shrink-0 bg-white flex flex-col h-full z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] border-l border-[#E8ECEF]">
                <div className="px-6 py-6 border-b border-[#E8ECEF]">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-[#1A1A1A]">
                            {lang === 'ar' ? 'تفاصيل الطلب' : 'Détail commande'}
                        </h2>
                        <div className="relative">
                            <select
                                value={table}
                                onChange={e => setTable(e.target.value)}
                                className="appearance-none bg-white border border-[#E8ECEF] rounded-lg px-4 py-2 pr-8 text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF4B2B]/20"
                            >
                                {TABLES.map(tb => <option key={tb} value={tb}>{t('table')} {tb}</option>)}
                                <option value="Takeaway">{t('takeaway')}</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <OrderBasket
                        items={basketItems}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        onNote={handleNote}
                    />
                </div>

                {/* Summary & Checkout */}
                <div className="px-6 pb-6 pt-4 border-t border-[#E8ECEF] bg-white">
                <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">{t('subtotal')}</span>
                            <span className="font-bold text-[#1A1A1A]">{subtotal.toFixed(0)} DH</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">{t('items')}</span>
                            <span className="font-bold text-[#1A1A1A]">{totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[#E8ECEF]">
                            <span className="text-xl font-bold text-[#1A1A1A]">Total</span>
                            <span className="text-xl font-bold text-[#FF4B2B]">{subtotal.toFixed(0)} DH</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || basketItems.length === 0}
                        className="w-full bg-[#FF4B2B] hover:bg-[#E63E1C] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#FF4B2B]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                    >
                        {isSubmitting ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>{lang === 'ar' ? '🍽️ إرسال للمطبخ' : '🍽️ Envoyer en Cuisine'}</>
                        )}
                    </button>
                </div>
            </aside>
        </div>
    );
}
