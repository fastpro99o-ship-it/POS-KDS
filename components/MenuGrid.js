'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MENU_ITEMS = [
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

const CATEGORIES = ['Petit Dejeuner', 'Sandwich / Panini', 'Pizza', 'Plats & Pates', 'Boissons & Salades', 'Desserts & Supp', 'Tacos', 'Pasticos'];

// Color/emoji metadata per category
const CATEGORY_META = {
    'Petit Dejeuner':     { emoji: '☕', color: '#FFF3E0', border: '#FFB74D', label: 'Petit Déjeuner' },
    'Sandwich / Panini':  { emoji: '🥪', color: '#FFF8E1', border: '#FFD54F', label: 'Sandwich / Panini' },
    'Pizza':              { emoji: '🍕', color: '#FFEBEE', border: '#EF9A9A', label: 'Pizza' },
    'Plats & Pates':      { emoji: '🍝', color: '#F3E5F5', border: '#CE93D8', label: 'Plats & Pâtes' },
    'Boissons & Salades': { emoji: '🥤', color: '#E8F5E9', border: '#A5D6A7', label: 'Boissons & Salades' },
    'Desserts & Supp':    { emoji: '🍮', color: '#FCE4EC', border: '#F48FB1', label: 'Desserts & Supp' },
    'Tacos':              { emoji: '🌮', color: '#E8EAF6', border: '#9FA8DA', label: 'Tacos' },
    'Pasticos':           { emoji: '🥘', color: '#E0F7FA', border: '#80DEEA', label: 'Pasticos' },
};

// ─── Item Modal ────────────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onConfirm }) {
    const [selectedVariant, setSelectedVariant] = useState(
        item.variants && item.variants.length > 0 ? item.variants[0] : null
    );
    const [selectedExtras, setSelectedExtras] = useState([]);
    const CONDIMENTS = ['حار 🌶️', 'كاتشب 🍅', 'مايونيز 🍳'];
    const [selectedCondiments, setSelectedCondiments] = useState([]);

    const toggleExtra = (extra) => {
        setSelectedExtras(prev => {
            const exists = prev.find(e => e.name === extra.name);
            if (exists) return prev.filter(e => e.name !== extra.name);
            return [...prev, extra];
        });
    };

    const toggleCondiment = (cond) => {
        setSelectedCondiments(prev =>
            prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
        );
    };

    const handleAdd = () => {
        let finalName = item.name;
        let finalPrice = item.price;
        if (selectedVariant) {
            finalName += ' (' + selectedVariant.name + ')';
            finalPrice = selectedVariant.price;
        }
        if (selectedExtras.length > 0) {
            finalName += ' + ' + selectedExtras.map(e => e.name).join(' + ');
            finalPrice += selectedExtras.reduce((sum, e) => sum + e.price, 0);
        }
        if (selectedCondiments.length > 0) {
            finalName += ' + ' + selectedCondiments.join(' + ');
        }
        onConfirm({ ...item, id: item.id + '-' + Date.now(), name: finalName, price: finalPrice });
    };

    const currentTotal = (selectedVariant ? selectedVariant.price : item.price) +
        selectedExtras.reduce((sum, e) => sum + e.price, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        {(item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http')) ? (
                            <img src={item.emoji} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                            <span className="text-3xl">{item.emoji}</span>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.categories?.join(' • ')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {item.variants && item.variants.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3">اختر المتغير / الحجم</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {item.variants.map((variant, idx) => (
                                    <button key={idx} onClick={() => setSelectedVariant(variant)}
                                        className={"p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 " +
                                            (selectedVariant?.name === variant.name
                                                ? 'border-[#FF4B2B] bg-[#FF4B2B]/5 text-[#FF4B2B]'
                                                : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200')}>
                                        <span className="font-bold text-sm">{variant.name}</span>
                                        <span className="text-xs text-gray-500">{variant.price} DH</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.extras && item.extras.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3">إضافات اختيارية</h4>
                            <div className="space-y-2">
                                {item.extras.map((extra, idx) => {
                                    const isSelected = selectedExtras.some(e => e.name === extra.name);
                                    return (
                                        <label key={idx} className={"flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all " +
                                            (isSelected ? 'border-[#FF4B2B] bg-[#FF4B2B]/5' : 'border-gray-100 bg-gray-50 hover:border-gray-200')}>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleExtra(extra)} />
                                                <div className={"w-5 h-5 rounded border flex items-center justify-center " + (isSelected ? 'bg-[#FF4B2B] border-[#FF4B2B]' : 'border-gray-300')}>
                                                    {isSelected && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                                </div>
                                                <span className={"text-sm font-bold " + (isSelected ? 'text-[#FF4B2B]' : 'text-gray-700')}>{extra.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">+{extra.price} DH</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">الصلصات والإضافات (مجانية)</h4>
                        <div className="flex flex-wrap gap-2">
                            {CONDIMENTS.map(cond => {
                                const isSelected = selectedCondiments.includes(cond);
                                return (
                                    <button key={cond} onClick={() => toggleCondiment(cond)}
                                        className={"px-4 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-1 " +
                                            (isSelected ? 'border-[#FF4B2B] bg-[#FF4B2B]/10 text-[#FF4B2B]' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300')}>
                                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                                        {cond}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <button onClick={handleAdd}
                        className="w-full py-3.5 bg-[#FF4B2B] hover:bg-[#e93d1f] text-white font-bold rounded-xl shadow-lg shadow-[#FF4B2B]/30 transition-all active:scale-[0.98] flex items-center justify-between px-6">
                        <span>إضافة للطلب</span>
                        <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{currentTotal} DH</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MenuGrid ──────────────────────────────────────────────────────────────────
export default function MenuGrid({ onAdd }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState(MENU_ITEMS);

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('available', true)
                .order('id', { ascending: true });
            if (error) {
                const saved = localStorage.getItem('kds_menu');
                if (saved) setItems(JSON.parse(saved));
            } else {
                setItems(data);
                localStorage.setItem('kds_menu', JSON.stringify(data));
            }
        };
        fetchItems();
        const channel = supabase
            .channel('menu_grid_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, fetchItems)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const showCategoryGrid = activeCategory === 'All';

    const filtered = items.filter(item =>
        activeCategory === 'All' || (item.categories && item.categories.includes(activeCategory))
    );

    // ── Card style for items
    const itemCard = "bg-[#EBEBEB] rounded-[20px] p-5 text-left hover:shadow-lg hover:bg-[#E2E2E2] border-2 border-transparent hover:border-[#FF4B2B]/20 transition-all h-[200px] relative overflow-hidden group active:scale-[0.98]";

    return (
        <div className="flex flex-col h-full gap-0 pb-4 pt-2">

            {/* ── Content Area ── */}
            {showCategoryGrid ? (
                /* CATEGORY CARDS */
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-5">
                        {CATEGORIES.map(cat => {
                            const meta = CATEGORY_META[cat] || { emoji: '🍽️', color: '#EBEBEB', border: '#D0D0D0', label: cat };
                            const count = items.filter(i => i.categories && i.categories.includes(cat)).length;
                            return (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className="rounded-[20px] p-6 text-left border-2 border-[#D8D8D8] hover:border-[#FF4B2B]/50 hover:shadow-xl transition-all h-[200px] relative overflow-hidden group active:scale-[0.98] bg-[#EBEBEB] hover:bg-[#E2E2E2]"
                                >
                                    <h3 className="font-black text-[#1A1A1A] text-[17px] leading-[1.3] max-w-[60%] line-clamp-3">{meta.label}</h3>
                                    <span className="mt-2 inline-block text-[13px] font-semibold text-gray-500">{count} articles</span>
                                    <div className="absolute -bottom-6 -right-6 w-[140px] h-[140px] rounded-full bg-white/80 border-[6px] border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <span className="text-[60px]">{meta.emoji}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* ITEM CARDS — shown when category selected */
                <>
                    <button onClick={() => setActiveCategory('All')}
                        className="flex items-center gap-1.5 text-[#FF4B2B] font-bold text-sm self-start hover:underline mb-4">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Retour aux catégories
                    </button>
                    <div className="flex-1 overflow-y-auto pr-1 pb-8 custom-scrollbar">
                        <div className="grid grid-cols-3 gap-4">
                            {filtered.map(item => {
                                const hasOptions = (item.variants && item.variants.length > 0) || (item.extras && item.extras.length > 0);
                                const isImage = item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http');
                                return (
                                    <button key={item.id}
                                        onClick={() => hasOptions ? setSelectedItem(item) : onAdd({ ...item, id: item.id + '-' + Date.now() })}
                                        className={itemCard}>
                                        <h3 className="font-bold text-[#1A1A1A] text-[15px] leading-[1.35] group-hover:text-[#FF4B2B] transition-colors max-w-[60%] line-clamp-3">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm font-black text-[#FF4B2B] mt-1">{item.price} DH</p>
                                        {isImage ? (
                                            <div className="absolute -bottom-8 -right-8 w-[130px] h-[130px] rounded-full border-[6px] border-white shadow-sm overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                                                <img src={item.emoji} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="absolute -bottom-8 -right-8 w-[130px] h-[130px] rounded-full bg-white border-[6px] border-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                                <span className="text-[54px]">{item.emoji}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                                <span className="material-symbols-outlined text-5xl">search_off</span>
                                <p className="font-semibold">Aucun article trouvé</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {selectedItem && (
                <ItemModal item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onConfirm={(customizedItem) => { onAdd(customizedItem); setSelectedItem(null); }}
                />
            )}
        </div>
    );
}

export { MENU_ITEMS };
