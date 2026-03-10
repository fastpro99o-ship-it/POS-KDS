'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, parseItemName } from '@/lib/utils';

const MAX_TIME = 600; // 10 mins = danger zone

const OrderCard = ({ order, onBump, onStatusUpdate }) => {
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
            border: 'border-zinc-300 dark:border-zinc-600',
            bg: 'bg-white dark:bg-surface-dark',
            timerColor: 'text-zinc-600 dark:text-zinc-400',
            timerBg: 'bg-zinc-100 dark:bg-zinc-800',
            bar: 'bg-zinc-300',
            badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
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

    const isPreparing = order.status === 'preparing';

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
            className={cn(
                'relative flex flex-col rounded-2xl shadow-soft border-l-[6px] overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg',
                isPreparing ? 'border-primary bg-primary-light/50 dark:bg-primary-light/10' : c.border,
                !isPreparing && c.bg
            )}
        >
            {/* Timer Progress Bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-700 w-full">
                <div
                    className={cn('h-full transition-all duration-1000', isPreparing ? 'bg-primary' : c.bar)}
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-poppins font-bold text-text-main dark:text-gray-100">#{String(primaryId).slice(-6)}</h3>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider', isPreparing ? 'bg-primary-light text-primary' : c.badge)}>
                            {isPreparing ? 'PREPARING' : c.label}
                        </span>
                        {isGrouped && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-md">
                                مجمع
                            </span>
                        )}
                        {status === 'late' && (
                            <span className="animate-pulse flex h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {order.type} • {(order.table || '').toString().match(/^\d+$/) ? `طاولة ${order.table}` : (order.table || 'N/A')}
                    </p>
                </div>

                {/* Timer Badge */}
                <div className={cn('flex flex-col items-center px-3 py-1.5 rounded-xl', isPreparing ? 'bg-primary-light dark:bg-primary-shadow' : c.timerBg)}>
                    <span className={cn('font-mono font-bold text-xl leading-none', isPreparing ? 'text-primary' : c.timerColor)}>
                        {isLate ? '-' : ''}{mins}:{secs}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">الوقت</span>
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
                                    <p className="text-xs text-primary dark:text-primary-light font-bold mt-1 inline-flex items-center gap-1 bg-primary-light/50 px-1.5 py-0.5 rounded">
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
            <div className="p-3 mt-auto bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/50 flex gap-2">
                {!isPreparing ? (
                    <button
                        onClick={() => onStatusUpdate(primaryId, 'preparing')}
                        className="flex-1 py-3 bg-primary hover:bg-[#E66200] text-white rounded-xl font-bold text-sm shadow-orange-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        بدء التحضير
                    </button>
                ) : (
                    <button
                        onClick={() => onBump(order.idString || String(order.id), order.displayStation || 'All')}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {order.isPartial ? 'إكمال الجزء' : 'إكمال الطلب'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard;
