'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, parseItemName } from '@/lib/utils';

const MAX_TIME = 600; // 10 mins = danger zone

const OrderCard = ({ order, onBump }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        setElapsed(Math.floor((Date.now() - order.startTime) / 1000));
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - order.startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [order.startTime]);

    const status = useMemo(() => {
        if (elapsed > 600) return 'late';
        if (elapsed > 300) return 'warning';
        return 'new';
    }, [elapsed]);

    const progressPct = Math.min((elapsed / MAX_TIME) * 100, 100);

    const config = {
        new: {
            border: 'border-blue-500',
            bg: 'bg-white dark:bg-gray-800',
            timerColor: 'text-blue-600 dark:text-blue-400',
            timerBg: 'bg-blue-50 dark:bg-blue-900/20',
            bar: 'bg-blue-400',
            badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
            label: 'NEW',
        },
        warning: {
            border: 'border-yellow-400',
            bg: 'bg-yellow-50/50 dark:bg-yellow-900/10',
            timerColor: 'text-yellow-600 dark:text-yellow-400',
            timerBg: 'bg-yellow-50 dark:bg-yellow-900/20',
            bar: 'bg-yellow-400',
            badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
            label: 'SLOW',
        },
        late: {
            border: 'border-red-500',
            bg: 'bg-red-50/30 dark:bg-red-900/10',
            timerColor: 'text-red-600 dark:text-red-400',
            timerBg: 'bg-red-50 dark:bg-red-900/20',
            bar: 'bg-red-500',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
            label: 'LATE',
        },
    };

    const c = config[status];

    // Countdown Logic
    const remaining = MAX_TIME - elapsed;
    const isLate = remaining < 0;
    const absRemaining = Math.abs(remaining);
    const mins = Math.floor(absRemaining / 60);
    const secs = String(absRemaining % 60).padStart(2, '0');

    // Handle Grouped/Split IDs display
    const primaryId = order.idString ? order.idString.split(',')[0] : order.id;
    const isGrouped = order.idString && order.idString.split(',').length > 1;

    return (
        <motion.div
            layout
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({
                    idString: order.idString || String(order.id),
                    oldStation: order.displayStation || 'All'
                }));
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn('relative flex flex-col rounded-xl border-l-[6px] shadow-sm overflow-hidden cursor-grab active:cursor-grabbing', c.border, c.bg)}
        >
            {/* Timer Progress Bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-700 w-full">
                <div
                    className={cn('h-full transition-all duration-1000', c.bar)}
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">#{String(primaryId).slice(-6)}</h3>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider', c.badge)}>
                            {c.label}
                        </span>
                        {isGrouped && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-md">
                                مجمع
                            </span>
                        )}
                        {order.isPartial && (
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-md border border-dashed border-gray-400">
                                جزء
                            </span>
                        )}
                        {status === 'late' && (
                            <span className="animate-pulse flex h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {order.type} • {(order.table || '').toString().match(/^\d+$/) ? `Table ${order.table}` : (order.table || 'N/A')}
                    </p>
                </div>

                {/* Timer Badge */}
                <div className={cn('flex flex-col items-center px-3 py-1.5 rounded-xl', c.timerBg)}>
                    <span className={cn('font-mono font-bold text-xl leading-none', c.timerColor)}>
                        {isLate ? '-' : ''}{mins}:{secs}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">تبقّى</span>
                </div>
            </div>

            {/* Items */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                {order.items.map((item, idx) => {
                    const { main, variant, extras } = parseItemName(item.name);
                    return (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="min-w-[36px] h-9 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center border border-primary/20">
                                <span className="text-lg font-black text-primary">{item.qty}x</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                    {main}
                                </p>
                                {(variant || extras) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                                        {variant} {extras && `• ${extras}`}
                                    </p>
                                )}
                                {item.note && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-1 inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                                        <span className="material-symbols-outlined text-[14px]">description</span>
                                        {item.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer/Action */}
            <div className="p-3 mt-auto bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/50">
                <button
                    onClick={() => onBump(order.idString || String(order.id), order.displayStation || 'All')}
                    className={cn(
                        'w-full py-3 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2',
                        'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none'
                    )}
                >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {order.isPartial ? 'BUMP PARTIAL' : 'BUMP ORDER'}
                </button>
            </div>
        </motion.div>
    );
};

export default OrderCard;
