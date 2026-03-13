
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image,
    StyleSheet, Alert, ScrollView, StatusBar, Dimensions,
    TextInput, Platform, Modal, ActivityIndicator
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
    Send, Trash2, Home, Search, ShoppingCart, User, Bell,
    ArrowLeft, Plus, Minus, ChevronRight, MapPin, X, Check,
    Power, CreditCard, Users, Languages, Headset, HelpCircle,
    FileText, ShieldCheck, Info, Clipboard, Phone, Edit3, SquarePen,
    Wallet, Gift
} from 'lucide-react-native';
import { useFonts } from 'expo-font';
import { Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { supabase } from './src/lib/supabase';
import { Vibration } from 'react-native';
import * as Audio from 'expo-av/build/Audio';
import { Volume2, VolumeX } from 'lucide-react-native';

const API_BASE = 'http://192.168.1.163:3000';
const { width, height } = Dimensions.get('window');

// ===== MENU =====
const MENU_ITEMS = [
    { id: 1, name: "THE شاي", price: 8, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 2, name: "CAFE قهوة", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 3, name: "JUS AU CHOIX عصير", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 4, name: "LAIT AU CHOCOLAT", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner", "Boissons & Salades"] },
    { id: 5, name: "OMELETTE AU KHLI3", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 6, name: "OMELETTE AU FROMAGE", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 7, name: "OMELETTE AUX CREVETTES", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 8, name: "OMELETTE NATURE", price: 6, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 9, name: "OMELETTE AUX CHAMPIGNONS", price: 8, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 10, name: "CREPE AUX FRUITS ET CHOCOLAT", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 11, name: "GAUFRES", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 12, name: "PANNA COTTA", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 13, name: "CREME CARAMEL", price: 10, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 14, name: "TIRAMISU", price: 15, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 15, name: "MSEMEN مسمن", price: 3, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 16, name: "MAKHMAR مخمار", price: 3, station: "Kitchen", emoji: "☕", variants: [], extras: [], categories: ["Petit Dejeuner"] },
    { id: 17, name: "OMELETTE FROMAGE", price: 10, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 10 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 18, name: "POULET", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 15 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 19, name: "SAUCISSES", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 15 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 20, name: "VIANDE HACHEE", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 15 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 21, name: "MIXTE", price: 15, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 15 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 22, name: "SPECIAL", price: 20, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 23, name: "KEEBDA", price: 20, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 20 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 24, name: "NUGGET", price: 25, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 25 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 25, name: "CORDON BLEU", price: 25, station: "Kitchen", emoji: "🥪", variants: [{ name: "Standard", price: 25 }], extras: [{ name: "إضافة أومليت", price: 5 }], categories: ["Sandwich", "Panini"] },
    { id: 26, name: "MARGHERITA", price: 20, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 20 }, { name: "Grand (G)", price: 30 }], extras: [], categories: ["Pizza"] },
    { id: 27, name: "VEGETARIENNE", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 28, name: "CHARCUTERIE", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 29, name: "POULET Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 30, name: "THON", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 31, name: "VIANDE HACHEE Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 40 }], extras: [], categories: ["Pizza"] },
    { id: 32, name: "4 FROMAGE", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 33, name: "4 SAISON", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 34, name: "FRUITS DE MER Pizza", price: 40, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 40 }, { name: "Grand (G)", price: 50 }], extras: [], categories: ["Pizza"] },
    { id: 35, name: "ROYAL Pizza", price: 45, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 45 }, { name: "Grand (G)", price: 55 }], extras: [], categories: ["Pizza"] },
    { id: 36, name: "PARIS FOOD", price: 45, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 45 }, { name: "Grand (G)", price: 55 }], extras: [], categories: ["Pizza"] },
    { id: 37, name: "CHOCOLAT Pizza", price: 30, station: "Oven", emoji: "🍕", variants: [{ name: "Normal (N)", price: 30 }, { name: "Grand (G)", price: 35 }], extras: [], categories: ["Pizza"] },
    { id: 38, name: "POULET Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 39, name: "SAUCISSES Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 40, name: "VIANDE HACHEE Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 41, name: "PLATS NUGGET", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 42, name: "EMINCE POULET", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 43, name: "CORDON BLEU Plat", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 44, name: "PLATS ESCALOPE", price: 50, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Plats"] },
    { id: 45, name: "BECARBONARA", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Pates"] },
    { id: 46, name: "POULET Pates", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Pates"] },
    { id: 47, name: "BOLONAISE", price: 30, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Pates"] },
    { id: 48, name: "FRUIT DE MER Pates", price: 40, station: "Kitchen", emoji: "🍝", variants: [], extras: [], categories: ["Pates"] },
    { id: 49, name: "JUS D'ORANGE", price: 15, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 50, name: "JUS DE BANAN", price: 15, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 51, name: "JUS D'AVOCAT", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 52, name: "JUS MOKHITO", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 53, name: "JUS PANACHE", price: 20, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 54, name: "JUS ZA3ZA3", price: 30, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 55, name: "CANETTES", price: 6, station: "Bar", emoji: "🥤", variants: [], extras: [], categories: ["Boissons"] },
    { id: 56, name: "SALADE PECHEUR", price: 40, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Salades"] },
    { id: 57, name: "SALADE MEXICAINE", price: 20, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Salades"] },
    { id: 58, name: "SALADE MAROCAINE", price: 20, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Salades"] },
    { id: 59, name: "SALADE VARIEE", price: 25, station: "Bar", emoji: "🥗", variants: [], extras: [], categories: ["Salades"] },
    { id: 60, name: "CREPE", price: 25, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts"] },
    { id: 61, name: "PANNA COTTA", price: 25, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts"] },
    { id: 62, name: "CREME CARAMEL", price: 35, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts"] },
    { id: 63, name: "TIRAMISU", price: 40, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts"] },
    { id: 64, name: "SALADE DE FRUITS", price: 40, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Desserts"] },
    { id: 65, name: "NUGGET 5 PIECES", price: 20, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Supplements"] },
    { id: 66, name: "FRITE", price: 5, station: "Kitchen", emoji: "🍟", variants: [], extras: [], categories: ["Supplements"] },
    { id: 67, name: "FROMAGE", price: 5, station: "Kitchen", emoji: "🍧", variants: [], extras: [], categories: ["Supplements"] },
    { id: 68, name: "POULET Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 69, name: "SAUCISSES Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 70, name: "VIANDE HACHEE Tacos", price: 25, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 25 }, { name: "XL", price: 35 }], extras: [], categories: ["Tacos"] },
    { id: 71, name: "MIXTE Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 72, name: "NUGGET Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 73, name: "CRESPI", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }, { name: "XL", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 74, name: "CORDON BLEU Tacos", price: 30, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 30 }], extras: [], categories: ["Tacos"] },
    { id: 75, name: "ROYAL Tacos", price: 40, station: "Kitchen", emoji: "🌮", variants: [{ name: "L", price: 40 }], extras: [], categories: ["Tacos"] },
    { id: 76, name: "PASTICOS", price: 40, station: "Oven", emoji: "🥘", variants: [], extras: [{ name: "غراتان (Gratine)", price: 5 }, { name: "غراتان بيتزا (Gratine Pizza)", price: 10 }], categories: ["Pasticos"] },
];

const CATEGORIES = [
    { id: 'Petit Dejeuner', emoji: '☕', bg: '#4ADE80', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80' },
    { id: 'Sandwich', emoji: '🥪', bg: '#FB923C', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80' },
    { id: 'Panini', emoji: '🥖', bg: '#F97316', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
    { id: 'Pizza', emoji: '🍕', bg: '#FB7185', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
    { id: 'Tacos', emoji: '🌮', bg: '#60A5FA', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80' },
    { id: 'Plats', emoji: '🍽️', bg: '#A78BFA', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=80' },
    { id: 'Pates', emoji: '🍝', bg: '#8B5CF6', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop&q=80' },
    { id: 'Salades', emoji: '🥗', bg: '#34D399', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' },
    { id: 'Boissons', emoji: '🥤', bg: '#10B981', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
    { id: 'Desserts', emoji: '🍧', bg: '#F472B6', image: 'https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=500&auto=format&fit=crop&q=80' },
    { id: 'Pasticos', emoji: '🥘', bg: '#38BDF8', image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&auto=format&fit=crop&q=80' },
    { id: 'Supplements', emoji: '🍟', bg: '#94A3B8', image: 'https://images.unsplash.com/photo-1573082810394-f2f65261829d?w=500&auto=format&fit=crop&q=80' },
];

const CONDIMENTS = [
    { ar: 'حار 🌶️', fr: 'Piquant 🌶️' },
    { ar: 'كاتشب 🍅', fr: 'Ketchup 🍅' },
    { ar: 'مايونيز 🥚', fr: 'Mayo 🥚' }
];
const ORDER_TYPES = [
    { key: 'Dine-In', label_key: 'dineIn', icon: '🍽️' },
    { key: 'Carry-Out', label_key: 'carryOut', icon: '🥡' },
    { key: 'Delivery', label_key: 'delivery', icon: '🛵' },
];

// ===== DESIGN SYSTEM =====
const COLORS = {
    primary: '#FF7A00',
    primaryLight: 'rgba(255, 122, 0, 0.1)',
    primaryShadow: 'rgba(255, 122, 0, 0.3)',
    background: '#FFFFFF',
    cardBody: '#FAFAFA',
    textMain: '#1A1A1A',
    textMuted: '#757575',
    border: '#E0E0E0',
    white: '#FFFFFF',
    danger: '#FF3B30',
};

const TRANSLATIONS = {
    ar: {
        welcome: 'مرحباً! 👋',
        welcomeSub: 'ما الذي تشتهيه اليوم؟',
        searchPlaceholder: 'ابحث عن وجبتك المفضلة...',
        cartEmpty: 'السلة فارغة',
        cartEmptySub: 'أضف أصنافاً من القائمة لتبدأ طلباً جديداً',
        total: 'المجموع',
        confirmOrder: 'تأكيد وإرسال الطلب',
        orderSent: 'تم إرسال الطلب للمطبخ بنجاح',
        historyEmpty: 'لا توجد طلبات سابقة',
        historyEmptySub: 'ستظهر أوامرك هنا بعد إرسالها',
        details: 'تفاصيل الطلب',
        modify: 'تعديل الطلب',
        delete: 'حذف من السجل',
        cancel: 'إلغاء',
        home: 'الرئيسية',
        menu: 'القائمة',
        orders: 'الطلبات',
        profile: 'حسابي',
        language: 'اللغة',
        selectLang: 'اختر لغة الواجهة',
        vibration: 'الاهتزاز',
        sound: 'تنبيه صوتي',
        dark: 'وضع توفير البطارية',
        logout: 'تسجيل الخروج',
        table: 'طاولة',
        status_pending: 'بانتظار التحضير',
        status_preparing: 'جاري التحضير 👨‍🍳',
        status_ready: 'جاهز للتسليم ✅',
        status_completed: 'تم التسليم ✅',
        loadingOrder: 'تم تحميل الطلب للسلة بنجاح',
        deletedFromHistory: 'تم الحذف من السجل بنجاح',
        itSupport: 'الدعم الفني',
        aboutApp: 'عن التطبيق',
        version: 'النسخة v1.0.4 - بريميوم',
        features: 'مميزات النسخة:',
        feature1: 'إرسال لحظي للمطبخ (KDS Sync)',
        feature2: 'دعم العمل بدون إنترنت (Offline Mode)',
        feature3: 'واجهة مستخدم حديثة وسهلة الاستخدام',
        logoutConfirm: 'هل تريد الخروج من الجلسة؟',
        totalSales: 'إجمالي المبيعات',
        todayOrders: 'طلبات اليوم',
        generalSettings: 'الإعدادات العامة',
        arabic: 'العربية',
        french: 'الفرنسية',
        editProfileDetails: 'تعديل البيانات الشخصية',
        waiterName: 'اسم النادل',
        phoneNumber: 'رقم الهاتف',
        saveChanges: 'حفظ التغييرات',
        dineIn: 'في المطعم',
        carryOut: 'للخارج / Emporté',
        delivery: 'توصيل',
        orderType: 'نوع الطلب',
        checkout: 'إتمام الطلب',
        deliveryInfo: 'معلومات التوصيل',
        addressPlaceholder: 'العنوان، رقم الهاتف، ملاحظات التوصيل...',
        chooseOrderType: 'اختر نوع الطلب',
        tableNumber: 'رقم الطاولة',
        viewItems: 'عرض الأصناف المطلوبة',
        waiterApp: 'Waiter App',
        noItems: 'لا توجد أصناف هنا',
        notes: 'ملاحظة',
        sauces: 'الصلسات و الإضافات (مجانية)',
        addToOrder: 'إضافة للطلب',
        saveChanges: 'حفظ التغييرات',
        arabic: 'العربية',
        french: 'الفرنسية',
        selectSize: 'اختر المتغير / الحجم',
        optionalExtras: 'إضافات اختيارية',
        versionShort: 'POS Waiter v1.0.0',
        aboutLead: 'نظام إدارة المطاعم المتكامل. يتيح هذا التطبيق للنادل إرسال الطلبات مباشرة إلى المطبخ ومتابعة حالة الطاولات بكفاءة عالية.',
        selectLang: 'اختر اللغة',
        cancel: 'إلغاء',
        time: 'الوقت',
        confirmOrderTitle: 'تأكيد وإرسال الطلب',
        deliveryDataLabel: 'بيانات التوصيل (العنوان والاسم والهاتف)',
        deliveryPlaceholder: 'مثلاً: الحي، رقم المنزل، اسم المستلم...',
        carryOutInfo: 'طلب خارجي (تيك أواي) - سيتم تحضيره للاستلام.',
        sending: 'جاري الإرسال...',
        confirmAndSend: 'تأكيد وإرسال للمطبخ',
        // Categories
        'Petit Dejeuner': 'فطور صباحي',
        'Sandwich': 'ساندويتش',
        'Panini': 'بانيني',
        'Pizza': 'بيتزا',
        'Tacos': 'تاكوس',
        'Plats': 'أطباق رئيسية',
        'Pates': 'معكرونة',
        'Salades': 'سلطات',
        'Boissons': 'مشروبات',
        'Desserts': 'حلويات',
        'Pasticos': 'باستيكوس',
        'Supplements': 'إضافات',
    },
    fr: {
        welcome: 'Bonjour ! 👋',
        welcomeSub: 'Prêt pour une nouvelle commande ?',
        searchPlaceholder: 'Recherchez un plat...',
        cartEmpty: 'Le panier est vide',
        cartEmptySub: 'Ajoutez des articles pour commencer',
        total: 'Total',
        confirmOrder: 'Confirmer la commande',
        orderSent: 'Commande envoyée !',
        historyEmpty: 'Historique vide',
        historyEmptySub: 'Vos commandes apparaîtront ici',
        details: 'Détails',
        modify: 'Modifier',
        delete: 'Supprimer',
        cancel: 'Annuler',
        home: 'Accueil',
        menu: 'Menu',
        orders: 'Commandes',
        profile: 'Profil',
        language: 'Langue',
        selectLang: 'Choisir la langue',
        vibration: 'Vibration',
        sound: 'Sonnerie',
        dark: 'Mode Sombre',
        logout: 'Déconnexion',
        table: 'Table',
        status_pending: 'En attente',
        status_preparing: 'En préparation 👨‍🍳',
        status_ready: 'Prêt ✅',
        status_completed: 'Livré ✅',
        loadingOrder: 'Commande chargée',
        deletedFromHistory: 'Supprimé de l\'historique',
        itSupport: 'Support Technique',
        aboutApp: 'À propos',
        version: 'Version v1.0.4 - Premium',
        features: 'Caractéristiques :',
        feature1: 'Sync Cuisine Temps Réel (KDS)',
        feature2: 'Mode Hors Connexion',
        feature3: 'Interface Intuitive & Rapide',
        logoutConfirm: 'Voulez-vous vous déconnecter ?',
        totalSales: 'Ventes Totales',
        todayOrders: 'Commandes du jour',
        generalSettings: 'Paramètres Généraux',
        arabic: 'Arabe',
        french: 'Français',
        editProfileDetails: 'Modifier le profil',
        waiterName: 'Nom du serveur',
        phoneNumber: 'Numéro de téléphone',
        saveChanges: 'Enregistrer',
        dineIn: 'Sur Place',
        carryOut: 'À Emporter',
        delivery: 'Livraison',
        orderType: 'Type de commande',
        checkout: 'Paiement',
        deliveryInfo: 'Infos de livraison',
        addressPlaceholder: 'Adresse, téléphone, notes...',
        confirm: 'Confirmer',
        chooseOrderType: 'Choisir le type',
        tableNumber: 'Numéro de table',
        viewItems: 'Voir les articles',
        waiterApp: 'App Serveur',
        noItems: 'Aucun article ici',
        notes: 'Note',
        sauces: 'Sauces et Suppléments (Gratuit)',
        addToOrder: 'Ajouter à la commande',
        selectSize: 'Choisir la taille / variante',
        optionalExtras: 'Suppléments optionnels',
        versionShort: 'POS Serveur v1.0.0',
        aboutLead: 'Système intégré de gestion de restaurant. Cette application permet au serveur d\'envoyer les commandes directement en cuisine.',
        selectLang: 'Choisir la langue',
        cancel: 'Annuler',
        time: 'Heure',
        confirmOrderTitle: 'Confirmer la commande',
        deliveryDataLabel: 'Infos de livraison (Adresse, Nom, Tel)',
        deliveryPlaceholder: 'Ex: Quartier, N° Maison, Nom...',
        carryOutInfo: 'À emporter - Sera préparé pour récupération.',
        sending: 'Envoi en cours...',
        confirmAndSend: 'Confirmer et envoyer',
        // Categories
        'Petit Dejeuner': 'Petit Déjeuner',
        'Sandwich': 'Sandwich',
        'Panini': 'Panini',
        'Pizza': 'Pizza',
        'Tacos': 'Tacos',
        'Plats': 'Plats Principaux',
        'Pates': 'Pâtes',
        'Salades': 'Salades',
        'Boissons': 'Boissons',
        'Desserts': 'Desserts',
        'Pasticos': 'Pasticos',
        'Supplements': 'Suppléments',
    }
};

const FONTS = {
    bold: 'Poppins_700Bold',
    semi: 'Poppins_600SemiBold',
    extra: 'Poppins_800ExtraBold',
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    mainBold: 'Inter_700Bold',
};

// ===== ITEM MODAL =====
function ItemDetailModal({ item, visible, onClose, onConfirm, lang, t }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedCondiments, setSelectedCondiments] = useState([]);

    useEffect(() => {
        if (item) {
            setSelectedVariant(item.variants?.length > 0 ? item.variants[0] : null);
            setSelectedExtras([]);
            setSelectedCondiments([]);
        }
    }, [item?.id]);

    if (!item) return null;

    const toggleExtra = (extra) => {
        setSelectedExtras(prev => prev.find(e => e.name === extra.name) ? prev.filter(e => e.name !== extra.name) : [...prev, extra]);
    };
    const toggleCondiment = (c) => {
        setSelectedCondiments(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const currentTotal = (selectedVariant ? selectedVariant.price : item.price) + selectedExtras.reduce((s, e) => s + e.price, 0);

    const handleAdd = () => {
        let n = item.name, p = item.price;
        if (selectedVariant) { n += ' (' + selectedVariant.name + ')'; p = selectedVariant.price; }
        if (selectedExtras.length > 0) { n += ' + ' + selectedExtras.map(e => e.name).join(' + '); p += selectedExtras.reduce((s, e) => s + e.price, 0); }
        if (selectedCondiments.length > 0) { n += ' + ' + selectedCondiments.join(' + '); }
        onConfirm({ ...item, id: item.id + '-' + Date.now(), name: n, price: p });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={ms.overlay}>
                <View style={ms.box}>
                    <View style={ms.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 44, marginRight: 16 }}>{item.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={ms.title}>{item.name}</Text>
                                <Text style={ms.sub}>{item.categories?.join(' • ')}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={ms.closeBtn} onPress={onClose}><X size={20} color={COLORS.textMain} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                        {item.variants?.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={[ms.secTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t('selectSize')}</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    {item.variants.map((v, i) => (
                                        <TouchableOpacity key={i} style={[ms.varBtn, selectedVariant?.name === v.name && ms.varActive]} onPress={() => setSelectedVariant(v)}>
                                            <Text style={[ms.varName, selectedVariant?.name === v.name && { color: COLORS.primary }]}>{v.name}</Text>
                                            <Text style={[ms.varPrice, selectedVariant?.name === v.name && { color: COLORS.primary }]}>{v.price} DH</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                        {item.extras?.length > 0 && (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={[ms.secTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t('optionalExtras')}</Text>
                                {item.extras.map((ex, i) => {
                                    const sel = selectedExtras.some(e => e.name === ex.name);
                                    return (
                                        <TouchableOpacity key={i} style={[ms.exRow, sel && ms.exRowActive, lang === 'fr' && { flexDirection: 'row-reverse' }]} onPress={() => toggleExtra(ex)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={[ms.chk, sel && ms.chkActive]}>{sel && <Check size={14} color="#FFF" />}</View>
                                                <Text style={[ms.exName, sel && { color: COLORS.primary }]}>{ex.name}</Text>
                                            </View>
                                            <Text style={ms.exPrice}>+{ex.price} DH</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={[ms.secTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t('sauces')}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                {CONDIMENTS.map(c => {
                                    const label = lang === 'ar' ? c.ar : c.fr;
                                    const sel = selectedCondiments.includes(label);
                                    return (
                                        <TouchableOpacity key={label} style={[ms.condBtn, sel && ms.condActive, lang === 'fr' && { flexDirection: 'row-reverse' }]} onPress={() => toggleCondiment(label)}>
                                            {sel && <Check size={14} color={COLORS.primary} style={lang === 'ar' ? { marginRight: 6 } : { marginLeft: 6 }} />}
                                            <Text style={[ms.condText, sel && { color: COLORS.primary }]}>{label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity style={[ms.addBtn, lang === 'fr' && { flexDirection: 'row-reverse' }]} onPress={handleAdd}>
                        <Text style={ms.addBtnText}>{t('addToOrder')}</Text>
                        <View style={ms.addBtnPrice}><Text style={ms.addBtnPriceT}>{currentTotal} DH</Text></View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ===== EDIT PROFILE MODAL =====
function EditProfileModal({ visible, onClose, waiterName, waiterPhone, setWaiterName, setWaiterPhone, t }) {
    const [name, setName] = useState(waiterName);
    const [phone, setPhone] = useState(waiterPhone);

    useEffect(() => {
        if (visible) {
            setName(waiterName);
            setPhone(waiterPhone);
        }
    }, [visible, waiterName, waiterPhone]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[ms.overlay, { justifyContent: 'center', padding: 20 }]}>
                <View style={[ms.box, { padding: 24, maxHeight: 450, borderRadius: 32 }]}>
                    <Text style={[s.sectionLabel, { marginBottom: 24, textAlign: 'center' }]}>{t('editProfileDetails')}</Text>
                    
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, textAlign: 'left' }}>{t('waiterName')}</Text>
                    <TextInput style={s.modalInput} placeholder={t('waiterName')} value={name} onChangeText={setName} />
                    
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, textAlign: 'left' }}>{t('phoneNumber')}</Text>
                    <TextInput style={s.modalInput} placeholder={t('phoneNumber')} value={phone} keyboardType="phone-pad" onChangeText={setPhone} />
                    
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                        <TouchableOpacity style={[s.modalBtn, { backgroundColor: COLORS.cardBody }]} onPress={onClose}>
                            <Text style={{ color: COLORS.textMain }}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.modalBtn, { backgroundColor: COLORS.primary }]} onPress={() => { setWaiterName(name); setWaiterPhone(phone); onClose(); }}>
                            <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>{t('saveChanges')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const ms = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,26,0.6)' },
    box: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%', shadowColor: COLORS.textMain, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    sub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    secTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 16 },
    varBtn: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center' },
    varActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    varName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textMuted },
    varPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMain, marginTop: 4 },
    exRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, marginBottom: 10 },
    exRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    chk: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: COLORS.white },
    chkActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    exName: { fontSize: 15, fontWeight: '500', color: COLORS.textMain },
    exPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted },
    condBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center' },
    condActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    condText: { fontSize: 14, fontWeight: '500', color: COLORS.textMain },
    addBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 24, backgroundColor: COLORS.primary, padding: 20, borderRadius: 24 },
    addBtnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    addBtnPrice: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
    addBtnPriceT: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
});

// ===== MAIN APP =====
let soundObject = null; // Global reference for sound reuse

export default function App() {
    let [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
        Poppins_700Bold,
        Poppins_800ExtraBold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
    });

    const [basket, setBasket] = useState([]);
    const [table, setTable] = useState('1');
    const [orderType, setOrderType] = useState('Dine-In');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalItem, setModalItem] = useState(null);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState('');
    const [profSub, setProfSub] = useState(null); // 'language' or 'about'
    const [waiterName, setWaiterName] = useState('نادل المطعم');
    const [waiterPhone, setWaiterPhone] = useState('0612345678');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [stats, setStats] = useState({ orders: 0, sales: 0 });
    const [connStatus, setConnStatus] = useState('connecting');
    const [ordersTab, setOrdersTab] = useState('upcoming'); // 'upcoming' | 'history'
    const [orderHistory, setOrderHistory] = useState([]);
    const [viewingHistoryOrder, setViewingHistoryOrder] = useState(null);
    const [historyActionMenuOrder, setHistoryActionMenuOrder] = useState(null);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [lang, setLang] = useState('ar');

    const t = (key) => TRANSLATIONS[lang][key] || key;

    // Use Ref for settings to avoid re-mounting Supabase channel
    const settingsRef = useRef({ vibrationEnabled, soundEnabled });
    useEffect(() => {
        settingsRef.current = { vibrationEnabled, soundEnabled };
    }, [vibrationEnabled, soundEnabled]);


    // Preload sound and SETUP AUDIO MODE
    useEffect(() => {
        const setupAudio = async () => {
            try {
                // Ensure audio is allowed to play through speakers
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    staysActiveInBackground: true,
                });

                const { sound } = await Audio.Sound.createAsync(
                    { uri: 'https://cdn.freesound.org/previews/80/80921_1022651-lq.mp3' },
                    { shouldPlay: false }
                );
                soundObject = sound;
            } catch (e) {
                console.warn('Audio Setup Error:', e);
            }
        };
        setupAudio();
        return () => {
            if (soundObject) soundObject.unloadAsync();
        };
    }, []);

    useEffect(() => {
        // Optimized stats update
        if (basket.length === 0) return;
        setStats(prev => ({ ...prev, orders: prev.orders }));
    }, [basketCount]);

    const playPing = async () => {
        if (!settingsRef.current.soundEnabled) return;
        try {
            if (soundObject) {
                await soundObject.setStatusAsync({ shouldPlay: true, positionMillis: 0, volume: 1.0 });
            } else {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: 'https://cdn.freesound.org/previews/80/80921_1022651-lq.mp3' },
                    { shouldPlay: true, volume: 1.0 }
                );
                soundObject = sound;
            }
        } catch (e) {
            console.log('Final Sound Fallback Error:', e);
        }
    };

    // Real-time Notifications Listener - Optimized to stay alive
    useEffect(() => {
        setConnStatus('connecting');

        const channel = supabase.channel('order-updates-waiter')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    const { new: updatedOrder, old: oldOrder } = payload;

                    // DEBUG: Fast vibration to confirm SOME data was received
                    Vibration.vibrate(100);

                    if (!updatedOrder) return;

                    const status = (updatedOrder.status || '').toLowerCase().trim();
                    const oldStatus = (oldOrder?.status || '').toLowerCase().trim();

                    // If we get here, the app definitely received an update
                    if (status === 'completed' || status === 'ready' || status === 'waiter_requested') {
                        let statusMsg = '';
                        if (status === 'ready') statusMsg = 'جاهز للتسليم 🔔';
                        else if (status === 'completed') statusMsg = 'مكتمل ✅';
                        else statusMsg = 'مطلوب في المطبخ 🚨🧑‍🍳';

                        const tableNum = updatedOrder.table_number || updatedOrder.table || '?';

                        // Action: Sound + Vibration using values from Ref
                        playPing();
                        if (settingsRef.current.vibrationEnabled) {
                            if (status === 'waiter_requested') {
                                Vibration.vibrate([0, 500, 200, 500, 200, 500, 200, 1000]); // intense vibration
                            } else {
                                Vibration.vibrate([0, 800, 200, 800, 200, 800]);
                            }
                        }

                        Alert.alert(
                            status === 'waiter_requested' ? '🚨 استدعاء النادل' : '🔔 تنبيه المطبخ',
                            status === 'waiter_requested' 
                                ? `المطبخ يطلب النادل لطاولة ${tableNum} بسرعة!` 
                                : `الطلب الخاص بـ طاولة ${tableNum} أصبح ${statusMsg}!`,
                            [{ text: 'فهمت 👋', onPress: () => Vibration.cancel() }]
                        );

                        if (updatedOrder.status === 'completed') {
                            setStats(prev => ({
                                orders: prev.orders + 1,
                                sales: prev.sales + (updatedOrder.total_amount || 0)
                            }));
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setConnStatus('online');
                }
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setConnStatus('error');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // Run once on mount

    const testNotification = () => {
        Alert.alert('🧪 إشعار تجريبي', 'هذا اختبار لنظام التنبيهات بالصوت والاهتزاز.');
        playPing();
        if (vibrationEnabled) Vibration.vibrate(800);
    };

    const basketTotal = useMemo(() => basket.reduce((s, i) => s + i.price * i.qty, 0), [basket]);
    const basketCount = useMemo(() => basket.reduce((s, i) => s + i.qty, 0), [basket]);
    const results = useMemo(() =>
        searchQuery.length > 0
            ? MENU_ITEMS.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : MENU_ITEMS,
        [searchQuery]);

    if (!fontsLoaded) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}><ActivityIndicator size="large" color="#FF7A00" /></View>;
    }

    const addToBasket = (item) => { setBasket(prev => [...prev, { ...item, qty: 1, note: '' }]); setModalItem(null); };
    const updateQty = (id, d) => { setBasket(prev => prev.map(i => i.id !== id ? i : { ...i, qty: Math.max(1, i.qty + d) }).filter(i => i.qty > 0)); };
    const updateNote = (id, note) => { setBasket(prev => prev.map(i => i.id === id ? { ...i, note } : i)); };
    const removeFromBasket = (id) => setBasket(prev => prev.filter(i => i.id !== id));

    const submitOrder = async () => {
        if (basket.length === 0) return;
        setIsSubmitting(true);
        const orderSnapshot = {
            table: orderType === 'Dine-In' ? table : 'N/A',
            type: orderType,
            delivery_info: orderType === 'Delivery' ? deliveryInfo : '',
            items: basket.map(i => ({ name: i.name, qty: i.qty, price: i.price, note: i.note || '' })),
            total_amount: basketTotal,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        try {
            const res = await fetch(`${API_BASE}/api/orders`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: orderType === 'Dine-In' ? table : 'N/A', 
                    type: orderType, 
                    delivery_info: orderType === 'Delivery' ? deliveryInfo : '',
                    total_amount: basketTotal,
                    items: basket.map(i => ({ name: i.name, qty: i.qty, price: i.price, station: i.station || 'Kitchen', note: i.note || '' })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                Alert.alert('✅', 'تم إرسال الطلب للمطبخ بنجاح');
                setShowCheckoutModal(false);
                setOrderHistory(prev => [orderSnapshot, ...prev]);
                setBasket([]);
                setOrdersTab('history');
            }
            else { Alert.alert('خطأ', data.error || 'حدث خطأ أثناء الإرسال'); }
        } catch (err) {
            console.error('Submit Error:', err);
            Alert.alert('خطأ في الاتصال بالسيرفر',
                `تعذر الوصول إلى: ${API_BASE}\n\n1. تأكد أن الهاتف والكمبيوتر على نفس الـ Wi-Fi\n2. تأكد من إيقاف جدار الحماية (Firewall) مؤقتاً\n\nالتفاصيل: ${err.message}`
            );
        }
        setIsSubmitting(false);
    };

    const getCategoryItems = (cat) => MENU_ITEMS.filter(i => i.categories?.includes(cat.id));

    // HOME
    const renderHome = () => (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} showsVerticalScrollIndicator={false}>
            <View style={s.newHeader}>
                <View style={s.topHeaderRow}>
                    <TouchableOpacity onPress={() => setActiveTab('profile')}>
                        <Wallet size={26} color={COLORS.white} />
                    </TouchableOpacity>
                    
                    <View style={s.logoContainer}>
                         <Text style={s.logoText}>Paris Food</Text>
                    </View>

                    <View style={s.rightHeaderIcons}>
                        <TouchableOpacity onPress={() => setActiveTab('search')}>
                            <Search size={26} color={COLORS.white} style={{ marginRight: 15 }} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Gift size={26} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <TouchableOpacity style={s.headerTableInfo} onPress={() => setShowTablePicker(true)}>
                     <Text style={s.headerTableText}>{t('table')} {table}</Text>
                     <ChevronRight size={18} color={COLORS.white} />
                </TouchableOpacity>

                {/* The Slant Effect */}
                <View style={s.headerSlant} />
            </View>

            <View style={[s.specialOffersList, { marginTop: 30 }]}>
                {CATEGORIES.map((cat, i) => (
                    <TouchableOpacity key={cat.id} style={[s.specialOfferCard, { backgroundColor: cat.bg }]} activeOpacity={0.85} onPress={() => { setSelectedCategory(cat); setActiveTab('category'); }}>
                        <Image source={{ uri: cat.image }} style={[s.specialOfferImage, lang === 'ar' ? { left: -20 } : { right: -20 }]} resizeMode="cover" />
                        <View style={[s.specialOfferContent, lang === 'ar' ? { alignSelf: 'flex-end', alignItems: 'flex-end' } : { alignSelf: 'flex-start', alignItems: 'flex-start' }]}>
                            <Text style={[s.specialOfferTitle, { textAlign: lang === 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{t(cat.id)}</Text>
                            <Text style={[s.specialOfferSub, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{t('viewItems')}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );

    // CATEGORY
    const renderCategory = () => {
        const items = selectedCategory ? getCategoryItems(selectedCategory) : [];
        return (
            <View style={{ flex: 1 }}>
                <View style={s.catHeaderPage}>
                    <TouchableOpacity style={s.backBtn} onPress={() => setActiveTab('home')}><ArrowLeft size={24} color={COLORS.textMain} /></TouchableOpacity>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={s.catHeaderTitle}>{t(selectedCategory?.id)}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>
                <FlatList data={items} keyExtractor={item => item.id.toString()} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    ListEmptyComponent={<View style={s.emptyState}><Text style={{ fontSize: 48 }}>{selectedCategory?.emoji}</Text><Text style={s.emptyText}>{t('noItems')}</Text></View>}
                    renderItem={({ item }) => {
                        const displayName = lang === 'ar' ? item.name : item.name.split(' ').filter(word => !/[أ-ي]/.test(word)).join(' ');
                        return (
                            <TouchableOpacity 
                                style={[s.itemCard, lang === 'fr' && { flexDirection: 'row-reverse' }]} 
                                onPress={() => setModalItem(item)} 
                                activeOpacity={0.8}
                            >
                                <View style={s.itemEmojiBox}><Text style={s.itemEmoji}>{item.emoji}</Text></View>
                                <View style={[{ flex: 1 }, lang === 'ar' ? { paddingRight: 12 } : { paddingLeft: 12 }]}>
                                    <Text style={[s.itemName, { textAlign: lang === 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{displayName}</Text>
                                    {item.variants?.length > 0 && <Text style={[s.itemHint, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{item.variants.map(v => v.name).join(' | ')}</Text>}
                                    <Text style={[s.itemPrice, { textAlign: lang === 'ar' ? 'right' : 'left' }]}>{item.price} <Text style={{ fontSize: 12, fontWeight: 'bold' }}>DH</Text></Text>
                                </View>
                                <View style={s.addItemBtn}><Plus size={20} color={COLORS.white} /></View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        );
    };

    // MENU / SEARCH
    const renderSearch = () => (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View style={[s.searchHeader, { paddingBottom: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                     <TouchableOpacity style={{ marginRight: 15 }} onPress={() => setActiveTab('home')}>
                         <ArrowLeft size={24} color={COLORS.textMain} />
                     </TouchableOpacity>
                     <Text style={[s.searchTitle, { marginBottom: 0 }]}>{t('menu')}</Text>
                </View>
                <View style={s.searchInputWrap}>
                    <Search size={20} color={COLORS.textMuted} />
                    <TextInput style={s.searchInput} placeholder={t('searchPlaceholder')} placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
                    {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><X size={20} color={COLORS.textMuted} /></TouchableOpacity>}
                </View>
            </View>
            <FlatList 
                key={"menu-grid"} // Force re-render when switching columns/layout
                data={results} 
                numColumns={4}
                keyExtractor={item => item.id.toString()} 
                contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const displayName = lang === 'ar' ? item.name : item.name.split(' ').filter(word => !/[أ-ي]/.test(word)).join(' ');
                    const shortName = displayName.length > 10 ? displayName.substring(0, 8) + '..' : displayName;
                    
                    return (
                        <TouchableOpacity style={s.menuGridItem} onPress={() => setModalItem(item)} activeOpacity={0.7}>
                            <View style={s.menuEmojiBox}>
                                <Text style={s.menuEmoji}>{item.emoji}</Text>
                            </View>
                            <Text style={s.menuItemName} numberOfLines={1}>{shortName}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );

    // ORDERS PAGE (redesigned)
    const renderCart = () => {
        const THEME_BG = darkMode ? '#121212' : COLORS.background;
        const THEME_CARD = darkMode ? '#1E1E1E' : COLORS.white;
        const THEME_TEXT = darkMode ? '#F5F5F5' : COLORS.textMain;

        const statusLabel = (st) => {
            if (st === 'pending') return { text: t('status_pending'), color: '#F59E0B' };
            if (st === 'preparing') return { text: t('status_preparing'), color: '#3B82F6' };
            if (st === 'ready') return { text: t('status_ready'), color: '#10B981' };
            if (st === 'completed') return { text: t('status_completed'), color: '#6B7280' };
            if (st === 'waiter_requested') return { text: 'يطلبك المطبخ🚨', color: '#EF4444' };
            return { text: st, color: COLORS.textMuted };
        };

        // Upcoming tab — current basket
        const renderUpcoming = () => (
            <View style={{ flex: 1 }}>
                {basket.length === 0 ? (
                    <View style={s.emptyState}>
                        <View style={s.emptyCartBox}><ShoppingCart size={44} color={COLORS.primary} /></View>
                        <Text style={[s.emptyTextTitle, { color: THEME_TEXT }]}>{t('cartEmpty')}</Text>
                        <Text style={s.emptyTextSub}>{t('cartEmptySub')}</Text>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>

                            {/* Basket items */}
                            {basket.map((item, idx) => (
                                <View key={item.id.toString() + idx} style={[s.orderCard, { backgroundColor: THEME_CARD }]}>
                                    <View style={s.orderCardTop}>
                                        <View style={s.orderCardEmoji}><Text style={{ fontSize: 28 }}>{item.emoji || '🍔'}</Text></View>
                                        <View style={{ flex: 1, marginLeft: 14 }}>
                                            <Text style={[s.orderCardTitle, { color: THEME_TEXT }]} numberOfLines={1}>{item.name}</Text>
                                            <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>الكمية: {item.qty} &bull; {item.price} DH/قطعة</Text>
                                            <Text style={[s.orderCardTotal, { color: COLORS.primary }]}>{(item.price * item.qty).toFixed(0)} DH</Text>
                                        </View>
                                        <TouchableOpacity style={s.trashBtn} onPress={() => removeFromBasket(item.id)}>
                                            <Trash2 size={18} color={COLORS.danger} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={s.cartItemFooter}>
                                        <View style={s.qtyControls}>
                                            <TouchableOpacity style={s.qtyBtnLight} onPress={() => updateQty(item.id, -1)}><Minus size={15} color={COLORS.textMain} /></TouchableOpacity>
                                            <Text style={s.qtyTextLight}>{item.qty}</Text>
                                            <TouchableOpacity style={[s.qtyBtnLight, { backgroundColor: COLORS.primary }]} onPress={() => updateQty(item.id, 1)}><Plus size={15} color={COLORS.white} /></TouchableOpacity>
                                        </View>
                                        <TextInput
                                            style={[s.noteInput, { backgroundColor: COLORS.cardBody }]}
                                            placeholder="ملاحظة..."
                                            placeholderTextColor={COLORS.textMuted}
                                            value={item.note || ''}
                                            onChangeText={t => updateNote(item.id, t)}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Footer checkout bar */}
                        <View style={[s.checkoutFooter, { backgroundColor: THEME_CARD }]}>
                            <View style={s.footerTotalRow}>
                                <Text style={[s.footerTotalLabel, { color: COLORS.textMuted }]}>{t('total')}</Text>
                                <View style={s.footerTotalValueWrap}>
                                    <Text style={[s.footerTotalValue, { color: THEME_TEXT }]}>{basketTotal.toFixed(0)}</Text>
                                    <Text style={s.footerTotalCurrency}>DH</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[s.submitBtn, isSubmitting && { opacity: 0.6 }]} onPress={() => setShowCheckoutModal(true)} disabled={isSubmitting}>
                                <View style={s.submitBtnBadge}><Text style={s.submitBtnBadgeText}>{basketCount}</Text></View>
                                <Text style={s.submitBtnText}>{t('confirmOrder')}</Text>
                                <View style={s.submitArrowBox}><ChevronRight size={20} color={COLORS.primary} /></View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );

        // History tab — past orders
        const renderHistory = () => (
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                    {orderHistory.length === 0 ? (
                        <View style={[s.emptyState, { marginTop: 40 }]}>
                            <Text style={{ fontSize: 44, marginBottom: 16 }}>📋</Text>
                            <Text style={[s.emptyTextTitle, { color: THEME_TEXT }]}>{t('historyEmpty')}</Text>
                            <Text style={s.emptyTextSub}>{t('historyEmptySub')}</Text>
                        </View>
                    ) : orderHistory.map((order, i) => {
                        const st = statusLabel(order.status);
                        const summary = (order.items || []).map(it => `${it.name} x${it.qty}`).join(', ');
                        const firstEmoji = MENU_ITEMS.find(m => m.name === order.items?.[0]?.name)?.emoji || '🍽️';
                        return (
                            <View key={i} style={[s.historyCard, { backgroundColor: THEME_CARD }]}>
                                <View style={s.historyCardTop}>
                                    <View style={s.historyImgBox}>
                                        <Text style={{ fontSize: 32 }}>{firstEmoji}</Text>
                                        {(order.items?.length || 0) > 1 && (
                                            <View style={s.historyImgMore}>
                                                <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: 'bold' }}>+{order.items.length - 1}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 14 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: THEME_TEXT, marginBottom: 5 }}>{st.text}</Text>
                                        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 3 }}>{t('table')} {order.table} &bull; {t(ORDER_TYPES.find(t => t.key === order.type)?.label_key) || order.type}</Text>
                                        <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 3 }} numberOfLines={1}>ملخص: {summary || '-'}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.textMain }}>{t('total')}: {order.total_amount || 0} DH</Text>
                                    </View>
                                </View>
                                <View style={s.historyCardActions}>
                                    <TouchableOpacity
                                        style={s.reorderBtn}
                                        onPress={() => setViewingHistoryOrder(order)}
                                    >
                                        <Text style={s.reorderBtnText}>{t('details')}</Text>
                                    </TouchableOpacity>
                                        <TouchableOpacity 
                                        style={s.moreBtn}
                                        onPress={(e) => {
                                            const { pageY } = e.nativeEvent;
                                            setHistoryActionMenuOrder({ order, index: i, y: pageY });
                                        }}
                                    >
                                        <Text style={{ fontSize: 22, color: COLORS.textMuted, lineHeight: 24 }}>⋮</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Details Modal */}
                <Modal visible={!!viewingHistoryOrder} transparent animationType="fade" onRequestClose={() => setViewingHistoryOrder(null)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                        <View style={{ backgroundColor: THEME_CARD, borderRadius: 32, padding: 24, maxHeight: '80%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: THEME_TEXT }}>{t('details')}</Text>
                                <TouchableOpacity onPress={() => setViewingHistoryOrder(null)} style={{ padding: 8 }}>
                                    <X size={24} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>
                            
                            {viewingHistoryOrder && (
                                <>
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{t('orderType')}: {t(ORDER_TYPES.find(t => t.key === viewingHistoryOrder.type)?.label_key) || viewingHistoryOrder.type}</Text>
                                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{t('table')}: {viewingHistoryOrder.table}</Text>
                                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{t('time')}: {new Date(viewingHistoryOrder.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-MA' : 'fr-FR')}</Text>
                                    </View>
                                    
                                    <ScrollView style={{ marginBottom: 20 }}>
                                        {viewingHistoryOrder.items.map((it, idx) => (
                                            <View key={idx} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={{ fontWeight: 'bold', color: THEME_TEXT }}>{it.name} x{it.qty}</Text>
                                                    <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{it.price * it.qty} DH</Text>
                                                </View>
                                                {it.note ? <Text style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 4 }}>{t('notes')}: {it.note}</Text> : null}
                                            </View>
                                        ))}
                                    </ScrollView>

                                    <View style={{ borderTopWidth: 2, borderTopColor: COLORS.border, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: THEME_TEXT }}>{t('total')}</Text>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.primary }}>{viewingHistoryOrder.total_amount} DH</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Small Popup Menu for History */}
                <Modal visible={!!historyActionMenuOrder} transparent animationType="fade" onRequestClose={() => setHistoryActionMenuOrder(null)}>
                    <TouchableOpacity 
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} 
                        activeOpacity={1} 
                        onPress={() => setHistoryActionMenuOrder(null)}
                    >
                        {historyActionMenuOrder && (
                            <View style={{ 
                                position: 'absolute', 
                                top: Math.min(historyActionMenuOrder.y - 120, height - 250), // Position near click, prevent overflow
                                right: 30, 
                                width: 220, 
                                backgroundColor: THEME_CARD, 
                                borderRadius: 18, 
                                padding: 8,
                                elevation: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 10,
                                borderWidth: 1,
                                borderColor: COLORS.border
                            }}>
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 }}
                                    onPress={() => {
                                        const { order } = historyActionMenuOrder;
                                        const reItems = (order.items || []).map(it => {
                                            const found = MENU_ITEMS.find(m => m.name === it.name);
                                            return found ? { ...found, qty: it.qty, note: it.note || '' } : null;
                                        }).filter(Boolean);
                                        setBasket(reItems);
                                        setTable(String(order.table || '1'));
                                        setOrderType(order.type || 'Dine-In');
                                        setOrdersTab('upcoming');
                                        setActiveTab('cart');
                                        setHistoryActionMenuOrder(null);
                                        Alert.alert('✅', t('loadingOrder'));
                                    }}
                                >
                                    <SquarePen size={18} color={COLORS.primary} style={{ marginRight: 12 }} />
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: THEME_TEXT }}>{t('modify')}</Text>
                                </TouchableOpacity>

                                <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 4, marginHorizontal: 8 }} />

                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 }}
                                    onPress={() => {
                                        const { index } = historyActionMenuOrder;
                                        setOrderHistory(prev => prev.filter((_, idx) => idx !== index));
                                        setHistoryActionMenuOrder(null);
                                        Alert.alert('✅', t('deletedFromHistory'));
                                    }}
                                >
                                    <Trash2 size={18} color={COLORS.danger} style={{ marginRight: 12 }} />
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.danger }}>{t('delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>
                </Modal>
            </View>
        );

        return (
            <View style={{ flex: 1, backgroundColor: THEME_BG }}>
                {/* Header */}
                <View style={s.ordersHeader}>
                    <TouchableOpacity style={s.ordersBackBtn} onPress={() => setActiveTab('home')}>
                        <ArrowLeft size={22} color={THEME_TEXT} />
                    </TouchableOpacity>
                    <Text style={[s.ordersHeaderTitle, { color: THEME_TEXT }]}>Orders</Text>
                    <TouchableOpacity style={s.ordersBellBtn}>
                        <Bell size={22} color={THEME_TEXT} />
                        {basketCount > 0 && <View style={s.bellBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{basketCount}</Text></View>}
                    </TouchableOpacity>
                </View>

                {/* Tab Switch */}
                <View style={s.ordersTabsRow}>
                    <TouchableOpacity style={[s.ordersTab, ordersTab === 'upcoming' && s.ordersTabActive]} onPress={() => setOrdersTab('upcoming')}>
                        <Text style={[s.ordersTabText, ordersTab === 'upcoming' && s.ordersTabTextActive]}>Upcoming</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.ordersTab, ordersTab === 'history' && s.ordersTabActive]} onPress={() => setOrdersTab('history')}>
                        <Text style={[s.ordersTabText, ordersTab === 'history' && s.ordersTabTextActive]}>History</Text>
                    </TouchableOpacity>
                </View>

                {ordersTab === 'upcoming' ? renderUpcoming() : renderHistory()}

                {/* Checkout Modal */}
                <Modal visible={showCheckoutModal} transparent animationType="slide" onRequestClose={() => setShowCheckoutModal(false)}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,26,26,0.6)' }}>
                        <View style={{ backgroundColor: THEME_CARD, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: THEME_TEXT }}>{t('confirmOrderTitle')}</Text>
                                <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: THEME_BG, alignItems: 'center', justifyContent: 'center' }} onPress={() => setShowCheckoutModal(false)}>
                                    <X size={22} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={[s.orderDetailLabel, { marginBottom: 12 }]}>{t('chooseOrderType')}</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    {ORDER_TYPES.map(type => (
                                        <TouchableOpacity key={type.key} style={[{ flex: 1, paddingVertical: 14, borderRadius: 16, borderWith: 1.5, borderColor: COLORS.border, backgroundColor: THEME_BG, alignItems: 'center', gap: 6 }, orderType === type.key && { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5 }]} onPress={() => setOrderType(type.key)}>
                                            <Text style={{ fontSize: 20 }}>{type.icon}</Text>
                                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: orderType === type.key ? COLORS.primary : THEME_TEXT }}>{t(type.label_key)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={{ marginBottom: 28 }}>
                                {orderType === 'Dine-In' && (
                                    <>
                                        <Text style={s.orderDetailLabel}>{t('tableNumber')}</Text>
                                        <TouchableOpacity style={[s.selectBtn, { backgroundColor: THEME_BG }]} onPress={() => setShowTablePicker(!showTablePicker)}>
                                            <ChevronRight size={16} color={COLORS.textMuted} />
                                            <Text style={[s.selectBtnText, { color: THEME_TEXT }]}>{t('table')} {table}</Text>
                                        </TouchableOpacity>
                                        {showTablePicker && (
                                            <View style={s.tableQuickPicker}>
                                                {['1','2','3','4','5','6','7','8','9','10'].map(t => (
                                                    <TouchableOpacity key={t} style={[s.tableQuickBtn, table === t && s.tableQuickBtnActive]} onPress={() => { setTable(t); setShowTablePicker(false); }}>
                                                        <Text style={[s.tableQuickBtnText, table === t && { color: COLORS.white }]}>{t}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}

                                {orderType === 'Delivery' && (
                                    <>
                                        <Text style={s.orderDetailLabel}>{t('deliveryDataLabel')}</Text>
                                        <TextInput style={[s.modalInput, { backgroundColor: THEME_BG, height: 80, textAlignVertical: 'top' }]} placeholder={t('deliveryPlaceholder')} multiline value={deliveryInfo} onChangeText={setDeliveryInfo} />
                                    </>
                                )}

                                {orderType === 'Carry-Out' && (
                                    <View style={{ padding: 16, backgroundColor: THEME_BG, borderRadius: 16, alignItems: 'center' }}>
                                        <Text style={{ color: COLORS.textMuted }}>{t('carryOutInfo')}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={{ backgroundColor: COLORS.primary, padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 12, opacity: isSubmitting ? 0.6 : 1 }} onPress={() => { setShowTablePicker(false); submitOrder(); }} disabled={isSubmitting}>
                                <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 20 }}>{isSubmitting ? t('sending') : t('confirmAndSend')}</Text>
                                {!isSubmitting && <Send size={24} color={COLORS.white} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    const renderLanguage = () => (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={s.profHeader}>
                <TouchableOpacity style={s.backBtn} onPress={() => setProfSub(null)}>
                    <ArrowLeft size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={s.profHeaderTitle}>{t('language')}</Text>
                <View style={{ width: 44 }} />
            </View>
            <View style={{ padding: 24 }}>
                <Text style={s.sectionLabel}>{t('selectLang')}</Text>
                {[
                    { id: 'ar', name: t('arabic') },
                    { id: 'fr', name: t('french') },
                ].map((l) => (
                    <TouchableOpacity key={l.id} style={[s.profMenuItem, lang === l.id && { backgroundColor: COLORS.primaryLight, borderRadius: 16, marginBottom: 8 }]} onPress={() => setLang(l.id)}>
                        <Text style={[s.profMenuLabel, lang === l.id && { color: COLORS.primary, fontWeight: 'bold' }]}>{l.name}</Text>
                        {lang === l.id && <Check size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // ABOUT PAGE
    const renderAbout = () => (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={s.profHeader}>
                <TouchableOpacity style={s.backBtn} onPress={() => setProfSub(null)}>
                    <ArrowLeft size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={s.profHeaderTitle}>{t('aboutApp')}</Text>
                <View style={{ width: 44 }} />
            </View>
            <View style={{ padding: 24, alignItems: 'center' }}>
                <View style={s.profileAvatar}><Info size={40} color={COLORS.primary} /></View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 8 }}>{t('versionShort')}</Text>
                <Text style={{ fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
                    {t('aboutLead')}
                </Text>

                <View style={{ width: '100%', backgroundColor: COLORS.cardBody, borderRadius: 20, padding: 20 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 12, textAlign: lang === 'ar' ? 'right' : 'left' }}>{t('features')}</Text>
                    <Text style={{ color: COLORS.textMuted, marginBottom: 8, textAlign: lang === 'ar' ? 'right' : 'left' }}>• {t('feature1')}</Text>
                    <Text style={{ color: COLORS.textMuted, marginBottom: 8, textAlign: lang === 'ar' ? 'right' : 'left' }}>• {t('feature2')}</Text>
                    <Text style={{ color: COLORS.textMuted, marginBottom: 8, textAlign: lang === 'ar' ? 'right' : 'left' }}>• {t('feature3')}</Text>
                </View>
            </View>
        </ScrollView>
    );

    // PROFILE
    const renderProfile = () => {
        if (profSub === 'language') return renderLanguage();
        if (profSub === 'about') return renderAbout();

        const THEME_BG = darkMode ? '#121212' : COLORS.white;
        const THEME_TEXT = darkMode ? '#FFFFFF' : COLORS.textMain;
        const THEME_CARD = darkMode ? '#1E1E1E' : COLORS.cardBody;

        return (
            <View style={{ flex: 1, backgroundColor: THEME_BG }}>
                <View style={s.profHeader}>
                    <TouchableOpacity style={[s.backBtn, darkMode && { backgroundColor: '#333' }]} onPress={() => setActiveTab('home')}>
                        <ArrowLeft size={24} color={THEME_TEXT} />
                    </TouchableOpacity>
                    <Text style={[s.profHeaderTitle, { color: THEME_TEXT }]}>{t('profile')}</Text>
                    <TouchableOpacity style={[s.logoutBtn, darkMode && { backgroundColor: '#333' }]} onPress={() => Alert.alert(t('logout'), t('logoutConfirm'))}>
                        <Power size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                    <View style={s.userInfoRow}>
                        <View style={s.avatarContainer}>
                            <View style={[s.avatarCircle, { backgroundColor: THEME_CARD }]}>
                                <User size={40} color={COLORS.textMuted} />
                            </View>
                        </View>
                        <View style={s.userTextDetails}>
                            <Text style={s.userNameText}>{waiterName}</Text>
                            <View style={s.userPhoneRow}>
                                <Phone size={14} color={COLORS.textMuted} />
                                <Text style={s.userPhoneText}> {waiterPhone}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={s.editProfileBtn} onPress={() => setIsEditingProfile(true)}>
                            <Edit3 size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Feature 1: Shift Stats */}
                    <View style={s.statsContainer}>
                        <View style={[s.statCard, { backgroundColor: THEME_CARD }]}>
                            <View style={[s.statIcon, { backgroundColor: 'rgba(74, 144, 226, 0.1)' }]}>
                                <Clipboard size={22} color="#4A90E2" />
                            </View>
                            <Text style={[s.statValue, { color: THEME_TEXT }]}>{stats.orders}</Text>
                            <Text style={s.statLabel}>{t('todayOrders')}</Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: THEME_CARD }]}>
                            <View style={[s.statIcon, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
                                <CreditCard size={22} color="#27AE60" />
                            </View>
                            <Text style={[s.statValue, { color: THEME_TEXT }]}>0 <Text style={{ fontSize: 12 }}>DH</Text></Text>
                            <Text style={s.statLabel}>{t('totalSales')}</Text>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                        <Text style={[s.sectionSubtitle, { color: THEME_TEXT }]}>{t('generalSettings')}</Text>

                        {/* Feature 2: Vibration Toggle */}
                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => setVibrationEnabled(!vibrationEnabled)}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Send size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>{t('vibration')}</Text>
                            <View style={[s.toggleTrack, vibrationEnabled && s.toggleTrackActive]}>
                                <View style={[s.toggleThumb, vibrationEnabled && s.toggleThumbActive]} />
                            </View>
                        </TouchableOpacity>

                        {/* Sound Toggle */}
                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => setSoundEnabled(!soundEnabled)}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Volume2 size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>{t('sound')}</Text>
                            <View style={[s.toggleTrack, soundEnabled && s.toggleTrackActive]}>
                                <View style={[s.toggleThumb, soundEnabled && s.toggleThumbActive]} />
                            </View>
                        </TouchableOpacity>

                        {/* Feature 3: Dark Mode Toggle */}
                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => setDarkMode(!darkMode)}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <ShieldCheck size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>{t('dark')}</Text>
                            <View style={[s.toggleTrack, darkMode && s.toggleTrackActive]}>
                                <View style={[s.toggleThumb, darkMode && s.toggleThumbActive]} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={testNotification}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Send size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>اختبار التنبيهات (Test)</Text>
                            <ChevronRight size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => setProfSub('language')}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Languages size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>Language / اللغة</Text>
                            <ChevronRight size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        {/* Feature 4: IT Support */}
                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => Alert.alert('الدعم الفني', 'جاري توجيهك إلى واتساب الدعم التقني...')}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Headset size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>{t('itSupport')}</Text>
                            <ChevronRight size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[s.profMenuItem, { backgroundColor: THEME_BG }]} onPress={() => setProfSub('about')}>
                            <View style={[s.profMenuIconWrap, { backgroundColor: THEME_CARD }]}>
                                <Info size={20} color={THEME_TEXT} />
                            </View>
                            <Text style={[s.profMenuLabel, { color: THEME_TEXT }]}>{t('aboutApp')}</Text>
                            <ChevronRight size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={s.container} edges={['right', 'left', 'top']}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} translucent={true} />
                {activeTab === 'home' && renderHome()}
                {activeTab === 'category' && renderCategory()}
                {activeTab === 'search' && renderSearch()}
                {activeTab === 'cart' && renderCart()}
                {activeTab === 'profile' && renderProfile()}
                <ItemDetailModal item={modalItem} visible={!!modalItem} onClose={() => setModalItem(null)} onConfirm={addToBasket} lang={lang} t={t} />
                <EditProfileModal 
                    visible={isEditingProfile} 
                    onClose={() => setIsEditingProfile(false)} 
                    waiterName={waiterName} 
                    waiterPhone={waiterPhone}
                    setWaiterName={setWaiterName}
                    setWaiterPhone={setWaiterPhone}
                    t={t}
                />
                <View style={[s.bottomNav, darkMode && { backgroundColor: '#121212', borderTopColor: '#333' }]}>
                    {[
                        { key: 'home', icon: Home, label: t('home') },
                        { key: 'search', icon: Search, label: t('menu') },
                        { key: 'cart', icon: Clipboard, label: t('orders'), badge: basketCount },
                        { key: 'profile', icon: User, label: t('profile') },
                    ].map(tab => {
                        const active = activeTab === tab.key || (activeTab === 'category' && tab.key === 'home');
                        const IC = tab.icon;
                        return (
                            <TouchableOpacity key={tab.key} style={s.navItem} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}>
                                <View style={s.navIconWrap}>
                                    <IC size={24} color={active ? COLORS.primary : COLORS.textMuted} strokeWidth={active ? 2.5 : 2} />
                                    {tab.badge > 0 && <View style={s.navBadge}><Text style={s.navBadgeText}>{tab.badge}</Text></View>}
                                </View>
                                <Text style={[s.navLabel, active && s.navLabelActive, active && darkMode && { color: COLORS.primary }]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

// ===== STYLES =====
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    modalInput: { backgroundColor: COLORS.cardBody, borderRadius: 16, padding: 18, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    modalBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sectionSubtitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 4, marginBottom: 16, marginTop: 10 },
    statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
    statCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center' },
    statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 12, color: COLORS.textMuted },
    toggleTrack: { width: 46, height: 26, borderRadius: 13, backgroundColor: COLORS.border, padding: 2, justifyContent: 'center' },
    toggleTrackActive: { backgroundColor: COLORS.primary },
    toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white },
    toggleThumbActive: { alignSelf: 'flex-end', backgroundColor: COLORS.white },
    homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 10 },
    deliverLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, letterSpacing: 1 },
    locationText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
    cartBadgeBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.primary, borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
    badgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
    newHeader: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 20 : 14,
        paddingBottom: 70,
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
    },
    topHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 28,
        color: COLORS.white,
        fontWeight: '900',
        fontStyle: 'italic',
        fontFamily: FONTS.extra,
        letterSpacing: -0.5,
    },
    rightHeaderIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 60, // Equal to Wallet space approximately
    },
    headerTableInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 5,
    },
    headerTableText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    headerSlant: {
        position: 'absolute',
        bottom: -40,
        left: -50,
        right: -50,
        height: 80,
        backgroundColor: COLORS.white,
        transform: [{ rotate: '-4deg' }],
    },
    welcomeText: { fontSize: 32, fontWeight: 'bold', color: COLORS.textMain, lineHeight: 40 },
    welcomeSub: { fontSize: 16, color: COLORS.textMuted, marginTop: 4 },
    categoriesGrid: { paddingHorizontal: 20 }, // Legacy reference just in case
    specialOffersList: { paddingHorizontal: 20 },
    specialOfferCard: { width: '100%', height: 160, borderRadius: 28, marginBottom: 16, padding: 24, justifyContent: 'center', overflow: 'hidden', position: 'relative', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    specialOfferContent: { width: '60%', alignSelf: 'flex-end', alignItems: 'flex-end', zIndex: 10 },
    specialOfferTitle: { fontSize: 24, fontWeight: '900', color: COLORS.white, textAlign: 'right', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    specialOfferSub: { fontSize: 13, fontWeight: 'bold', color: 'rgba(255,255,255,0.85)', marginTop: 8, textAlign: 'right' },
    specialOfferImage: { position: 'absolute', top: -20, width: 180, height: 200, borderRadius: 90, borderWidth: 6, borderColor: 'rgba(255,255,255,0.15)' },

    catHeaderPage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    catHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
    itemEmojiBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    itemEmoji: { fontSize: 32 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
    itemPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
    itemHint: { fontSize: 12, color: COLORS.textMuted },
    addItemBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    // Menu Grid Styles
    menuGridItem: {
        width: (width - 20) / 4,
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    menuEmojiBox: {
        width: 70,
        height: 70,
        borderRadius: 22,
        backgroundColor: COLORS.cardBody,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuEmoji: { fontSize: 34 },
    menuItemName: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center' },

    searchHeader: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 16 },
    searchTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 16 },
    searchInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBody, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.border },
    searchInput: { flex: 1, fontSize: 16, marginLeft: 12, color: COLORS.textMain },
    cartHeader: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 20, paddingBottom: 20 },
    cartTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textMain },
    orderDetailsBox: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#E5E5E5' },
    orderDetailLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 10, textAlign: 'right' },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EEEEEE' },
    selectBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
    tableQuickPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    tableQuickBtn: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    tableQuickBtnActive: { backgroundColor: COLORS.primary },
    tableQuickBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
    cartItemCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
    cartItemRow: { flexDirection: 'row', alignItems: 'center' },
    itemEmojiBoxSmall: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    cartItemName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
    cartItemPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    trashBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
    cartItemFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 24, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    qtyBtnLight: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEEEEE' },
    qtyTextLight: { fontSize: 17, fontWeight: 'bold', color: COLORS.textMain, width: 36, textAlign: 'center' },
    noteInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: COLORS.textMain, borderWidth: 1, borderColor: '#EEEEEE' },
    totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginTop: 10, paddingVertical: 24, borderTopWidth: 1, borderTopColor: COLORS.border },
    totalLabel: { fontSize: 18, color: COLORS.textMuted },
    totalValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.textMain },
    checkoutFooter: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
    },
    footerTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 10 },
    footerTotalLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.textMuted },
    footerTotalValueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    footerTotalValue: { fontSize: 26, fontWeight: 'bold', color: COLORS.textMain },
    footerTotalCurrency: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
    submitBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 10, borderRadius: 24, alignItems: 'center', justifyContent: 'space-between', height: 68 },
    submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 19 },
    submitArrowBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
    submitBtnBadge: { backgroundColor: 'rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    submitBtnBadgeText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    emptyCartBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
    emptyTextTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 8 },
    emptyTextSub: { fontSize: 16, color: COLORS.textMuted },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 16 },
    profileHeaderPage: { alignItems: 'center', paddingTop: 20, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    profileAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    profileName: { fontSize: 28, fontWeight: 'bold', color: COLORS.textMain },
    sectionLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 16 },
    tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    tableBtn: { width: (width - 84) / 4, aspectRatio: 1, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
    tableBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tableBtnText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMuted },
    tableBtnTextActive: { color: COLORS.white },
    bottomNav: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingTop: 12 },
    navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navIconWrap: { position: 'relative', padding: 8, borderRadius: 20, marginBottom: 4 },
    navLabel: { fontSize: 11, color: COLORS.textMuted },
    navLabelActive: { color: COLORS.primary, fontWeight: 'bold' },
    navBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
    navBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

    // NEW PROFILE STYLES
    profHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
    profHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain, fontFamily: FONTS.semi },
    logoutBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    userInfoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: COLORS.cardBody, borderWidth: 1, borderColor: COLORS.border },
    avatarCircle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    userTextDetails: { flex: 1, marginLeft: 20 },
    userNameText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
    userPhoneRow: { flexDirection: 'row', alignItems: 'center' },
    userPhoneText: { fontSize: 14, color: COLORS.textMuted },
    editProfileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    profMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 24, borderBottomWidth: 0, borderBottomColor: COLORS.border },
    profMenuIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.cardBody, alignItems: 'center', justifyContent: 'center' },
    profMenuLabel: { flex: 1, fontSize: 16, color: COLORS.textMain, marginLeft: 16, fontWeight: '500' },
    profMenuValue: { fontSize: 14, color: COLORS.textMuted, marginRight: 10 },
    tableToggleBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    tableToggleText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

    // ORDERS PAGE STYLES
    ordersHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
    ordersHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
    ordersBackBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center' },
    ordersBellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EDEDED', alignItems: 'center', justifyContent: 'center' },
    bellBadge: { position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    ordersTabsRow: { flexDirection: 'row', backgroundColor: '#EDEDED', borderRadius: 50, marginHorizontal: 20, marginBottom: 16, padding: 5 },
    ordersTab: { flex: 1, paddingVertical: 13, borderRadius: 50, alignItems: 'center' },
    ordersTabActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    ordersTabText: { fontSize: 15, fontWeight: '600', color: '#888' },
    ordersTabTextActive: { color: COLORS.white, fontWeight: 'bold' },

    // Order cards (upcoming basket items)
    orderCard: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: '#E5E5E5' },
    orderCardTop: { flexDirection: 'row', alignItems: 'center' },
    orderCardEmoji: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
    orderCardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
    orderCardTotal: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },

    // History cards
    historyCard: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#E5E5E5' },
    historyCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    historyImgBox: { width: 72, height: 72, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
    historyImgMore: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
    historyCardActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    reorderBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: '#CCCCCC', alignItems: 'center', backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    reorderBtnText: { fontSize: 15, fontWeight: 'bold', color: COLORS.textMain },
    moreBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 2, borderColor: '#CCCCCC', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
});
