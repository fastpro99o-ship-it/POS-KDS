import React from 'react';
import { cn, parseItemName } from '@/lib/utils';

export const AggregationBar = ({ items }) => {
    return (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-inner">
            {items.map((item, index) => {
                const { main, variant, extras } = parseItemName(item.name);
                return (
                    <div
                        key={index}
                        className={cn(
                            "flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all shrink-0",
                            item.count >= 5 && "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 animate-pulse"
                        )}
                    >
                        <div className="flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-lg px-2 py-1">
                            <span className="text-primary font-black text-xl leading-none">{item.count}x</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-gray-100 font-bold text-base leading-tight">
                                {main}
                            </span>
                            {(variant || extras) && (
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px]">
                                    {variant} {extras && `+ ${extras}`}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
            {items.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 italic text-sm">
                    <span className="material-symbols-outlined text-sm">info</span>
                    لا توجد أصناف قيد التحضير حالياً
                </div>
            )}
        </div>
    );
};
