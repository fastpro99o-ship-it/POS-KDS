const fs = require('fs');

const path = 'c:/Users/EL-OTHEMANY/Downloads/KDS-KITCHEN-DISPLAY/components/MenuGrid.js';
let content = fs.readFileSync(path, 'utf8');

const modalStr = `
function ItemModal({ item, onClose, onConfirm }) {
    const [selectedVariant, setSelectedVariant] = useState(
        item.variants && item.variants.length > 0 ? item.variants[0] : null
    );
    const [selectedExtras, setSelectedExtras] = useState([]);

    const toggleExtra = (extra) => {
        setSelectedExtras(prev => {
            const exists = prev.find(e => e.name === extra.name);
            if (exists) return prev.filter(e => e.name !== extra.name);
            return [...prev, extra];
        });
    };

    const handleAdd = () => {
        let finalName = item.name;
        let finalPrice = item.price;
        
        if (selectedVariant) {
            finalName += ' (' + selectedVariant.name + ')';
            finalPrice = selectedVariant.price;
        }

        if (selectedExtras.length > 0) {
            const extraNames = selectedExtras.map(e => e.name).join(' + ');
            finalName += ' + ' + extraNames;
            finalPrice += selectedExtras.reduce((sum, e) => sum + e.price, 0);
        }

        const orderItem = {
            ...item,
            id: item.id + '-' + Date.now(),
            name: finalName,
            price: finalPrice
        };

        onConfirm(orderItem);
    };

    const currentTotal = (selectedVariant ? selectedVariant.price : item.price) + 
                         selectedExtras.reduce((sum, e) => sum + e.price, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.emoji}</span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                    {item.variants && item.variants.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">اختر المتغير / الحجم</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {item.variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={"p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-center items-center gap-1 " + (
                                            selectedVariant?.name === variant.name
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:border-gray-200'
                                        )}
                                    >
                                        <span className="font-bold text-sm w-full text-center">{variant.name}</span>
                                        <span className={"text-xs w-full text-center " + (selectedVariant?.name === variant.name ? 'text-primary' : 'text-gray-500')}>{variant.price} DH</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.extras && item.extras.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">إضافات اختيارية</h4>
                            <div className="space-y-2">
                                {item.extras.map((extra, idx) => {
                                    const isSelected = selectedExtras.some(e => e.name === extra.name);
                                    return (
                                        <label
                                            key={idx}
                                            className={"flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all " + (
                                                isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-200'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isSelected}
                                                    onChange={() => toggleExtra(extra)}
                                                />
                                                <div className={"w-5 h-5 rounded border flex items-center justify-center transition-colors " + (isSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600')}>
                                                    {isSelected && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                                </div>
                                                <span className={"text-sm font-bold " + (isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-300')}>{extra.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">+{extra.price} DH</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                        onClick={handleAdd}
                        className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-between px-6"
                    >
                        <span>إضافة للطلب</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{currentTotal} DH</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MenuGrid({ onAdd }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);

    const filtered = activeCategory === 'All'
        ? MENU_ITEMS
        : MENU_ITEMS.filter(item => item.category === activeCategory);

    return (
        <div className="flex flex-col gap-4 relative">
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={"px-4 py-2 rounded-full text-sm font-bold transition-all " + (activeCategory === cat
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(item => {
                    const hasOptions = (item.variants && item.variants.length > 0) || (item.extras && item.extras.length > 0);
                    return (
                        <button
                            key={item.id}
                            onClick={() => hasOptions ? setSelectedItem(item) : onAdd({...item, id: item.id + '-' + Date.now()})}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all group active:scale-[0.97]"
                        >
                            <div className="text-3xl mb-3">{item.emoji}</div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-primary font-bold text-sm">
                                    {item.variants && item.variants.length > 0 ? "من " + item.variants[0].price : item.price} DH
                                </span>
                                <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-primary bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md transition-colors">
                                    {hasOptions ? 'tune' : 'add'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedItem && (
                <ItemModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    onConfirm={(customizedItem) => {
                        onAdd(customizedItem);
                        setSelectedItem(null);
                    }} 
                />
            )}
        </div>
    );
}

export { MENU_ITEMS };
`;

const newContent = content.substring(0, content.indexOf('export default function MenuGrid({ onAdd }) {')) + modalStr;

fs.writeFileSync(path, newContent, 'utf8');
console.log('Replaced MenuGrid component successfully');
