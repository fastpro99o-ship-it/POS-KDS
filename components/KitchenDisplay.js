'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import useSoundAlert from '@/hooks/useSoundAlert';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';
import { AggregationBar } from './AggregationBar';
import OrderCard from './OrderCard';

// --- Sample Data ---
const INITIAL_ORDERS = [];






export default function KitchenDisplay() {
    const isOnline = useOnlineStatus();
    const { playNewOrderSound } = useSoundAlert();

    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [partialBumps, setPartialBumps] = useState({});
    const [flashScreen, setFlashScreen] = useState(false);
    const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' | 'newest'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [completedTimes, setCompletedTimes] = useState([]);
    const containerRef = useRef(null);

    // ✅ Flash the screen when a new order arrives
    const triggerFlash = useCallback(() => {
        setFlashScreen(true);
        setTimeout(() => setFlashScreen(false), 800);
    }, []);

    // ✅ Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Load from LocalStorage on Mount (Client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kds_orders');
            if (saved) {
                const rawParsed = JSON.parse(saved);

                // Only resurrect purely local offline/fallback orders. 
                // Let the server API provide the real authorized list.
                const validLocalOrders = rawParsed.filter(o =>
                    o.status !== 'completed' &&
                    (String(o.id).includes('offline') || String(o.id).includes('fallback'))
                );

                // Proactively purge old zombie server orders from the local cache so they don't bloat memory
                localStorage.setItem('kds_orders', JSON.stringify(validLocalOrders));

                if (validLocalOrders.length > 0) {
                    setOrders(validLocalOrders);
                }
            }
            const savedBumps = localStorage.getItem('kds_partial_bumps');
            if (savedBumps) {
                setPartialBumps(JSON.parse(savedBumps));
            }
        }
    }, []);

    // Listen to Offline Orders Added from other tabs or same tab routing
    useEffect(() => {
        const handleOfflineUpdate = () => {
            const saved = localStorage.getItem('kds_orders');
            if (saved) {
                // We only care about syncing purely LOCAL creations across tabs immediately.
                // We do NOT want to resurrect old server orders that the server forgot (e.g. after a restart).
                const parsed = JSON.parse(saved).filter(o =>
                    o.status !== 'completed' &&
                    (String(o.id).includes('offline') || String(o.id).includes('fallback'))
                );

                setOrders(prev => {
                    const existingIds = new Set(prev.map(o => o.id));
                    const newItems = parsed.filter(o => !existingIds.has(o.id));

                    if (newItems.length > 0) {
                        playNewOrderSound();
                        return [...prev, ...newItems];
                    }

                    // Also filter out any local items that disappeared from localStorage (completed elsewhere)
                    const parsedIds = new Set(parsed.map(o => o.id));
                    const keptPrev = prev.filter(o => {
                        const isLocalFallback = String(o.id).includes('offline') || String(o.id).includes('fallback');
                        if (isLocalFallback && !parsedIds.has(o.id)) return false; // It was deleted/completed!
                        return true;
                    });

                    // Only update if something was removed
                    if (keptPrev.length !== prev.length) {
                        return keptPrev;
                    }

                    return prev;
                });
            }
        };

        window.addEventListener('local-storage-update', handleOfflineUpdate);
        window.addEventListener('storage', handleOfflineUpdate);

        return () => {
            window.removeEventListener('local-storage-update', handleOfflineUpdate);
            window.removeEventListener('storage', handleOfflineUpdate);
        };
    }, [playNewOrderSound]);

    const [filter, setFilter] = useState('All');

    // Persistence Effect: Safely merge orders into local storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
            const savedMap = new Map(saved.map(o => [o.id, o]));

            orders.forEach(o => {
                // If it's already in storage as completed, don't overwrite it to pending via KDS state!
                if (!savedMap.has(o.id) || savedMap.get(o.id).status !== 'completed') {
                    savedMap.set(o.id, o);
                }
            });

            localStorage.setItem('kds_orders', JSON.stringify(Array.from(savedMap.values())));
        }
    }, [orders]);

    // Sync Effect: Process Pending Bumps & Pending Orders when Online
    useEffect(() => {
        if (isOnline) {
            // 1. Sync Pending Bumps (Completions)
            const pendingParams = JSON.parse(localStorage.getItem('kds_pending_bumps') || '[]');
            if (pendingParams.length > 0) {
                // Determine unique IDs (in case of duplicates)
                const uniqueIds = [...new Set(pendingParams)];

                // Process Sync
                uniqueIds.forEach(async (id) => {
                    // Update Supabase
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: 'completed' })
                        .eq('id', id);

                    if (!error) {
                        toast.success(`تم مزامنة حالة الطلب #${id}`);
                    }
                });

                // Clear Queue
                localStorage.removeItem('kds_pending_bumps');
                toast.success('تم مزامنة الطلبات المكتملة! 📶');
            }

            // 2. We do NOT sync pending new orders here. The Order page handles its own offline caching sync.
            // But we DO want to trigger a data refresh to grab any new real IDs that the Order page pushed.
            setTimeout(() => setOrders(prev => [...prev]), 500); // Small nudge to re-render in case of socket delay
        }
    }, [isOnline]);

    // Real-time Listener (Supabase)
    useEffect(() => {
        if (!isOnline) return;

        const channel = supabase
            .channel('orders_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newOrder = payload.new;
                        setOrders(prev => {
                            if (prev.find(o => o.id === newOrder.id)) return prev;
                            if (newOrder.status === 'completed') return prev;
                            playNewOrderSound();
                            return [...prev, {
                                ...newOrder,
                                table: newOrder.table_number || newOrder.table || '?',
                                startTime: newOrder.created_at ? new Date(newOrder.created_at).getTime() : Date.now(),
                                items: newOrder.items || []
                            }];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedOrder = payload.new;
                        if (updatedOrder.status === 'completed') {
                            setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
                        } else {
                            // Update existing order data if needed (e.g. status change to 'preparing')
                            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? {
                                ...o,
                                ...updatedOrder,
                                table: updatedOrder.table_number || updatedOrder.table || o.table,
                                items: updatedOrder.items || o.items
                            } : o));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOnline]);

    // DEMO MODE POLLING (Fetch from In-Memory API)
    useEffect(() => {
        // For this MVP, we will simply poll every 2 seconds.
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/orders?status=active');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setOrders(prev => {
                            const serverActiveIds = new Set(data.map(o => o.id));

                            // 1. Keep orders that are still active on server, OR are purely local orders
                            const keptPrev = prev.filter(o => {
                                // 'offline' and 'fallback' are true local caching mechanisms. 
                                // 'demo-' orders are stored in the active server memory, so they MUST obey server Active IDs!
                                const isLocal = String(o.id).includes('offline') || String(o.id).includes('fallback') || o.type === 'Simulation';
                                return isLocal || serverActiveIds.has(o.id);
                            });

                            // 2. Find entirely new orders from server
                            const existingIds = new Set(prev.map(o => o.id));
                            const newItems = data
                                .filter(o => !existingIds.has(o.id))
                                .map(item => ({
                                    ...item,
                                    table: item.table_number || item.table || '?',
                                    startTime: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
                                    items: item.items || []
                                }));

                            if (newItems.length > 0) {
                                playNewOrderSound();
                            }

                            // 3. Prevent useless re-renders if nothing changed
                            if (keptPrev.length === prev.length && newItems.length === 0) {
                                return prev;
                            }

                            return [...keptPrev, ...newItems].sort((a, b) => a.startTime - b.startTime);
                        });
                    }
                }
            } catch (err) {
                // Ignore polling errors
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);


    // Simulation Handler
    const simulateIncomingOrder = () => {
        const id = Math.floor(Math.random() * 9000) + 1000;
        const stations = ['Kitchen', 'Oven', 'Bar', 'Grill'];
        const items = [
            { name: 'Burger Spécial', qty: 2, station: 'Kitchen', categories: ['Burgers'] },
            { name: 'Pizza Margherita', qty: 1, station: 'Oven', categories: ['Pizza'] },
            { name: 'Jus d\'Orange', qty: 3, station: 'Bar', categories: ['Boissons & Salades'] },
        ];
        const newOrder = {
            id: String(id),
            table: String(Math.floor(Math.random() * 20) + 1),
            type: 'Dine-In',
            startTime: Date.now(),
            status: 'pending',
            items: [items[Math.floor(Math.random() * items.length)]]
        };
        setOrders(prev => [newOrder, ...prev]);
        playNewOrderSound();
        triggerFlash();
    };

    // Grouping & Splitting Logic
    const displayOrders = useMemo(() => {
        // 1. Group by Table
        const groups = {};
        orders.forEach(o => {
            if (o.status === 'completed') return; // Absolute fallback protection against zombies

            const t = o.table;
            const isDineIn = t && t !== 'Takeaway' && t !== 'Delivery' && t !== '?';
            const key = isDineIn ? `table-${t}` : `order-${o.id}`;

            if (groups[key]) {
                groups[key].ids.push(o.id);
                groups[key].items.push(...o.items);
                groups[key].startTime = Math.min(groups[key].startTime, o.startTime);
            } else {
                groups[key] = { ...o, ids: [o.id], items: [...o.items] };
            }
        });

        // 2. Split by Station OR Unified View
        const split = [];

        if (filter === 'All') {
            // Unify Grouped Orders completely (No station splitting)
            Object.values(groups).forEach(group => {
                const idString = group.ids.join(',');
                split.push({
                    ...group,
                    splitId: `${idString}-All`,
                    displayStation: 'All',
                    idString: idString,
                    isPartial: false, // Never partial when unified
                    items: group.items
                });
            });
        } else {
            // Station Splitting Logic
            Object.values(groups).forEach(group => {
                const idString = group.ids.join(',');

                const stationsMap = {};
                group.items.forEach(item => {
                    const st = item.station || 'Other';
                    if (!stationsMap[st]) stationsMap[st] = [];
                    stationsMap[st].push(item);
                });

                const stations = Object.keys(stationsMap);
                stations.forEach(st => {
                    // Skip if not the active filter
                    if (st !== filter) return;

                    // Skip if this part is bumped
                    if (partialBumps[idString] && partialBumps[idString].includes(st)) {
                        return;
                    }

                    split.push({
                        ...group,
                        splitId: `${idString}-${st}`,
                        displayStation: st,
                        idString: idString,
                        isPartial: stations.length > 1,
                        items: stationsMap[st]
                    });
                });
            });
        }

        return split.sort((a, b) => a.startTime - b.startTime);
    }, [orders, partialBumps]);

    // Aggregation Logic
    const aggregatedItems = useMemo(() => {
        const counts = {};
        const activeStation = filter;

        displayOrders.forEach(order => {
            order.items.forEach(item => {
                if (activeStation === 'All' || item.station === activeStation) {
                    counts[item.name] = (counts[item.name] || 0) + (item.qty || 1);
                }
            });
        });

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); // Most popular first
    }, [displayOrders, filter]);

    // Filtered Orders Logic
    const filteredOrders = useMemo(() => {
        if (filter === 'All') return displayOrders;
        return displayOrders.filter(o => o.displayStation === filter);
    }, [displayOrders, filter]);

    const handleStatusUpdate = async (id, newStatus) => {
        console.log(`🟡 تحديث حالة الطلب #${id} إلى: ${newStatus}`);

        // 1. Optimistic Update
        setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status: newStatus } : o));

        if (isOnline) {
            // Ensure ID is integer if it's a pure number string
            const dbId = !isNaN(id) && !String(id).includes('-') ? parseInt(id) : id;

            const updateData = { status: newStatus };
            if (newStatus === 'preparing') updateData.preparation_start_at = new Date().toISOString();
            if (newStatus === 'ready') updateData.ready_at = new Date().toISOString();

            const { error, data } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', dbId)
                .select();

            if (error) {
                console.error('❌ خطأ في تحديث Supabase:', error);
                fetch('/api/orders', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: newStatus })
                }).catch(e => console.error('Status update failed (Local API)', e));
            } else {
                console.log('✅ تم تحديث الحالة في Supabase بنجاح:', data);
                if (newStatus === 'waiter_requested') {
                    toast.success('تم إرسال تنبيه عاجل للنادل! 🚨');
                } else if (newStatus === 'ready') {
                    toast.success('تم إرسال تنبيه للنادل! 🔔');
                } else {
                    toast.success('بدء التحضير');
                }
            }
        }
    };

    const realBump = async (id) => {
        console.log('Bumping order ID:', id);
        const orderToRemove = orders.find(o => String(o.id) === String(id));

        if (!orderToRemove) {
            console.warn('Order not found in state:', id);
            return;
        }

        // 1. Optimistic Update
        setOrders(prev => prev.filter(o => String(o.id) !== String(id)));

        // 1.5 Update completed status in local cache
        if (typeof window !== 'undefined') {
            const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
            const updated = saved.map(o => String(o.id) === String(id) ? { ...o, status: 'completed' } : o);
            localStorage.setItem('kds_orders', JSON.stringify(updated));
            window.dispatchEvent(new Event('local-storage-update'));
        }

        // 2. Handle Backend / Sync
        if (isOnline) {
            // Attempt Supabase first
            const { error } = await supabase
                .from('orders')
                .update({ status: 'completed', ready_at: new Date().toISOString() })
                .eq('id', id);

            // If Supabase fails (e.g., Demo Mode), fallback to Local API
            if (error) {
                fetch('/api/orders', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: 'completed' })
                }).catch(e => console.error('All updates failed', e));
            }
        } else {
            const pending = JSON.parse(localStorage.getItem('kds_pending_bumps') || '[]');
            if (!pending.includes(id)) {
                pending.push(id);
                localStorage.setItem('kds_pending_bumps', JSON.stringify(pending));
            }
        }
    };

    const handleBump = async (orderIdString, stationName) => {
        const ids = orderIdString.split(',');

        // 1. Unified Bump (All)
        if (stationName === 'All') {
            ids.forEach(id => realBump(id));
            toast.success(`تم إكمال الطلب بنجاح ${ids.length > 1 ? '(طاولة مجمعة)' : ''}`);

            // Clean up any stray partial bumps for this group
            const newPartialBumps = { ...partialBumps };
            delete newPartialBumps[orderIdString];
            setPartialBumps(newPartialBumps);
            localStorage.setItem('kds_partial_bumps', JSON.stringify(newPartialBumps));
            return;
        }

        // 2. Partial Bump Logic (Station specific)
        const newPartialBumps = { ...partialBumps };
        if (!newPartialBumps[orderIdString]) newPartialBumps[orderIdString] = [];
        if (!newPartialBumps[orderIdString].includes(stationName)) {
            newPartialBumps[orderIdString].push(stationName);
        }

        // Find if all stations are now bumped for these IDs
        const matchingOrders = orders.filter(o => ids.includes(o.id));
        const allStations = new Set();
        matchingOrders.forEach(o => o.items.forEach(i => allStations.add(i.station || 'Other')));

        const isFullyBumped = Array.from(allStations).every(st => newPartialBumps[orderIdString].includes(st));

        if (isFullyBumped) {
            ids.forEach(id => realBump(id));
            delete newPartialBumps[orderIdString];
            toast.success(`تم إكمال الطلب بالكامل ${ids.length > 1 ? '(طاولة مجمعة)' : ''}`);
        } else {
            toast.info(`تم إنجاز قسم ${stationName}، في انتظار المتبقي.`);
        }

        setPartialBumps(newPartialBumps);
        localStorage.setItem('kds_partial_bumps', JSON.stringify(newPartialBumps));
    };

    // ✅ Aggregation: count each item across all active orders
    const aggregation = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const key = item.name;
                counts[key] = (counts[key] || 0) + (item.qty || 1);
            });
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [filteredOrders]);

    // ✅ Average cook time (from completed bumps stored in state)
    const avgCookTime = useMemo(() => {
        if (completedTimes.length === 0) return null;
        const avg = completedTimes.reduce((s, t) => s + t, 0) / completedTimes.length;
        const m = Math.floor(avg / 60);
        const s = String(Math.floor(avg % 60)).padStart(2, '0');
        return `${m}:${s}`;
    }, [completedTimes]);

    // ✅ Sort orders by time
    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) =>
            sortOrder === 'oldest'
                ? a.startTime - b.startTime   // Oldest (most urgent) first
                : b.startTime - a.startTime   // Newest first
        );
    }, [filteredOrders, sortOrder]);

    return (
        <div ref={containerRef} className={cn('flex flex-col h-full bg-[#F9F9FB] relative', isFullscreen && 'bg-[#F9F9FB]')}>

            {/* ✅ Flash overlay on new order */}
            <AnimatePresence>
                {flashScreen && (
                    <motion.div
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-[#FF4B2B] z-50 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* ── Top Header ── */}
            <header className="shrink-0 bg-white border-b border-[#E8ECEF]">
                {/* Row 1: Main top bar */}
                <div className="h-[72px] px-6 flex items-center justify-between">
                    {/* Left: Open Tickets + Avg time */}
                    <div className="flex items-center gap-5 w-1/3">
                        <div className="flex flex-col">
                            <span className="text-[#0E4F5D] font-bold text-[17px]">
                                {sortedOrders.length} Open Ticket{sortedOrders.length !== 1 ? 's' : ''}
                            </span>
                            {avgCookTime && (
                                <span className="text-[12px] text-gray-400 font-medium">Avg: {avgCookTime} min</span>
                            )}
                        </div>
                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27AE60] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27AE60]"></span>
                            </span>
                            <span className="text-[12px] font-semibold text-[#27AE60]">Live</span>
                        </div>
                    </div>

                    {/* Center: Title */}
                    <div className="flex items-center justify-center gap-2 w-1/3">
                        <h1 className="text-[20px] font-bold text-[#1a1a1a]">Paris Display</h1>
                        <span className="text-[11px] font-bold bg-[#27AE60]/10 text-[#27AE60] px-2 py-0.5 rounded-full uppercase tracking-wide">Online</span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-2 w-1/3">
                        {/* Test / Simulate */}
                        <button
                            onClick={simulateIncomingOrder}
                            title="Simulate new order"
                            className="flex items-center gap-1 px-3 py-2 text-gray-400 font-semibold text-sm hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Test
                        </button>
                        {/* Fullscreen toggle */}
                        <button
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            className="w-9 h-9 flex items-center justify-center border border-[#E8ECEF] rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Row 2: Sort control + Aggregation */}
                <div className="px-6 pb-3 flex items-center gap-4">
                    {/* Sort Toggle */}
                    <div className="flex gap-1 bg-[#F5F6FA] p-1 rounded-xl shrink-0">
                        <button
                            onClick={() => setSortOrder('oldest')}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1',
                                sortOrder === 'oldest'
                                    ? 'bg-white text-[#FF4B2B] shadow-sm'
                                    : 'text-gray-400 hover:text-gray-700'
                            )}
                        >
                            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                            الأقدم أولاً
                        </button>
                        <button
                            onClick={() => setSortOrder('newest')}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1',
                                sortOrder === 'newest'
                                    ? 'bg-white text-[#FF4B2B] shadow-sm'
                                    : 'text-gray-400 hover:text-gray-700'
                            )}
                        >
                            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                            الأحدث أولاً
                        </button>
                    </div>

                    {/* Aggregation strip */}
                    {aggregation.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-0.5">
                            {aggregation.map(({ name, count }) => (
                                <div key={name} className="flex items-center gap-1.5 bg-[#F5F6FA] border border-[#E8ECEF] rounded-lg px-3 py-1 shrink-0">
                                    <span className="text-[13px] font-black text-[#FF4B2B]">{count}x</span>
                                    <span className="text-[12px] font-semibold text-gray-700 max-w-[100px] truncate">{name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* ── Orders Horizontal Grid ── */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
                <motion.div
                    layout
                    className="flex flex-row gap-5 h-full min-w-max items-start"
                >
                    <AnimatePresence mode="popLayout">
                        {sortedOrders.map(order => (
                            <div key={order.splitId} className="w-[320px] shrink-0 h-full">
                                <OrderCard
                                    order={order}
                                    onBump={handleBump}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            </div>
                        ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {sortedOrders.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 min-w-[600px] h-full flex flex-col items-center justify-center gap-4"
                        >
                            <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col items-center gap-3">
                                <span className="material-symbols-outlined text-[#27AE60] text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <h3 className="text-2xl font-bold text-gray-700">All Caught Up!</h3>
                                <p className="text-gray-400 text-sm">No active orders at the moment</p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
