'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Sidebar from '@/components/Sidebar';

export default function AdminPage() {
    const { t, dir, lang } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                const saved = typeof window !== 'undefined'
                    ? JSON.parse(localStorage.getItem('kds_orders') || '[]')
                    : [];
                const apiIds = new Set(data.map(o => o.id));
                const localOnly = saved.filter(o =>
                    !apiIds.has(o.id) &&
                    (String(o.id).includes('offline') || String(o.id).includes('fallback'))
                );
                setOrders([...data, ...localOnly]);
            }
        } catch (e) {
            console.error('Fetch orders error', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // ── Stats ─────────────────────────────────────────────────
    const completedOrders = orders.filter(o => o.status === 'completed');
    const pendingOrders = orders.filter(o => o.status !== 'completed');

    const revenue = completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const allItems = completedOrders.flatMap(o => o.items || []);
    const totalItems = allItems.reduce((s, i) => s + (i.qty || 1), 0);
    const averageSales = completedOrders.length > 0 ? revenue / completedOrders.length : 0;

    // Top selling items
    const itemCounts = {};
    allItems.forEach(item => {
        const name = item.name?.split(' (')[0];
        if (name) itemCounts[name] = (itemCounts[name] || 0) + (item.qty || 1);
    });
    const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Today's figures
    const today = new Date().toDateString();
    const todayOrders = completedOrders.filter(o => {
        const d = o.created_at || o.startTime;
        return d && new Date(d).toDateString() === today;
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir={dir}>
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD]">
                {/* Header */}
                <header className="h-[88px] shrink-0 px-8 flex items-center justify-between bg-white border-b border-[#E8ECEF]">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a]">{t('statsTitle')}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{t('statsSub')}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                            <span className="text-sm">{currentDate}</span>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-200"></div>
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-sm">RF</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">

                    {/* Hero Banner */}
                    <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF8C42] rounded-2xl p-6 text-white flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm font-medium mb-1">Chiffre d'affaires aujourd'hui</p>
                            <div className="text-[42px] font-black leading-tight">
                                {todayRevenue.toFixed(2)} <span className="text-[20px] font-bold">DH</span>
                            </div>
                            <p className="text-white/70 text-sm mt-2">{todayOrders.length} commandes complétées aujourd'hui</p>
                        </div>
                        <div className="text-right">
                            <div className="text-white/60 text-sm mb-1">En attente</div>
                            <div className="text-[32px] font-bold">{pendingOrders.length}</div>
                            <div className="text-white/60 text-sm">commandes actives</div>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: 'payments', color: '#FF4B2B', label: 'Ventes totales', value: `${revenue.toFixed(2)} DH`, sub: `${completedOrders.length} commandes` },
                            { icon: 'receipt_long', color: '#2D9CDB', label: 'Nb commandes', value: completedOrders.length, sub: `${orders.length} total (toutes)` },
                            { icon: 'shopping_bag', color: '#27AE60', label: 'Articles vendus', value: totalItems, sub: 'unités au total' },
                            { icon: 'analytics', color: '#F2994A', label: 'Panier moyen', value: `${averageSales.toFixed(2)} DH`, sub: 'par commande' },
                        ].map(card => (
                            <div key={card.label} className="bg-white rounded-xl p-5 border border-[#E8ECEF] shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: card.color }}>{card.icon}</span>
                                    <span className="text-xs font-semibold text-gray-500">{card.label}</span>
                                </div>
                                <div className="text-[24px] font-bold text-[#1A1A1A]">{card.value}</div>
                                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Top Items + Recent Orders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Selling */}
                        <div className="bg-white rounded-xl p-6 border border-[#E8ECEF] shadow-sm">
                            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-5">🏆 Top ventes</h3>
                            {topItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-300">
                                    <span className="material-symbols-outlined text-4xl">bar_chart</span>
                                    <p className="text-sm font-medium text-gray-400">Aucune donnée disponible</p>
                                    <p className="text-xs text-gray-400">Les ventes apparaîtront ici après les premières commandes</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topItems.map(([name, count], idx) => {
                                        const max = topItems[0]?.[1] || 1;
                                        const pct = Math.round((count / max) * 100);
                                        const colors = ['#FF4B2B', '#FF8C42', '#F2994A', '#27AE60', '#2D9CDB'];
                                        return (
                                            <div key={name}>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <span className="text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: colors[idx] }}>{idx + 1}</span>
                                                        <span className="truncate max-w-[180px]">{name}</span>
                                                    </span>
                                                    <span className="text-sm font-bold" style={{ color: colors[idx] }}>{count}x</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[idx] }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-xl p-6 border border-[#E8ECEF] shadow-sm">
                            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-5">📋 Dernières commandes</h3>
                            {completedOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-300">
                                    <span className="material-symbols-outlined text-4xl">receipt_long</span>
                                    <p className="text-sm font-medium text-gray-400">Aucune commande complétée</p>
                                </div>
                            ) : (
                                <div className="space-y-1 max-h-[260px] overflow-y-auto">
                                    {[...completedOrders].reverse().slice(0, 10).map((order, idx) => (
                                        <div key={order.id || idx} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                                            <div>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {order.table_number ? `Table ${order.table_number}` : order.table ? `Table ${order.table}` : 'À emporter'}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-2">{order.items?.length || 0} articles</span>
                                            </div>
                                            <span className="text-sm font-black text-[#FF4B2B]">{Number(order.total_amount || 0).toFixed(2)} DH</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-white rounded-xl p-8 border border-[#E8ECEF] shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-[15px] font-medium text-[#1A1A1A] mb-1">Évolution des ventes</h3>
                                <div className="text-[28px] font-bold text-[#1A1A1A]">
                                    {revenue.toFixed(2)} <span className="text-[16px] text-gray-400">DH</span>
                                </div>
                                <div className="text-sm text-gray-400">{completedOrders.length} commandes complétées</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#FF4B2B]"></div>
                                <span className="text-sm text-gray-500">Cette période</span>
                            </div>
                        </div>

                        <div className="relative h-[180px] w-full flex">
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-300 font-medium">
                                <span>250</span><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
                            </div>
                            <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-[#E8ECEF] border-b">
                                {[0,1,2,3,4].map(i => <div key={i} className="w-full border-t border-dashed border-[#F5F5F5] h-[20%]"></div>)}
                                <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-6">
                                    {[40, 65, 30, 82, 55, 90, 45, 70].map((h, idx) => (
                                        <div key={idx} className="flex h-full items-end">
                                            <div className="w-5 bg-[#FF4B2B] rounded-t-lg hover:opacity-80 transition-all" style={{ height: `${h}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-3 ml-12 px-6">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', "Auj"].map(d => <span key={d}>{d}</span>)}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
