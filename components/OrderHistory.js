'use client';

import { useMemo, useState, useEffect } from 'react';

function getOrderStatusDisplay(order) {
    if (order.status === 'completed') {
        return { label: '✓ مكتمل', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    if (order.status === 'preparing') {
        return { label: '👨‍🍳 يطبخ الآن', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
    }
    if (order.status === 'cancelled') {
        return { label: '🚫 ملغى', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 line-through' };
    }
    if (order.status === 'waiter_requested') {
        return { label: '🚨 مطلوب نادل', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
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

function getOrderRevenue(order) {
    if (order.status === 'cancelled') return 0;
    return Number(order.total_amount) || 0;
}

function formatDate(isoString, startTime) {
    const d = isoString ? new Date(isoString) : startTime ? new Date(startTime) : null;
    if (!d) return '—';
    return d.toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' });
}

function getDuration(order) {
    const start = order.created_at ? new Date(order.created_at).getTime() : (order.startTime || 0);
    if (!start) return '—';
    const now = Date.now();
    const secs = Math.floor((now - start) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
}

export default function OrderHistory({ orders, onPrint, onDelete }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [collapsedGroups, setCollapsedGroups] = useState({});

    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('kds_history_collapsed_groups');
        if (savedState) {
            try {
                setCollapsedGroups(JSON.parse(savedState));
            } catch (e) {
                console.error('Error parsing collapsed groups state', e);
            }
        }
    }, []);

    const toggleGroup = (dateTitle) => {
        setCollapsedGroups(prev => {
            const newState = {
                ...prev,
                [dateTitle]: !prev[dateTitle]
            };
            // Save to localStorage
            localStorage.setItem('kds_history_collapsed_groups', JSON.stringify(newState));
            return newState;
        });
    };

    const allTypes = ['All', ...new Set(orders.map(o => o.type || 'Dine-In'))];

    const filtered = useMemo(() => {
        return orders.filter(o => {
            const matchSearch = search === '' ||
                String(o.id).includes(search) ||
                String(o.table_number || o.table || '').includes(search) ||
                (o.items || []).some(i => i.name.toLowerCase().includes(search.toLowerCase()));
            const matchType = typeFilter === 'All' || (o.type || 'Dine-In') === typeFilter;
            return matchSearch && matchType;
        });
    }, [orders, search, typeFilter]);

    const groupedOrders = useMemo(() => {
        const groups = new Map();
        filtered.forEach(o => {
            const start = o.created_at ? new Date(o.created_at) : (o.startTime ? new Date(o.startTime) : new Date());
            const dateKey = start.toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey).push(o);
        });
        return Array.from(groups.entries());
    }, [filtered]);

    const totalRevenue = filtered.reduce((s, o) => s + getOrderRevenue(o), 0);
    const completedCount = filtered.filter(o => o.status === 'completed').length;
    const cancelledCount = filtered.filter(o => o.status === 'cancelled').length;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
                <span className="material-symbols-outlined text-5xl mb-3">history</span>
                <p className="font-bold">لا توجد طلبات بعد</p>
                <p className="text-sm mt-1">ستظهر هنا بعد إرسال طلبات من صفحة /order</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي الطلبات', value: filtered.length, icon: 'receipt_long', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'مكتملة', value: completedCount, icon: 'task_alt', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                    { label: 'ملغاة', value: cancelledCount, icon: 'cancel', color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' },
                    { label: 'الإيراد الفعلي', value: `${totalRevenue.toLocaleString()} DH`, icon: 'payments', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <span className={`material-symbols-outlined text-xl p-2 rounded-lg ${color}`}>{icon}</span>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px]">search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="بحث بالرقم، الطاولة، أو الصنف..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-2">
                    {allTypes.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === t ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grouped Tables */}
            <div className="space-y-6">
                {groupedOrders.map(([dateTitle, dateOrders]) => {
                    const isCollapsed = collapsedGroups[dateTitle];
                    return (
                        <div key={dateTitle} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                            <div 
                                onClick={() => toggleGroup(dateTitle)}
                                className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 select-none">
                                    <span className="material-symbols-outlined text-primary text-[28px]">
                                        {isCollapsed ? 'folder' : 'folder_open'}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{dateTitle}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300 select-none">
                                <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                    {dateOrders.length} طلب
                                </span>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl flex items-center gap-2 border border-primary/20">
                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                    {dateOrders.reduce((s, o) => s + getOrderRevenue(o), 0).toLocaleString()} DH
                                </span>
                                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                    expand_more
                                </span>
                            </div>
                        </div>
                        
                        {!isCollapsed && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                <thead>
                                    <tr className="bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                        {['رقم الطلب', 'الطاولة', 'النوع', 'الأصناف', 'الوقت', 'الإيراد', 'الحالة', 'إجراءات'].map(h => (
                                            <th key={h} className="text-start px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {dateOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    #{String(order.id).slice(-6)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-sm text-gray-900 dark:text-gray-100">
                                                {order.table_number || order.table || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                {order.type || 'Dine-In'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(order.items || []).slice(0, 2).map((item, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                            {item.qty}× {item.name}
                                                        </span>
                                                    ))}
                                                    {(order.items || []).length > 2 && (
                                                        <span className="text-xs text-gray-400 font-bold">+{order.items.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {formatDate(order.created_at, order.startTime)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-bold text-primary">{getOrderRevenue(order)} DH</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getOrderStatusDisplay(order).color}`}>
                                                    {getOrderStatusDisplay(order).label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 text-start">
                                                    {onPrint && (
                                                        <button onClick={() => onPrint(order)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="طباعة الفاتورة">
                                                            <span className="material-symbols-outlined text-[20px]">print</span>
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button onClick={() => onDelete(order.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف الطلب">
                                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                )})}
            </div>
            <p className="text-xs text-gray-400 text-center">{filtered.length} طلب • إيراد إجمالي: {totalRevenue.toLocaleString()} DH</p>
        </div>
    );
}
