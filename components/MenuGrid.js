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
            const extraNames = selectedExtras.map(e => e.name).join(' + ');
            finalName += ' + ' + extraNames;
            finalPrice += selectedExtras.reduce((sum, e) => sum + e.price, 0);
        }

        if (selectedCondiments.length > 0) {
            finalName += ' + ' + selectedCondiments.join(' + ');
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
                        {(item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http')) ? (
                            <img src={item.emoji} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 dark:border-gray-700" />
                        ) : (
                            <span className="text-3xl">{item.emoji}</span>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.categories && item.categories.join(' • ')}</p>
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

                    {/* Condiments Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">الصلصات و الإضافات (مجانية)</h4>
                        <div className="flex flex-wrap gap-2">
                            {CONDIMENTS.map(cond => {
                                const isSelected = selectedCondiments.includes(cond);
                                return (
                                    <button
                                        key={cond}
                                        onClick={() => toggleCondiment(cond)}
                                        className={"px-4 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 " + (
                                            isSelected
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                        )}
                                    >
                                        {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                                        <span>{cond}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
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
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState(MENU_ITEMS);

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('available', true) // Only show available items on the order grid
                .order('id', { ascending: true });

            if (error) {
                console.error("Supabase Error:", error.message, error.hint);
                const saved = localStorage.getItem('kds_menu');
                if (saved) setItems(JSON.parse(saved));
            } else {
                setItems(data);
                localStorage.setItem('kds_menu', JSON.stringify(data));
            }
        };

        fetchItems();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('menu_grid_sync')
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

    // If a category is selected, filter items by it.
    const filtered = activeCategory
        ? items.filter(item => item.categories && item.categories.includes(activeCategory))
        : [];

    return (
        <div className="flex flex-col gap-4 relative">

            {!activeCategory ? (
                // --- CATEGORY SELECTION VIEW ---
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-2">
                    {CATEGORIES.map(cat => {
                        // Determine an emoji for the category card (find first item's emoji or default)
                        const sampleItem = items.find(i => i.categories && i.categories.includes(cat));
                        const catEmoji = sampleItem ? sampleItem.emoji : '🍽️';

                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="bg-white dark:bg-gray-800 border border-transparent shadow-sm rounded-2xl p-4 sm:p-6 text-center hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all group active:scale-[0.97] flex flex-col items-center justify-center"
                            >
                                {(catEmoji?.startsWith('/uploads/') || catEmoji?.startsWith('http')) ? (
                                    <img src={catEmoji} alt={cat} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-2xl mb-2 sm:mb-3 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-primary/50 transition-colors" />
                                ) : (
                                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{catEmoji}</div>
                                )}
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-[13px] sm:text-sm group-hover:text-primary transition-colors leading-tight">{cat}</h3>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                                    {items.filter(i => i.categories && i.categories.includes(cat)).length} أصناف
                                </p>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // --- ITEMS VIEW ---
                <>
                    <div className="flex items-center gap-3 mb-2 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-bold"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            رجوع
                        </button>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1">{activeCategory}</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filtered.map(item => {
                            const hasOptions = (item.variants && item.variants.length > 0) || (item.extras && item.extras.length > 0);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => hasOptions ? setSelectedItem(item) : onAdd({ ...item, id: item.id + '-' + Date.now() })}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 text-left hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all group active:scale-[0.97]"
                                >
                                    {(item.emoji?.startsWith('/uploads/') || item.emoji?.startsWith('http')) ? (
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-2 sm:mb-3 overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0">
                                            <img src={item.emoji} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    ) : (
                                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 dark:bg-gray-700/50 rounded-xl">{item.emoji}</div>
                                    )}
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-[13px] sm:text-sm group-hover:text-primary transition-colors leading-tight">{item.name}</p>
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
                </>
            )}

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
