'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminStatsCard from '@/components/AdminStatsCard';
import MenuManager from '@/components/MenuManager';
import OrderHistory from '@/components/OrderHistory';
import { isAuthenticated, logout } from '@/lib/auth';

function getOrderStatusDisplay(order) {
    if (order.status === 'completed') {
        return { label: '✓ مكتمل', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    if (order.status === 'cancelled') {
        return { label: '🚫 ملغى', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 line-through' };
    }

    const start = order.created_at ? new Date(order.created_at).getTime() : (order.startTime || Date.now());
    const elapsed = Math.floor((Date.now() - start) / 1000);

    if (elapsed > 600) {
        return { label: '🔥 متأخر', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (elapsed > 300) {
        return { label: '⚠️ بطيء', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { label: '⏳ جديد', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
}

const STATION_COLORS = {
    Grill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Salads: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Oven: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Fryer: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Bar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

function formatTime(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('orders');
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [authed, setAuthed] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                // Also get saved from localStorage
                const saved = typeof window !== 'undefined'
                    ? JSON.parse(localStorage.getItem('kds_orders') || '[]')
                    : [];

                // Merge: API orders + localStorage orders (deduplicated)
                const apiIds = new Set(data.map(o => o.id));

                // Only keep local orders if they are truly not on the server yet (e.g. offline fallback)
                // If the server *did* have it before but now it's gone, or if it has updated status, the API version wins.
                const localOnly = saved.filter(o =>
                    !apiIds.has(o.id) &&
                    (String(o.id).includes('offline') || String(o.id).includes('fallback'))
                );

                // Proactively purge old zombie server orders from the local cache so they don't bloat memory
                if (typeof window !== 'undefined') {
                    localStorage.setItem('kds_orders', JSON.stringify(localOnly));
                }

                // IMPORTANT: If a local order was marked completed/cancelled by ANOTHER device, 
                // the API `data` will have the new status. We just use `data`.
                const allOrders = [...data, ...localOnly].sort((a, b) => {
                    const aTime = a.created_at ? new Date(a.created_at).getTime() : (a.startTime || 0);
                    const bTime = b.created_at ? new Date(b.created_at).getTime() : (b.startTime || 0);
                    return bTime - aTime;
                });

                setOrders(allOrders);
                setLastRefreshed(new Date());
            }
        } catch (e) {
            console.error('Fetch orders error', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auth guard
    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/admin/login');
        } else {
            setAuthed(true);
        }
    }, [router]);

    useEffect(() => {
        if (!authed) return;
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders, authed]);

    const handleLogout = () => {
        logout();
        router.replace('/admin/login');
    };

    const handlePrintOrder = (order) => {
        const items = (order.items || []).map(i => `  • ${i.qty}x ${i.name}${i.note ? ` (${i.note})` : ''}`).join('\n');
        const win = window.open('', '_blank', 'width=400,height=500');
        win.document.write(`
            <html><head><title>Ticket #${String(order.id).slice(-6)}</title>
            <style>
                body { font-family: monospace; font-size: 13px; padding: 20px; max-width: 300px; }
                h2 { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; }
                .info { margin: 8px 0; }
                .items { margin: 12px 0; border-top: 1px dashed #000; padding-top: 8px; }
                .footer { border-top: 2px dashed #000; margin-top: 12px; padding-top: 8px; text-align: center; font-size: 11px; }
            </style></head>
            <body>
                <h2>🍽️ Kitchen Ticket</h2>
                <div class="info">Order: <strong>#${String(order.id).slice(-6)}</strong></div>
                <div class="info">Table: <strong>${order.table_number || order.table || 'N/A'}</strong></div>
                <div class="info">Type: <strong>${order.type || 'Dine-In'}</strong></div>
                <div class="info">Time: <strong>${formatTime(order.created_at)}</strong></div>
                <div class="items"><strong>Items:</strong><br/><pre>${items}</pre></div>
                <div class="footer">KDS Kitchen Display System</div>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    const handleBump = async (id) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'completed' }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
                // Also update localStorage
                if (typeof window !== 'undefined') {
                    const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
                    const updated = saved.filter(o => o.id !== id);
                    localStorage.setItem('kds_orders', JSON.stringify(updated));
                }
                toast.success(`Order #${id} marked complete`);
            }
        } catch (e) {
            toast.error('Failed to update order');
        }
    };

    const handleCancel = async (id) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'cancelled' }),
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
                if (typeof window !== 'undefined') {
                    const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
                    const updated = saved.map(o => o.id === id ? { ...o, status: 'cancelled' } : o);
                    localStorage.setItem('kds_orders', JSON.stringify(updated));
                    window.dispatchEvent(new Event('local-storage-update'));
                }
                toast.success(`تم إلغاء الطلب #${id} وحفظه في الأرشيف`);
            }
        } catch (e) {
            toast.error('Failed to cancel order');
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    const completedOrders = orders.filter(o => o.status === 'completed');

    const filteredOrders = filter === 'all' ? orders.filter(o => o.status !== 'cancelled')
        : filter === 'active' ? activeOrders
            : completedOrders;

    const allItems = filteredOrders.flatMap(o => o.items || []);
    const totalItems = allItems.reduce((s, i) => s + (i.qty || 1), 0);

    // Station breakdown
    const stationCounts = allItems.reduce((acc, item) => {
        if (item.station) acc[item.station] = (acc[item.station] || 0) + (item.qty || 1);
        return acc;
    }, {});

    // Top items
    const itemCounts = allItems.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + (item.qty || 1);
        return acc;
    }, {});
    const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Revenue estimate (from MenuGrid prices — approximate)
    const PRICE_MAP = {
        'Classic Burger': 45, 'Cheese Burger': 50, 'Crispy Chicken': 48,
        'Mixed Grill': 85, 'Grilled Chicken': 65, 'Kofta': 55,
        'Caesar Salad': 35, 'Fattoush': 28, 'Greek Salad': 32,
        'French Fries': 22, 'Onion Rings': 25, 'Garlic Bread': 18,
        'Soft Drink': 15, 'Fresh Juice': 25, 'Water': 8,
    };
    const revenue = filteredOrders.reduce((sum, order) => {
        return sum + (order.items || []).reduce((orderSum, item) => {
            const price = PRICE_MAP[item.name] || 30;
            return orderSum + price * (item.qty || 1);
        }, 0);
    }, 0);

    if (!authed) return null;

    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto p-6 pb-32">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            مراقبة الطلبات وإدارة المطبخ
                            {lastRefreshed && (
                                <span className="ml-2 text-xs text-gray-400">
                                    • آخر تحديث: {lastRefreshed.toLocaleTimeString('ar-MA')}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            تحديث
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            خروج
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <AdminStatsCard
                        title="طلبات نشطة"
                        value={activeOrders.length}
                        subtitle="في انتظار التحضير"
                        icon="pending_actions"
                        color="orange"
                    />
                    <AdminStatsCard
                        title="مكتملة"
                        value={completedOrders.length}
                        subtitle="اليوم"
                        icon="task_alt"
                        color="green"
                    />
                    <AdminStatsCard
                        title="الإيرادات التقديرية"
                        value={`${revenue.toLocaleString()} DH`}
                        subtitle="مجموع الطلبات"
                        icon="payments"
                        color="blue"
                    />
                    <AdminStatsCard
                        title="إجمالي الأصناف"
                        value={totalItems}
                        subtitle="عدد القطع المطلوبة"
                        icon="fastfood"
                        color="purple"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    {[
                        { key: 'orders', label: 'الطلبات النشطة', icon: 'pending_actions' },
                        { key: 'history', label: 'أرشيف الحسابات (مكتمل / ملغى)', icon: 'history' },
                        { key: 'menu', label: 'إدارة القائمة', icon: 'restaurant_menu' },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-all ${activeTab === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            <span className="hidden sm:block">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab: Menu Manager */}
                {activeTab === 'menu' && <MenuManager />}

                {/* Tab: History */}
                {activeTab === 'history' && <OrderHistory orders={orders} />}

                {/* Tab: Active Orders */}
                {activeTab === 'orders' && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Orders Table */}
                        <div className="flex-1 min-w-0">
                            {/* Table Filter */}
                            <div className="flex items-center gap-2 mb-4">
                                {[
                                    { key: 'all', label: `الكل (${orders.length})` },
                                    { key: 'active', label: `نشط (${activeOrders.length})` },
                                    { key: 'completed', label: `مكتمل (${completedOrders.length})` },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === key
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-48 text-gray-400">
                                        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                                    </div>
                                ) : filteredOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                                        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                                        <p className="font-semibold text-sm">لا توجد طلبات</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">رقم الطلب</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">الطاولة</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">النوع</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">الأصناف</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">الوقت</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">إجراء</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {filteredOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                #{String(order.id).slice(-6)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                                                {order.table_number || order.table || '—'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                                {order.type || 'Dine-In'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {(order.items || []).slice(0, 3).map((item, i) => (
                                                                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                                                        {item.qty}× {item.name}
                                                                    </span>
                                                                ))}
                                                                {(order.items || []).length > 3 && (
                                                                    <span className="text-xs text-gray-400 font-bold">+{order.items.length - 3}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            {formatTime(order.created_at)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getOrderStatusDisplay(order).color}`}>
                                                                {getOrderStatusDisplay(order).label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                {order.status !== 'completed' && (
                                                                    <button
                                                                        onClick={() => handleBump(order.id)}
                                                                        title="إكمال الطلب"
                                                                        className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 transition-all"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handlePrintOrder(order)}
                                                                    title="طباعة ticket"
                                                                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">print</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancel(order.id)}
                                                                    title="إلغاء وأرشفة الطلب"
                                                                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition-all"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Station Breakdown */}
                        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">bar_chart</span>
                                    توزيع المحطات
                                </h3>
                                {Object.keys(stationCounts).length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(stationCounts)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([station, count]) => {
                                                const maxCount = Math.max(...Object.values(stationCounts));
                                                const pct = Math.round((count / maxCount) * 100);
                                                return (
                                                    <div key={station}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${STATION_COLORS[station] || 'bg-gray-100 text-gray-600'}`}>
                                                                {station}
                                                            </span>
                                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{count} صنف</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            {/* Top Items */}
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">emoji_food_beverage</span>
                                    أكثر الأصناف طلباً
                                </h3>
                                {topItems.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-4">لا توجد بيانات بعد</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {topItems.map(([name, count], i) => (
                                            <div key={name} className="flex items-center gap-2">
                                                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'
                                                    }`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                                                <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate font-medium">{name}</span>
                                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{count}×</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
                                    إجراءات سريعة
                                </h3>
                                <div className="space-y-2">
                                    <a
                                        href="/order"
                                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-bold transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                                        طلب جديد
                                    </a>
                                    <a
                                        href="/"
                                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">display_settings</span>
                                        شاشة المطبخ KDS
                                    </a>
                                    <button
                                        onClick={() => {
                                            if (confirm('تنبيه: سيؤدي هذا الإجراء إلى إخفاء الطلبات المكتملة من متصفحك الحالي فقط كإجراء سريع للتنظيف. ستبقى الطلبات محفوظة في أرشيف السحابة لأغراض المحاسبة. هل تريد الاستمرار؟')) {
                                                const filteredForLocalState = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
                                                setOrders(filteredForLocalState);
                                                if (typeof window !== 'undefined') {
                                                    const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
                                                    localStorage.setItem('kds_orders', JSON.stringify(saved.filter(o => o.status !== 'completed' && o.status !== 'cancelled')));
                                                }
                                                toast.success('تم تنظيف الشاشة (الأرشيف لا يزال آمناً)');
                                            }
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
                                        تنظيف الشاشة
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
