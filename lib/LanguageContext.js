'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// ── Translations ──────────────────────────────────────────────
export const TRANSLATIONS = {
    fr: {
        // Sidebar
        newOrder: 'Nouvelle commande',
        kitchen: 'Cuisine',
        menu: 'Menu',
        history: 'Caissier / Historique',
        stats: 'Statistiques',
        settings: 'Paramètres',

        // Order Page
        orderTitle: 'Nouvelle Commande',
        orderSub: 'Créez et envoyez une commande en cuisine',
        table: 'Table',
        orderType: 'Type',
        dineIn: 'Sur Place',
        takeaway: 'À Emporter',
        delivery: 'Livraison',
        cash: 'Espèces',
        card: 'Carte',
        subtotal: 'Sous-total',
        sendOrder: 'Envoyer en Cuisine',
        sending: 'Envoi...',
        emptyBasket: 'Panier vide',
        emptyBasketSub: 'Ajoutez des articles du menu',
        searchPlaceholder: 'Rechercher un plat...',
        backToCategories: '← Catégories',
        items: 'articles',
        noItems: 'Aucun article dans cette catégorie',
        orderSent: '✅ Commande envoyée en cuisine !',
        orderError: 'Erreur lors de l\'envoi',
        paymentMethod: 'Paiement',
        notes: 'Notes',
        addNote: 'Ajouter une note...',

        // Kitchen
        openTickets: 'Tickets ouverts',
        avgTime: 'Moy',
        prepare: 'Préparer',
        ready: 'Prêt',
        completed: 'Terminé',
        requestWaiter: 'Appeler Serveur',
        newestFirst: 'Plus récent',
        oldestFirst: 'Plus ancien',
        noOrders: 'Aucun ticket',
        noOrdersSub: 'Les nouvelles commandes apparaîtront ici',

        // Menu Management
        menuTitle: 'Gestion du Menu',
        menuSub: 'Ajouter, modifier ou supprimer des articles',
        addItem: 'Ajouter article',
        cancel: 'Annuler',
        reset: 'Réinitialiser',
        available: '✓ Disponible',
        unavailable: '✗ Indisponible',
        itemName: 'Nom *',
        price: 'Prix (DH) *',
        categories: 'Catégories',
        station: 'Station',
        icon: 'Icône',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        addToMenu: '✅ Ajouter au menu',
        totalItems: 'articles au total',
        available2: 'disponibles',
        unavailable2: 'indisponibles',

        // Stats
        statsTitle: 'Statistiques',
        statsSub: 'Rapport des ventes · Paris Food',
        todayRevenue: 'Chiffre d\'affaires aujourd\'hui',
        todayOrders: 'commandes complétées aujourd\'hui',
        pending: 'En attente',
        activeOrders: 'commandes actives',
        totalSales: 'Ventes totales',
        orderCount: 'Nb commandes',
        itemsSold: 'Articles vendus',
        avgBasket: 'Panier moyen',
        perOrder: 'par commande',
        topSales: '🏆 Top ventes',
        recentOrders: '📋 Dernières commandes',
        noData: 'Aucune donnée disponible',
        noOrders2: 'Aucune commande complétée',
        takeOut: 'À emporter',
        evolution: 'Évolution des ventes',
        since: 'Depuis le début',
        orders: 'commandes',

        // Settings
        settingsTitle: 'Paramètres',
        settingsSub: 'Configuration du système · Paris Food',
        saveBtn: 'Enregistrer',
        saving: 'Sauvegarde...',
        savedOk: '✅ Paramètres sauvegardés avec succès',
        restaurantSection: '🏪 Informations du Restaurant',
        restaurantSub: 'Données de base utilisées dans les factures',
        restaurantName: 'Nom du restaurant',
        phone: 'Téléphone',
        currency: 'Devise',
        address: 'Adresse',
        taxRate: 'Taux de TVA (%)',
        defaultTable: 'Table par défaut',
        systemSection: '⚙️ Paramètres Système',
        systemSub: 'Personnaliser le comportement du POS',
        language: 'Langue de l\'interface',
        orderTimer: 'Minuteur de commande',
        orderTimerSub: 'Afficher le temps d\'attente de chaque commande',
        autoComplete: 'Complétion automatique',
        autoCompleteSub: 'Compléter la commande automatiquement à la livraison',
        printer: 'Impression automatique',
        printerSub: 'Imprimer la facture à la fin de la commande',
        printerIP: 'Adresse IP de l\'imprimante',
        dbStatus: 'État de la base de données',
        connected: 'Connecté · Online',
        provider: 'Fournisseur',
        serverIP: 'IP Serveur',
        kitchenSection: '🍳 Paramètres Cuisine KDS',
        kitchenSub: 'Personnaliser l\'écran cuisine et les commandes',
        alertSound: 'Son d\'alerte nouvelle commande',
        alertSoundSub: 'Jouer un son à l\'arrivée d\'une nouvelle commande',
        kitchenTimer: 'Minuteur de cuisson',
        kitchenTimerSub: 'Afficher le temps d\'attente sur l\'écran cuisine',
        kitchenStations: 'Stations de cuisine',
        active: 'Actif',
        securitySection: '🔒 Sécurité et Accès',
        securitySub: 'Gérer les mots de passe et accès',
        currentPass: 'Mot de passe actuel',
        newPass: 'Nouveau mot de passe',
        confirmPass: 'Confirmer le mot de passe',
        minChars: '6 caractères minimum',
        updatePass: '🔑 Mettre à jour le mot de passe',
        passUpdated: '✅ Mot de passe mis à jour',
        passMinError: 'Le mot de passe doit contenir au moins 6 caractères',
        passMatchError: 'Les mots de passe ne correspondent pas',
        sessionInfo: 'Informations de session',
        sessionText: 'Vous êtes connecté en tant qu\'Administrateur. La session expire à la fermeture du navigateur.',
        aboutSection: 'ℹ️ À propos du système',
        aboutSub: 'Version et informations techniques',
        techStack: 'Technologies utilisées',
        systemStatus: 'État du système',
        running: 'En cours',
        online: 'En ligne',
        logout: 'Déconnexion',

        // General
        marocDH: '🇲🇦 Dirham marocain (DH)',
        euro: '🇪🇺 Euro (€)',
        dollar: '🇺🇸 Dollar ($)',
    },
    ar: {
        // Sidebar
        newOrder: 'طلب جديد',
        kitchen: 'شاشة المطبخ',
        menu: 'القائمة',
        history: 'الكاشير / الطلبات',
        stats: 'الإحصائيات',
        settings: 'الإعدادات',

        // Order Page
        orderTitle: 'طلب جديد',
        orderSub: 'أنشئ وأرسل طلباً إلى المطبخ',
        table: 'طاولة',
        orderType: 'نوع الطلب',
        dineIn: 'داخل المطعم',
        takeaway: 'للخارج',
        delivery: 'توصيل',
        cash: 'نقداً',
        card: 'بطاقة',
        subtotal: 'المجموع',
        sendOrder: 'إرسال للمطبخ',
        sending: 'جاري الإرسال...',
        emptyBasket: 'السلة فارغة',
        emptyBasketSub: 'أضف أصنافاً من القائمة',
        searchPlaceholder: 'ابحث عن طبق...',
        backToCategories: '← الأصناف',
        items: 'أصناف',
        noItems: 'لا توجد أصناف في هذه الفئة',
        orderSent: '✅ تم إرسال الطلب للمطبخ!',
        orderError: 'حدث خطأ أثناء الإرسال',
        paymentMethod: 'طريقة الدفع',
        notes: 'ملاحظات',
        addNote: 'أضف ملاحظة...',

        // Kitchen
        openTickets: 'تذاكر مفتوحة',
        avgTime: 'وسط',
        prepare: 'تحضير',
        ready: 'جاهز',
        completed: 'مكتمل',
        requestWaiter: 'استدعاء النادل',
        newestFirst: 'الأحدث أولاً',
        oldestFirst: 'الأقدم أولاً',
        noOrders: 'لا توجد طلبات',
        noOrdersSub: 'ستظهر الطلبات الجديدة هنا',

        // Menu Management
        menuTitle: 'إدارة القائمة',
        menuSub: 'إضافة أو تعديل أو حذف الأصناف',
        addItem: 'إضافة صنف',
        cancel: 'إلغاء',
        reset: 'إعادة تعيين',
        available: '✓ متاح',
        unavailable: '✗ غير متاح',
        itemName: 'الاسم *',
        price: 'السعر (DH) *',
        categories: 'الفئات',
        station: 'المحطة',
        icon: 'الأيقونة / صورة',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        addToMenu: '✅ إضافة للقائمة',
        totalItems: 'صنف إجمالاً',
        available2: 'متاح',
        unavailable2: 'غير متاح',

        // Stats
        statsTitle: 'الإحصائيات',
        statsSub: 'تقرير المبيعات · Paris Food',
        todayRevenue: 'رقم الأعمال اليوم',
        todayOrders: 'طلبات مكتملة اليوم',
        pending: 'في الانتظار',
        activeOrders: 'طلبات نشطة',
        totalSales: 'المبيعات الإجمالية',
        orderCount: 'عدد الطلبات',
        itemsSold: 'الأصناف المباعة',
        avgBasket: 'متوسط الطلب',
        perOrder: 'لكل طلب',
        topSales: '🏆 الأكثر مبيعاً',
        recentOrders: '📋 آخر الطلبات',
        noData: 'لا توجد بيانات',
        noOrders2: 'لا توجد طلبات مكتملة',
        takeOut: 'للخارج',
        evolution: 'تطور المبيعات',
        since: 'منذ البداية',
        orders: 'طلبات',

        // Settings
        settingsTitle: 'الإعدادات',
        settingsSub: 'إعدادات النظام · Paris Food',
        saveBtn: 'حفظ',
        saving: 'جاري الحفظ...',
        savedOk: '✅ تم حفظ الإعدادات بنجاح',
        restaurantSection: '🏪 معلومات المطعم',
        restaurantSub: 'البيانات الأساسية التي تظهر في الفواتير',
        restaurantName: 'اسم المطعم',
        phone: 'رقم الهاتف',
        currency: 'العملة',
        address: 'العنوان',
        taxRate: 'نسبة الضريبة (%)',
        defaultTable: 'رقم الطاولة الافتراضي',
        systemSection: '⚙️ إعدادات النظام',
        systemSub: 'تخصيص طريقة عمل نظام POS',
        language: 'لغة الواجهة',
        orderTimer: 'مؤقت وقت الطلب',
        orderTimerSub: 'عرض وقت انتظار كل طلب',
        autoComplete: 'إكمال تلقائي للطلبات',
        autoCompleteSub: 'إكمال الطلب تلقائياً عند تسليمه',
        printer: 'الطباعة التلقائية',
        printerSub: 'طباعة الفاتورة عند إتمام الطلب',
        printerIP: 'عنوان IP للطابعة',
        dbStatus: 'حالة قاعدة البيانات',
        connected: 'متصل · Online',
        provider: 'المزود',
        serverIP: 'IP الخادم',
        kitchenSection: '🍳 إعدادات المطبخ KDS',
        kitchenSub: 'تخصيص شاشة المطبخ وسلوك الطلبات',
        alertSound: 'صوت تنبيه الطلب الجديد',
        alertSoundSub: 'تشغيل صوت عند وصول طلب جديد للمطبخ',
        kitchenTimer: 'مؤقت وقت الطهي',
        kitchenTimerSub: 'إظهار وقت انتظار كل طلب في شاشة المطبخ',
        kitchenStations: 'محطات المطبخ',
        active: 'نشط',
        securitySection: '🔒 الأمان والصلاحيات',
        securitySub: 'إدارة كلمات المرور والوصول للنظام',
        currentPass: 'كلمة المرور الحالية',
        newPass: 'كلمة المرور الجديدة',
        confirmPass: 'تأكيد كلمة المرور الجديدة',
        minChars: '6 أحرف على الأقل',
        updatePass: '🔑 تحديث كلمة المرور',
        passUpdated: '✅ تم تحديث كلمة المرور',
        passMinError: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل',
        passMatchError: 'كلمتا المرور غير متطابقتين',
        sessionInfo: 'معلومات الجلسة',
        sessionText: 'أنت مسجل الدخول كـ مدير النظام. الجلسة تنتهي تلقائياً عند إغلاق المتصفح.',
        aboutSection: 'ℹ️ حول النظام',
        aboutSub: 'معلومات النسخة والتقنية المستخدمة',
        techStack: 'التقنيات المستخدمة',
        systemStatus: 'حالة النظام',
        running: 'يعمل',
        online: 'نشط',
        logout: 'تسجيل الخروج',

        // General
        marocDH: '🇲🇦 درهم مغربي (DH)',
        euro: '🇪🇺 يورو (€)',
        dollar: '🇺🇸 دولار ($)',
    }
};

// ── Context ───────────────────────────────────────────────────
const LanguageContext = createContext({
    lang: 'fr',
    setLang: () => {},
    t: (key) => key,
    dir: 'ltr',
});

// ── Provider ──────────────────────────────────────────────────
export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState('fr');

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pos_lang');
        if (saved && (saved === 'fr' || saved === 'ar')) {
            setLangState(saved);
        }
    }, []);

    const setLang = (newLang) => {
        setLangState(newLang);
        localStorage.setItem('pos_lang', newLang);
    };

    const t = (key) => TRANSLATIONS[lang][key] || key;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────
export function useLanguage() {
    return useContext(LanguageContext);
}
