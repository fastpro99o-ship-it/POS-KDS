'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, parseItemName } from '@/lib/utils';

const MAX_TIME = 600; // 10 mins = danger zone (Red)
const WARN_TIME = 300; // 5 mins = warning zone (Yellow)

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
        if (elapsed > MAX_TIME) return 'late';
        if (elapsed > WARN_TIME) return 'warning';
        return 'new';
    }, [elapsed]);

    const config = {
        new: {
            headerBg: 'bg-white',
            headerTextId: 'text-[#2D9CDB] border-b border-[#2D9CDB]',
            headerTextTable: 'text-gray-400',
            headerTime: 'text-[#2D9CDB]',
            cardBorder: 'border-transparent',
        },
        warning: {
            headerBg: 'bg-[#F2D06B]',
            headerTextId: 'text-[#1A1A1A]',
            headerTextTable: 'text-[#1A1A1A]/70',
            headerTime: 'text-[#1A1A1A]',
            cardBorder: 'border-[#F2D06B]',
        },
        late: {
            headerBg: 'bg-[#EB5757]',
            headerTextId: 'text-white',
            headerTextTable: 'text-white/80',
            headerTime: 'text-white',
            cardBorder: 'border-[#EB5757]',
        },
    };

    const c = config[status];

    // Countdown/Elapsed Timer format (MM:SS)
    const mins = Math.floor(elapsed / 60);
    const secs = String(elapsed % 60).padStart(2, '0');

    const primaryId = order.idString ? order.idString.split(',')[0] : order.id;
    const isPreparing = order.status === 'preparing';

    // Group items by category (fallback to station or 'OTHER')
    const groupedItems = useMemo(() => {
        const groups = {};
        order.items.forEach(item => {
            // Using category if available, otherwise station, otherwise OTHER
            const cat = (item.categories && item.categories.length > 0) ? item.categories[0] : (item.station || 'OTHER');
            const upperCat = String(cat).toUpperCase();
            if (!groups[upperCat]) groups[upperCat] = [];
            groups[upperCat].push(item);
        });
        return groups;
    }, [order.items]);

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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                'relative flex flex-col bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden cursor-grab active:cursor-grabbing h-full border',
                c.cardBorder
            )}
        >
            {/* Header section */}
            <div className={cn('px-5 pt-4 pb-3 flex justify-between items-end', c.headerBg)}>
                <div className="flex flex-col border-b border-transparent">
                    <span className={cn('text-sm font-semibold mb-0.5', c.headerTextTable)}>
                        {(order.table || '').toString().match(/^\d+$/) ? `Table ${order.table}` : (order.table || 'Table ?')}
                    </span>
                    <h3 className={cn('text-[28px] font-bold leading-none', c.headerTextId, status === 'new' && 'pb-1')}>
                        #{String(primaryId).slice(-4)}
                    </h3>
                </div>
                <div className={cn('text-[18px] font-semibold mb-1', c.headerTime)}>
                    {String(mins).padStart(2, '0')}:{secs}
                </div>
            </div>

            {/* If it's a new ticket, it has a subtle gray border below the header but we simulate it on the groups */}

            {/* Items List (Grouped) */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                {Object.entries(groupedItems).map(([category, items], gIdx) => (
                    <div key={gIdx} className="w-full">
                        {/* Group Category Header */}
                        <div className="w-full bg-[#f9f9fb] border-y border-[#E8ECEF] px-5 py-2">
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{category}</h4>
                        </div>
                        
                        {/* Group Items */}
                        <div className="flex flex-col w-full">
                            {items.map((item, idx) => {
                                const { main, variant, extras } = parseItemName(item.name);
                                return (
                                    <div key={idx} className="flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0">
                                        <span className="text-[20px] font-bold text-[#1A1A1A] w-6 shrink-0">{item.qty}</span>
                                        <div className="flex flex-col mt-0.5">
                                            <span className="text-[17px] font-bold text-[#1A1A1A] leading-tight mb-2">
                                                {main}
                                            </span>
                                            
                                            {variant && (
                                                <span className="text-[14px] font-medium text-[#27AE60] mb-1 leading-snug">
                                                    - {variant}
                                                </span>
                                            )}
                                            {extras && (
                                                <span className="text-[14px] font-medium text-[#27AE60] mb-1 leading-snug">
                                                    - {extras}
                                                </span>
                                            )}
                                            {item.note && (
                                                <span className="text-[14px] font-medium text-gray-400 leading-snug">
                                                    {item.note}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Actions */}
            <div className="px-5 py-4 border-t border-dashed border-[#E8ECEF] bg-white flex items-center justify-between mt-auto">
                <button 
                    onClick={() => onStatusUpdate(primaryId, 'waiter_requested')}
                    className="text-[#27AE60] font-semibold text-[15px] hover:bg-[#27AE60]/10 px-3 py-1.5 rounded-lg transition-colors -ml-3"
                >
                    Request Waiter
                </button>
                
                {order.status === 'pending' ? (
                     <button
                        onClick={() => onStatusUpdate(primaryId, 'preparing')}
                        className="px-6 py-2 rounded-lg border-2 border-[#E66200] text-[#E66200] font-bold text-[15px] hover:bg-[#E66200]/10 transition-colors"
                    >
                        Prepare
                    </button>
                ) : (
                    <button
                        onClick={() => onBump(order.idString || String(order.id), order.displayStation || 'All')}
                        className="px-6 py-2 rounded-lg border-2 border-[#2D9CDB] text-[#2D9CDB] font-bold text-[15px] hover:bg-[#2D9CDB]/10 transition-colors"
                    >
                        Serve
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default OrderCard;

