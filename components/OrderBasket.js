'use client';

export default function OrderBasket({ items, onQtyChange, onRemove, onNote }) {
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                <span className="material-symbols-outlined text-5xl mb-2">shopping_basket</span>
                <p className="text-sm font-semibold">الطلب فارغ</p>
                <p className="text-xs mt-1">اختر أصناف من القائمة</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.emoji} {item.name}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">{(item.price * item.qty).toFixed(0)} DH</p>
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => onQtyChange(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all font-bold text-sm"
                        >—</button>
                        <span className="w-6 text-center font-bold text-gray-900 dark:text-gray-100 text-sm">{item.qty}</span>
                        <button
                            onClick={() => onQtyChange(item.id, +1)}
                            className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-all font-bold text-sm"
                        >+</button>
                        <input
                            type="text"
                            placeholder="ملاحظة..."
                            value={item.note || ''}
                            onChange={(e) => onNote(item.id, e.target.value)}
                            className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            ))}

            {/* Total */}
            <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">المجموع</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{total.toFixed(0)} DH</span>
            </div>
        </div>
    );
}
