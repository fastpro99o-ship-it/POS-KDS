'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MenuGrid from '@/components/MenuGrid';
import OrderBasket from '@/components/OrderBasket';
import useSoundAlert from '@/hooks/useSoundAlert';
import useOnlineStatus from '@/hooks/useOnlineStatus';

const ORDER_TYPES = ['Dine-In', 'Takeaway', 'Delivery'];
const TABLES = Array.from({ length: 20 }, (_, i) => String(i + 1));

export default function OrderPage() {
    const isOnline = useOnlineStatus();
    const { playNewOrderSound } = useSoundAlert();
    const [basketItems, setBasketItems] = useState([]);
    const [table, setTable] = useState('1');
    const [orderType, setOrderType] = useState('Dine-In');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [showMobileBasket, setShowMobileBasket] = useState(false);

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
            const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
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

    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const handleSubmit = async () => {
        if (basketItems.length === 0) {
            toast.error('الطلب فارغ! أضف أصناف أولاً');
            return;
        }

        setIsSubmitting(true);
        const totalAmount = basketItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const payload = {
            table,
            type: orderType,
            total_amount: totalAmount,
            payment_method: paymentMethod, // Include payment method
            items: basketItems.map(i => ({
                name: i.name,
                qty: i.qty,
                price: i.price, // Save price at the time of order
                station: i.station,
                note: i.note || '',
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
                setPaymentMethod('Cash'); // Reset
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

    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto p-4 sm:p-6 pb-32">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">طلب جديد</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">اختر الأصناف وأرسل الطلب للمطبخ مباشرة</p>
                </div>

                {/* Order Confirmation */}
                {submitted && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 flex items-start gap-4">
                        <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-xl shrink-0">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">check_circle</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-green-800 dark:text-green-300">تم إرسال الطلب بنجاح!</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                طاولة {submitted.table} • {submitted.type} • {submitted.items.length} صنف
                            </p>
                            <p className="text-xs text-green-500 dark:text-green-500 mt-1 font-mono">#{submitted.orderId}</p>
                        </div>
                        <button
                            onClick={() => setSubmitted(null)}
                            className="text-green-500 hover:text-green-700 transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Menu */}
                    <div className="flex-1 min-w-0">
                        <MenuGrid onAdd={handleAdd} />
                    </div>

                    {/* Right: Basket (Desktop Sidebar) */}
                    <div className="hidden lg:block w-[340px] shrink-0">
                        <div className="sticky top-24 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                                تفاصيل الطلب
                            </h3>

                            {/* Table & Type */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">الطاولة</label>
                                    <select
                                        value={table}
                                        onChange={e => setTable(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary"
                                    >
                                        {TABLES.map(t => (
                                            <option key={t} value={t}>طاولة {t}</option>
                                        ))}
                                        <option value="Takeaway">Takeaway</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">النوع</label>
                                    <select
                                        value={orderType}
                                        onChange={e => setOrderType(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary"
                                    >
                                        {ORDER_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">طريقة الدفع</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Cash', 'Card', 'Online'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${paymentMethod === method ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {method === 'Cash' ? 'كاش' : method === 'Card' ? 'بطاقة' : 'أونلاين'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                                <OrderBasket
                                    items={basketItems}
                                    onQtyChange={handleQtyChange}
                                    onRemove={handleRemove}
                                    onNote={handleNote}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || basketItems.length === 0}
                                className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                        إرسال للمطبخ
                                        {basketItems.length > 0 && (
                                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {basketItems.reduce((s, i) => s + i.qty, 0)} صنف
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Bottom Bar */}
                {basketItems.length > 0 && (
                    <div className="lg:hidden fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
                        <button
                            onClick={() => setShowMobileBasket(true)}
                            className="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <span className="material-symbols-outlined text-white text-[24px]">shopping_basket</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/80 font-bold uppercase tracking-wider">عرض الطلب</p>
                                    <p className="font-bold text-lg">{basketItems.reduce((s, i) => s + i.qty, 0)} أصناف</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-left font-bold text-xl">
                                    {basketItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(0)} DH
                                </div>
                                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">arrow_forward</span>
                            </div>
                        </button>
                    </div>
                )}

                {/* Mobile Basket Overlay */}
                {showMobileBasket && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 animate-in slide-in-from-bottom duration-300 overflow-y-auto pb-32">
                        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                                تفاصيل الطلب
                            </h3>
                            <button
                                onClick={() => setShowMobileBasket(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">close</span>
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Table & Type Selection for Mobile */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block px-1">الطاولة</label>
                                    <select
                                        value={table}
                                        onChange={e => setTable(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
                                    >
                                        {TABLES.map(t => (
                                            <option key={t} value={t}>طاولة {t}</option>
                                        ))}
                                        <option value="Takeaway">Takeaway</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block px-1">النوع</label>
                                    <select
                                        value={orderType}
                                        onChange={e => setOrderType(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
                                    >
                                        {ORDER_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <OrderBasket
                                    items={basketItems}
                                    onQtyChange={handleQtyChange}
                                    onRemove={handleRemove}
                                    onNote={handleNote}
                                />
                            </div>
                        </div>

                        {/* Mobile Submit Button (Fixed) */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50">
                            <button
                                onClick={async () => {
                                    await handleSubmit();
                                    setShowMobileBasket(false);
                                }}
                                disabled={isSubmitting || basketItems.length === 0}
                                className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                                        جاري الإرسال للمطبخ...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[24px]">send</span>
                                        إرسال للمطبخ بقيمة {basketItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(0)} DH
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
