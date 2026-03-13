'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_MENU = [
    { "id": 1, "name": "THE شاي", "price": 8, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner", "Boissons & Salades"] },
    { "id": 2, "name": "CAFE قهوة", "price": 6, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner", "Boissons & Salades"] },
    { "id": 3, "name": "JUS AU CHOIX عصير", "price": 10, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner", "Boissons & Salades"] },
    { "id": 4, "name": "LAIT AU CHOCOLAT حليب بالشوكولاتة", "price": 6, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner", "Boissons & Salades"] },
    { "id": 5, "name": "OMELETTE AU KHLI3 أمليط بالخليع", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 6, "name": "OMELETTE AU FROMAGE أمليط بالفرماج", "price": 10, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 7, "name": "OMELETTE AUX CREVETTES أمليط بالكروفيت", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 8, "name": "OMELETTE NATURE أمليط عادي", "price": 6, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 9, "name": "OMELETTE AUX CHAMPIGNONS أمليط شومبينيو", "price": 8, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 10, "name": "CREPE AUX FRUITS ET CHOCOLAT 2P كريب بالفواكه و الشوكلاط", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 11, "name": "GAUFRES كوفغي أو ووفرز", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 12, "name": "PANNA COTTA باناكوتا", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 13, "name": "CREME CARAMEL كريم كراميل", "price": 10, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 14, "name": "TIRAMISU تيراميسو", "price": 15, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 15, "name": "MSEMEN مسمن", "price": 3, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 16, "name": "MAKHMAR مخمار", "price": 3, "station": "Kitchen", "emoji": "☕", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Petit Dejeuner"] },
    { "id": 17, "name": "OMELETTE FROMAGE", "price": 10, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 10 }, { "name": "Panini (P)", "price": 15 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 18, "name": "POULET", "price": 15, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 15 }, { "name": "Panini (P)", "price": 20 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 19, "name": "SAUCISSES", "price": 15, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 15 }, { "name": "Panini (P)", "price": 20 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 20, "name": "VIANDE HACHEE", "price": 15, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 15 }, { "name": "Panini (P)", "price": 20 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 21, "name": "MIXTE", "price": 15, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 15 }, { "name": "Panini (P)", "price": 20 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 22, "name": "SPECIAL", "price": 20, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 20 }, { "name": "Panini (P)", "price": 20 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 23, "name": "KEEBDA", "price": 20, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 20 }, { "name": "Panini (P)", "price": 25 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 24, "name": "NUGGET", "price": 25, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 25 }, { "name": "Panini (P)", "price": 25 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 25, "name": "CORDON BLEU", "price": 25, "station": "Kitchen", "emoji": "🥪", "available": true, "description": "", "variants": [{ "name": "Sandwich (S)", "price": 25 }, { "name": "Panini (P)", "price": 25 }], "extras": [{ "name": "إضافة أومليت", "price": 5 }], "categories": ["Sandwich / Panini"] },
    { "id": 26, "name": "MARGHERITA", "price": 20, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 20 }, { "name": "Grand (G)", "price": 30 }], "extras": [], "categories": ["Pizza"] },
    { "id": 27, "name": "VEGETARIENNE", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 40 }], "extras": [], "categories": ["Pizza"] },
    { "id": 28, "name": "CHARCUTERIE", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 40 }], "extras": [], "categories": ["Pizza"] },
    { "id": 29, "name": "POULET", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 40 }], "extras": [], "categories": ["Pizza"] },
    { "id": 30, "name": "THON", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 40 }], "extras": [], "categories": ["Pizza"] },
    { "id": 31, "name": "VIANDE HACHEE", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 40 }], "extras": [], "categories": ["Pizza"] },
    { "id": 32, "name": "4 FROMAGE", "price": 40, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 40 }, { "name": "Grand (G)", "price": 50 }], "extras": [], "categories": ["Pizza"] },
    { "id": 33, "name": "4 SAISON", "price": 40, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 40 }, { "name": "Grand (G)", "price": 50 }], "extras": [], "categories": ["Pizza"] },
    { "id": 34, "name": "FRUITS DE MER", "price": 40, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 40 }, { "name": "Grand (G)", "price": 50 }], "extras": [], "categories": ["Pizza"] },
    { "id": 35, "name": "ROYAL", "price": 45, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 45 }, { "name": "Grand (G)", "price": 55 }], "extras": [], "categories": ["Pizza"] },
    { "id": 36, "name": "PARIS FOOD", "price": 45, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 45 }, { "name": "Grand (G)", "price": 55 }], "extras": [], "categories": ["Pizza"] },
    { "id": 37, "name": "CHOCOLAT", "price": 30, "station": "Oven", "emoji": "🍕", "available": true, "description": "", "variants": [{ "name": "Normal (N)", "price": 30 }, { "name": "Grand (G)", "price": 35 }], "extras": [], "categories": ["Pizza"] },
    { "id": 38, "name": "POULET", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 39, "name": "SAUCISSES", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 40, "name": "VIANDE HACHEE", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 41, "name": "PLATS NUGGET", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 42, "name": "EMINCE POULET", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 43, "name": "CORDON BLEU", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 44, "name": "PLATS ESCALOPE", "price": 50, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 45, "name": "BECARBONARA", "price": 30, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 46, "name": "POULET (Pâtes)", "price": 30, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 47, "name": "BOLONAISE", "price": 30, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 48, "name": "FRUIT DE MER (Pâtes)", "price": 40, "station": "Kitchen", "emoji": "🍝", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Plats & Pates"] },
    { "id": 49, "name": "JUS D'ORANGE", "price": 15, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 50, "name": "JUS DE BANAN", "price": 15, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 51, "name": "JUS D'AVOCAT", "price": 20, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 52, "name": "JUS MOKHITO", "price": 20, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 53, "name": "JUS PANACHE", "price": 20, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 54, "name": "JUS ZA3ZA3", "price": 30, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 55, "name": "CANETTES", "price": 6, "station": "Bar", "emoji": "🥤", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 56, "name": "SALADE PECHEUR", "price": 40, "station": "Bar", "emoji": "🥗", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 57, "name": "SALADE MEXICAINE", "price": 20, "station": "Bar", "emoji": "🥗", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 58, "name": "SALADEMAROCAINE", "price": 20, "station": "Bar", "emoji": "🥗", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 59, "name": "SALADE VARIEE", "price": 25, "station": "Bar", "emoji": "🥗", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Boissons & Salades"] },
    { "id": 60, "name": "CREPE", "price": 25, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 61, "name": "PANNA COTTA", "price": 25, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 62, "name": "CREME CARAMEL", "price": 35, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 63, "name": "TIRAMISU", "price": 40, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 64, "name": "SALADE DE FRUITS", "price": 40, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 65, "name": "NUGGET 5 PIECES", "price": 20, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 66, "name": "FRITE", "price": 5, "station": "Kitchen", "emoji": "🍟", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 67, "name": "FROMAGE", "price": 5, "station": "Kitchen", "emoji": "🍮", "available": true, "description": "", "variants": [], "extras": [], "categories": ["Desserts & Supp"] },
    { "id": 68, "name": "POULET", "price": 25, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 25 }, { "name": "XL", "price": 35 }], "extras": [], "categories": ["Tacos"] },
    { "id": 69, "name": "SAUCISSES", "price": 25, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 25 }, { "name": "XL", "price": 35 }], "extras": [], "categories": ["Tacos"] },
    { "id": 70, "name": "VIANDE HACHEE", "price": 25, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 25 }, { "name": "XL", "price": 35 }], "extras": [], "categories": ["Tacos"] },
    { "id": 71, "name": "MIXTE", "price": 30, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 30 }, { "name": "XL", "price": 40 }], "extras": [], "categories": ["Tacos"] },
    { "id": 72, "name": "NUGGET", "price": 30, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 30 }, { "name": "XL", "price": 40 }], "extras": [], "categories": ["Tacos"] },
    { "id": 73, "name": "CRESPI", "price": 30, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 30 }, { "name": "XL", "price": 40 }], "extras": [], "categories": ["Tacos"] },
    { "id": 74, "name": "CORDON BLEU", "price": 30, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 30 }], "extras": [], "categories": ["Tacos"] },
    { "id": 75, "name": "ROYAL", "price": 40, "station": "Kitchen", "emoji": "🌮", "available": true, "description": "", "variants": [{ "name": "L", "price": 40 }], "extras": [], "categories": ["Tacos"] },
    { "id": 76, "name": "PASTICOS", "price": 40, "station": "Oven", "emoji": "🥘", "available": true, "description": "", "variants": [], "extras": [{ "name": "غراتان (Gratine)", "price": 5 }, { "name": "غراتان بيتزا (Gratine Pizza)", "price": 10 }], "categories": ["Pasticos"] }
];

const MENU_KEY = 'kds_menu';
const CATEGORIES = ['Petit Dejeuner', 'Sandwich / Panini', 'Pizza', 'Plats & Pates', 'Boissons & Salades', 'Desserts & Supp', 'Tacos', 'Pasticos'];
const STATIONS = ['Kitchen', 'Oven', 'Bar', 'Cafeteria', 'Grill'];
const EMOJIS = ['🍔', '🍗', '🥩', '🌮', '🥗', '🍟', '🧅', '🍞', '🥤', '🧃', '💧', '🍕', '🍜', '🥘', '🫕'];

export function getMenuItems() {
    if (typeof window === 'undefined') return DEFAULT_MENU;
    const saved = localStorage.getItem(MENU_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_MENU;
}

function saveMenu(items) {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

const BLANK_ITEM = { name: '', price: '', categories: ['Burgers'], station: 'Grill', emoji: '🍔', available: true };

export default function MenuManager() {
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState(BLANK_ITEM);
    const [filterCat, setFilterCat] = useState('All');
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e, isEditing) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.url) {
                if (isEditing) {
                    setEditData(prev => ({ ...prev, emoji: data.url }));
                } else {
                    setNewItem(prev => ({ ...prev, emoji: data.url }));
                }
                toast.success('تم رفع الصورة بنجاح');
            } else {
                toast.error(data.error || 'فشل رفع الصورة');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('حدث خطأ أثناء الرفع');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error("Supabase Error (MenuManager):", error.message, error.hint);
                // Fallback to local if server is down/unconfigured
                setItems(getMenuItems());
            } else {
                setItems(data);
                // Sync local for offline redundancy
                saveMenu(data);
            }
        };

        fetchItems();

        // Real-time subscription
        const channel = supabase
            .channel('menu_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'menu_items' },
                () => fetchItems()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filtered = filterCat === 'All' ? items : items.filter(i => i.categories && i.categories.includes(filterCat));

    const handleToggleAvail = async (id) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const { error } = await supabase
            .from('menu_items')
            .update({ available: !item.available })
            .eq('id', id);

        if (error) {
            toast.error('فشل تحديث الحالة');
        } else {
            toast.success('تم تحديث الحالة');
        }
    };

    const handleStartEdit = (item) => {
        setEditingId(item.id);
        const categories = item.categories || (item.category ? [item.category] : []);
        setEditData({ name: item.name, price: item.price, categories, station: item.station, emoji: item.emoji });
    };

    const handleSaveEdit = async (id) => {
        if (!editData.name || !editData.price) { toast.error('أكمل البيانات'); return; }

        const { error } = await supabase
            .from('menu_items')
            .update({
                ...editData,
                price: Number(editData.price)
            })
            .eq('id', id);

        if (error) {
            toast.error('فشل حفظ التعديل');
        } else {
            setEditingId(null);
            toast.success('تم حفظ التعديل');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('حذف هذا الصنف؟')) return;

        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('فشل الحذف');
        } else {
            toast.success('تم الحذف');
        }
    };

    const handleAddNew = async () => {
        if (!newItem.name || !newItem.price) { toast.error('أدخل اسم وسعر الصنف'); return; }

        const { error } = await supabase
            .from('menu_items')
            .insert([{
                ...newItem,
                price: Number(newItem.price)
            }]);

        if (error) {
            toast.error('فشل إضافة الصنف');
        } else {
            setNewItem(BLANK_ITEM);
            setShowAddForm(false);
            toast.success(`✅ تمت إضافة "${newItem.name}"`);
        }
    };

    const handleReset = async () => {
        if (!confirm('سيتم حذف المنيو الحالي واستعادة الافتراضي من السحاب. هل أنت متأكد؟')) return;

        // 1. Clear existing from DB
        const { error: delError } = await supabase
            .from('menu_items')
            .delete()
            .neq('id', 0); // Delete all

        if (delError) {
            toast.error('فشل مسح البيانات السحابية');
            return;
        }

        // 2. Insert defaults to DB (Stripping IDs to let Supabase generate new ones if needed, or keeping them if aligned)
        const menuToInsert = DEFAULT_MENU.map(({ id, ...rest }) => rest);
        const { error: insError } = await supabase
            .from('menu_items')
            .insert(menuToInsert);

        if (insError) {
            toast.error('فشل استعادة الافتراضي سحابياً');
        } else {
            toast.success('تمت استعادة المنيو الافتراضي بنجاح');
        }
    };

    const toggleCategory = (cat, isEditing) => {
        if (isEditing) {
            setEditData(prev => ({
                ...prev,
                categories: prev.categories.includes(cat)
                    ? prev.categories.filter(c => c !== cat)
                    : [...prev.categories, cat]
            }));
        } else {
            setNewItem(prev => ({
                ...prev,
                categories: prev.categories.includes(cat)
                    ? prev.categories.filter(c => c !== cat)
                    : [...prev.categories, cat]
            }));
        }
    };

    const catBadge = 'text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF4B2B]/10 text-[#FF4B2B]';

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2 flex-wrap">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterCat === cat ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                        >{cat}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                    >
                        <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                        إعادة تعيين
                    </button>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[14px]">{showAddForm ? 'close' : 'add'}</span>
                        {showAddForm ? 'إلغاء' : 'إضافة صنف'}
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">➕ إضافة صنف جديد</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="text-xs text-gray-500 font-bold block mb-1">الإيموجي / أيقونة</label>
                            <div className="flex gap-1 relative">
                                <select value={(newItem.emoji?.startsWith('/uploads/') || newItem.emoji?.startsWith('http')) ? '' : newItem.emoji} onChange={e => setNewItem(p => ({ ...p, emoji: e.target.value }))}
                                    className="w-16 px-1 py-2 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary">
                                    <option value="">...</option>
                                    {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <div className="flex-1 relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, false)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isUploading}
                                    />
                                    <div className="w-full h-full min-h-[40px] px-2 py-2 flex items-center justify-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 overflow-hidden">
                                        {isUploading ? (
                                            <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                                        ) : (newItem.emoji?.startsWith('/uploads/') || newItem.emoji?.startsWith('http')) ? (
                                            <img src={newItem.emoji} alt="icon" className="w-6 h-6 object-contain" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                                <span className="truncate">رفع صورة</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 font-bold block mb-1">الاسم *</label>
                            <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                                placeholder="مثال: Special Burger"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold block mb-1">السعر (DH) *</label>
                            <input type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                                placeholder="50"
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold block mb-1">الفئات</label>
                            <div className="flex flex-wrap gap-1 mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg max-h-32 overflow-y-auto">
                                {CATEGORIES.map(c => (
                                    <label key={c} className="flex items-center gap-1 cursor-pointer bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded w-full sm:w-auto text-xs">
                                        <input
                                            type="checkbox"
                                            className="w-3 h-3 flex-shrink-0"
                                            checked={newItem.categories?.includes(c)}
                                            onChange={() => toggleCategory(c, false)}
                                        />
                                        <span className="truncate">{c}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold block mb-1">المحطة</label>
                            <select value={newItem.station} onChange={e => setNewItem(p => ({ ...p, station: e.target.value }))}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary">
                                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleAddNew}
                        className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all">
                        ✅ إضافة للقائمة
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#E8ECEF] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-[#E8ECEF]">
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">الصنف</th>
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">السعر</th>
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">الفئات</th>
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">المحطة</th>
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F0F0]">
                            {filtered.map(item => (
                                <tr key={item.id} className={`bg-white transition-colors hover:bg-[#FFF8F6] ${!item.available ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2">
                                                <div className="flex flex-col gap-1 w-20">
                                                    <select value={(editData.emoji?.startsWith('/uploads/') || editData.emoji?.startsWith('http')) ? '' : editData.emoji} onChange={e => setEditData(p => ({ ...p, emoji: e.target.value }))}
                                                        className="w-full text-base bg-white border border-[#E8ECEF] rounded-lg focus:outline-none focus:border-[#FF4B2B]">
                                                        <option value="">...</option>
                                                        {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                                    </select>
                                                    <div className="relative h-8 w-full bg-gray-50 border border-dashed border-[#E8ECEF] rounded-lg flex items-center justify-center overflow-hidden">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, true)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            disabled={isUploading}
                                                        />
                                                        {isUploading ? (
                                                            <span className="animate-spin material-symbols-outlined text-[14px]">sync</span>
                                                        ) : (editData.emoji?.startsWith('/uploads/') || editData.emoji?.startsWith('http')) ? (
                                                            <img src={editData.emoji} alt="icon" className="w-5 h-5 object-contain" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-[14px] text-gray-400">upload</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                                                    className="flex-1 px-2 py-1 text-sm bg-white border border-[#FF4B2B] rounded-lg focus:outline-none h-fit self-center" />
                                            </div>
                                        ) : (
                                            <span className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
                                                {(item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http')) ? (
                                                    <img src={item.emoji} alt="" className="w-6 h-6 object-contain inline-block" />
                                                ) : (
                                                    <span>{item.emoji}</span>
                                                )}
                                                {item.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === item.id ? (
                                            <input type="number" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))}
                                                className="w-20 px-2 py-1 text-sm bg-white border border-[#FF4B2B] rounded-lg focus:outline-none" />
                                        ) : (
                                            <span className="text-sm font-bold text-[#FF4B2B]">{item.price} DH</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-top min-w-[150px]">
                                        {editingId === item.id ? (
                                            <div className="flex flex-wrap gap-1 p-1 bg-white border border-[#FF4B2B] rounded-lg max-h-32 overflow-y-auto w-full">
                                                {CATEGORIES.map(c => (
                                                    <label key={c} className="flex items-center gap-1 cursor-pointer bg-gray-50 px-1.5 py-1 rounded w-full text-xs box-border">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3 h-3 flex-shrink-0"
                                                            checked={editData.categories?.includes(c)}
                                                            onChange={() => toggleCategory(c, true)}
                                                        />
                                                        <span className="truncate">{c}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {(item.categories || []).map(cat => (
                                                    <span key={cat} className={catBadge}>{cat}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === item.id ? (
                                            <select value={editData.station} onChange={e => setEditData(p => ({ ...p, station: e.target.value }))}
                                                className="px-2 py-1 text-xs bg-white border border-[#FF4B2B] rounded-lg focus:outline-none">
                                                {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-500">{item.station}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleToggleAvail(item.id)}
                                            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${item.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 hover:bg-gray-200'}`}>
                                            {item.available ? '✓ متاح' : '✗ غير متاح'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {editingId === item.id ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(item.id)}
                                                        className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-all">
                                                        <span className="material-symbols-outlined text-[15px]">save</span>
                                                    </button>
                                                    <button onClick={() => setEditingId(null)}
                                                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-all">
                                                        <span className="material-symbols-outlined text-[15px]">close</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleStartEdit(item)}
                                                        className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 transition-all">
                                                        <span className="material-symbols-outlined text-[15px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-all">
                                                        <span className="material-symbols-outlined text-[15px]">delete</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-gray-400 text-center">{items.length} صنف إجمالاً · {items.filter(i => i.available).length} متاح · {items.filter(i => !i.available).length} غير متاح</p>
        </div>
    );
}
