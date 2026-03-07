'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
        const newOrder = {
            id: String(id),
            table: 'Test',
            type: 'Simulation',
            startTime: Date.now(),
            items: [{ name: 'Simulated Burger', qty: 1, station: 'Grill' }]
        };
        setOrders(prev => [newOrder, ...prev]);
        playNewOrderSound();
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
                .update({ status: 'completed' })
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

    return (
        <div className="flex flex-col h-full">
            {/* Filters & Aggregation */}
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {['All', 'Grill', 'Salads', 'Oven', 'Fryer'].map((station) => (
                            <button
                                key={station}
                                onClick={() => setFilter(station)}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-primary/20'); }}
                                onDragLeave={(e) => { e.currentTarget.classList.remove('bg-primary/20'); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('bg-primary/20');
                                    const payload = e.dataTransfer.getData('application/json');
                                    if (!payload) return;
                                    const { idString, oldStation } = JSON.parse(payload);
                                    if (station === 'All' || oldStation === station) return;

                                    const ids = idString.split(',');
                                    setOrders(prev => prev.map(o => {
                                        if (ids.includes(o.id.toString())) {
                                            return {
                                                ...o,
                                                items: o.items.map(item => ({
                                                    ...item,
                                                    station: (item.station || 'Other') === oldStation ? station : item.station
                                                }))
                                            };
                                        }
                                        return o;
                                    }));
                                    toast.success(`تم نقل الطلب إلى قسم ${station}`);
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-bold transition-all border border-transparent",
                                    filter === station
                                        ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                {station.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={simulateIncomingOrder}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Test Sound
                        </button>
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Live Feed</span>
                    </div>
                </div>

                <AggregationBar items={aggregatedItems} />
            </div>

            {/* Orders Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24"
            >
                <AnimatePresence mode="popLayout">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order.splitId}
                            order={order}
                            onBump={handleBump}
                        />
                    ))}
                </AnimatePresence>

                {/* Empty State / Incoming */}
                {filteredOrders.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/20"
                    >
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                            <span className="material-symbols-outlined text-gray-400 text-3xl">restaurant</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Caught Up!</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No active orders for {filter}</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
