'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function OrderBasket({ items, onQtyChange, onRemove, onNote }) {
    const { t } = useLanguage();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
                <span className="material-symbols-outlined text-[48px] mb-4 text-[#E8ECEF]">shopping_basket</span>
                <p className="text-sm font-bold text-gray-400 mb-1">{t('emptyBasket')}</p>
                <p className="text-xs">{t('emptyBasketSub')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {items.map(item => {
                const isImage = item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http');

                return (
                    <div key={item.id} className="flex gap-4 group items-center bg-white rounded-2xl">
                        {/* Image/Emoji */}
                        <div className="w-[60px] h-[60px] shrink-0 rounded-[14px] border border-[#E8ECEF] bg-gray-50 shadow-sm flex items-center justify-center overflow-hidden relative">
                            {isImage ? (
                                <img src={item.emoji} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[28px]">{item.emoji}</span>
                            )}
                            <button
                                onClick={() => onRemove(item.id)}
                                className="absolute inset-0 bg-red-500 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-[#1A1A1A] text-sm leading-tight mb-1 truncate" title={item.name}>
                                {item.name.replace(/\s\([^)]+\)/, '')}
                            </h4>
                            <p className="font-bold text-[#FF4B2B] text-sm mb-2.5">{(item.price).toFixed(0)} DH</p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onQtyChange(item.id, -1)}
                                    className="w-[28px] h-[28px] rounded-lg bg-[#F5F6FA] text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-200 transition-colors font-bold flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                </button>
                                <span className="w-6 text-center font-bold text-[#1A1A1A] text-[13px]">{item.qty}</span>
                                <button
                                    onClick={() => onQtyChange(item.id, +1)}
                                    className="w-[28px] h-[28px] rounded-lg bg-[#1A1A1A] text-white hover:bg-black transition-colors font-bold shadow-sm flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Line total */}
                        <div className="shrink-0 text-right">
                            <p className="text-sm font-black text-[#1A1A1A]">{(item.price * item.qty).toFixed(0)} DH</p>
                            {item.qty > 1 && (
                                <p className="text-xs text-gray-400">{item.qty} × {item.price} DH</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
