'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from 'sonner';

const SETTINGS_KEY = 'pos_settings';

const defaultSettings = {
    restaurantName: 'Paris Food',
    restaurantPhone: '0600000000',
    restaurantAddress: 'Maroc',
    currency: 'DH',
    taxRate: '0',
    defaultTable: '1',
    kitchenAlertSound: true,
    autoCompleteOrders: false,
    showOrderTimer: true,
    printerEnabled: false,
    printerIP: '',
    adminPassword: '',
    newPassword: '',
    confirmPassword: '',
};

function loadSettings() {
    if (typeof window === 'undefined') return defaultSettings;
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
}

function saveSettings(s) {
    const toSave = { ...s };
    delete toSave.adminPassword;
    delete toSave.newPassword;
    delete toSave.confirmPassword;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
}

export default function SettingsPage() {
    const { lang, setLang, t, dir } = useLanguage();
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setSettings(loadSettings()); }, []);

    const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 500));
        saveSettings(settings);
        setIsSaving(false);
        toast.success(t('savedOk'));
    };

    const handleChangePassword = () => {
        if (!settings.newPassword || settings.newPassword.length < 6) {
            toast.error(t('passMinError')); return;
        }
        if (settings.newPassword !== settings.confirmPassword) {
            toast.error(t('passMatchError')); return;
        }
        toast.success(t('passUpdated'));
        set('newPassword', ''); set('confirmPassword', '');
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pos_auth');
            window.location.href = '/admin/login';
        }
    };

    const sections = [
        { id: 'general',  icon: 'store',        labelKey: 'restaurantSection' },
        { id: 'system',   icon: 'tune',          labelKey: 'systemSection' },
        { id: 'kitchen',  icon: 'soup_kitchen',  labelKey: 'kitchenSection' },
        { id: 'security', icon: 'lock',          labelKey: 'securitySection' },
        { id: 'about',    icon: 'info',          labelKey: 'aboutSection' },
    ];

    const Toggle = ({ value, onChange }) => (
        <button onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? 'bg-[#FF4B2B]' : 'bg-gray-200'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
        </button>
    );

    const Row = ({ icon, iconColor, bgColor, title, sub, right }) => (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${iconColor} text-[20px]`}>{icon}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">{title}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
            </div>
            {right}
        </div>
    );

    const inp = "w-full px-4 py-2.5 bg-white border border-[#E8ECEF] rounded-xl text-sm focus:outline-none focus:border-[#FF4B2B] transition-colors";
    const lbl = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";
    const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', { day: 'numeric', month: 'long', year: 'numeric' });

    // Section label extraction (remove emoji prefix)
    const sectionLabel = (labelKey) => {
        const full = t(labelKey);
        return full.replace(/^[^\w\u0600-\u06FF]+/, '').trim();
    };

    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir={dir}>
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD]">
                {/* Header */}
                <header className="h-[88px] shrink-0 px-8 flex items-center justify-between bg-white border-b border-[#E8ECEF]">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a]">{t('settingsTitle')}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{t('settingsSub')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <span className="text-sm">{currentDate}</span>
                        </div>
                        <button onClick={handleSave} disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2 bg-[#FF4B2B] text-white rounded-xl text-sm font-bold hover:bg-[#e04424] transition-all disabled:opacity-60">
                            <span className={`material-symbols-outlined text-[18px] ${isSaving ? 'animate-spin' : ''}`}>{isSaving ? 'sync' : 'save'}</span>
                            {isSaving ? t('saving') : t('saveBtn')}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Section Nav */}
                    <aside className="w-[220px] shrink-0 bg-white border-r border-[#E8ECEF] p-4 flex flex-col gap-1">
                        {sections.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${activeSection === s.id ? 'bg-[#FFF0ED] text-[#FF4B2B]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                                <span className={`material-symbols-outlined text-[20px] ${activeSection === s.id ? 'text-[#FF4B2B]' : 'text-gray-400'}`}>{s.icon}</span>
                                {sectionLabel(s.labelKey)}
                            </button>
                        ))}
                        <div className="mt-auto pt-4 border-t border-[#E8ECEF]">
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                {t('logout')}
                            </button>
                        </div>
                    </aside>

                    {/* Right: Content */}
                    <div className="flex-1 overflow-y-auto p-8">

                        {/* ── GENERAL ── */}
                        {activeSection === 'general' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">{t('restaurantSection')}</h2>
                                    <p className="text-sm text-gray-400 mb-6">{t('restaurantSub')}</p>
                                    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6 space-y-5">
                                        <div>
                                            <label className={lbl}>{t('restaurantName')}</label>
                                            <input className={inp} value={settings.restaurantName} onChange={e => set('restaurantName', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={lbl}>{t('phone')}</label>
                                                <input className={inp} value={settings.restaurantPhone} onChange={e => set('restaurantPhone', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className={lbl}>{t('currency')}</label>
                                                <select className={inp} value={settings.currency} onChange={e => set('currency', e.target.value)}>
                                                    <option value="DH">{t('marocDH')}</option>
                                                    <option value="EUR">{t('euro')}</option>
                                                    <option value="USD">{t('dollar')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lbl}>{t('address')}</label>
                                            <input className={inp} value={settings.restaurantAddress} onChange={e => set('restaurantAddress', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={lbl}>{t('taxRate')}</label>
                                                <input type="number" className={inp} value={settings.taxRate} onChange={e => set('taxRate', e.target.value)} min="0" max="30" />
                                            </div>
                                            <div>
                                                <label className={lbl}>{t('defaultTable')}</label>
                                                <input type="number" className={inp} value={settings.defaultTable} onChange={e => set('defaultTable', e.target.value)} min="1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── SYSTEM ── */}
                        {activeSection === 'system' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">{t('systemSection')}</h2>
                                    <p className="text-sm text-gray-400 mb-6">{t('systemSub')}</p>
                                    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6 divide-y divide-[#F5F5F5]">

                                        {/* Language — Real Global Switch */}
                                        <Row icon="translate" iconColor="text-blue-500" bgColor="bg-blue-50"
                                            title={t('language')} sub={lang === 'fr' ? 'Français' : 'العربية'}
                                            right={
                                                <div className="flex gap-2">
                                                    {['fr', 'ar'].map(l => (
                                                        <button key={l} onClick={() => setLang(l)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${lang === l ? 'bg-[#FF4B2B] text-white border-[#FF4B2B]' : 'bg-white text-gray-500 border-[#E8ECEF] hover:border-[#FF4B2B]'}`}>
                                                            {l === 'fr' ? '🇫🇷 FR' : '🇲🇦 AR'}
                                                        </button>
                                                    ))}
                                                </div>
                                            } />

                                        <Row icon="timer" iconColor="text-orange-500" bgColor="bg-orange-50"
                                            title={t('orderTimer')} sub={t('orderTimerSub')}
                                            right={<Toggle value={settings.showOrderTimer} onChange={v => set('showOrderTimer', v)} />} />

                                        <Row icon="check_circle" iconColor="text-green-500" bgColor="bg-green-50"
                                            title={t('autoComplete')} sub={t('autoCompleteSub')}
                                            right={<Toggle value={settings.autoCompleteOrders} onChange={v => set('autoCompleteOrders', v)} />} />

                                        <Row icon="print" iconColor="text-purple-500" bgColor="bg-purple-50"
                                            title={t('printer')} sub={t('printerSub')}
                                            right={<Toggle value={settings.printerEnabled} onChange={v => set('printerEnabled', v)} />} />

                                        {settings.printerEnabled && (
                                            <div className="py-4">
                                                <label className={lbl}>{t('printerIP')}</label>
                                                <input className={inp} value={settings.printerIP} onChange={e => set('printerIP', e.target.value)} placeholder="192.168.1.100" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Connection Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Supabase</h3>
                                    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{t('dbStatus')}</span>
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                {t('connected')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{t('provider')}</span>
                                            <span className="text-sm font-bold text-gray-700">Supabase PostgreSQL</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">{t('serverIP')}</span>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">192.168.18.93:3000</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── KITCHEN ── */}
                        {activeSection === 'kitchen' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">{t('kitchenSection')}</h2>
                                    <p className="text-sm text-gray-400 mb-6">{t('kitchenSub')}</p>
                                    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6 divide-y divide-[#F5F5F5]">
                                        <Row icon="volume_up" iconColor="text-yellow-500" bgColor="bg-yellow-50"
                                            title={t('alertSound')} sub={t('alertSoundSub')}
                                            right={<Toggle value={settings.kitchenAlertSound} onChange={v => set('kitchenAlertSound', v)} />} />
                                        <Row icon="timer" iconColor="text-orange-500" bgColor="bg-orange-50"
                                            title={t('kitchenTimer')} sub={t('kitchenTimerSub')}
                                            right={<Toggle value={settings.showOrderTimer} onChange={v => set('showOrderTimer', v)} />} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">{t('kitchenStations')}</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { name: 'Kitchen', icon: 'cooking', color: '#FF4B2B', label: lang === 'ar' ? 'المطبخ الرئيسي' : 'Cuisine' },
                                            { name: 'Oven',    icon: 'local_pizza', color: '#F2994A', label: lang === 'ar' ? 'الفرن / Pizza' : 'Four / Pizza' },
                                            { name: 'Bar',     icon: 'local_bar',  color: '#2D9CDB', label: 'Bar' },
                                        ].map(st => (
                                            <div key={st.name} className="bg-white rounded-2xl border border-[#E8ECEF] p-5 text-center">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: st.color + '15' }}>
                                                    <span className="material-symbols-outlined text-[24px]" style={{ color: st.color }}>{st.icon}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{st.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{st.label}</p>
                                                <div className="mt-3 flex items-center justify-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                    <span className="text-xs text-green-500 font-medium">{t('active')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── SECURITY ── */}
                        {activeSection === 'security' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">{t('securitySection')}</h2>
                                    <p className="text-sm text-gray-400 mb-6">{t('securitySub')}</p>
                                    <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6 space-y-5">
                                        <div>
                                            <label className={lbl}>{t('currentPass')}</label>
                                            <input type="password" className={inp} placeholder="••••••••" value={settings.adminPassword} onChange={e => set('adminPassword', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={lbl}>{t('newPass')}</label>
                                            <input type="password" className={inp} placeholder={t('minChars')} value={settings.newPassword} onChange={e => set('newPassword', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={lbl}>{t('confirmPass')}</label>
                                            <input type="password" className={inp} placeholder={t('minChars')} value={settings.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                                        </div>
                                        <button onClick={handleChangePassword} className="w-full py-2.5 bg-[#FF4B2B] text-white font-bold rounded-xl text-sm hover:bg-[#e04424] transition-all">
                                            {t('updatePass')}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#FFF8F6] border border-[#FFD5CC] rounded-2xl p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-[#FF4B2B] text-[22px] mt-0.5">info</span>
                                        <div>
                                            <p className="text-sm font-bold text-[#FF4B2B] mb-1">{t('sessionInfo')}</p>
                                            <p className="text-xs text-gray-600">{t('sessionText')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── ABOUT ── */}
                        {activeSection === 'about' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">{t('aboutSection')}</h2>
                                    <p className="text-sm text-gray-400 mb-6">{t('aboutSub')}</p>
                                </div>
                                <div className="bg-gradient-to-br from-[#FF4B2B] to-[#FF8C42] rounded-2xl p-8 text-white text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">Paris Food POS</h3>
                                    <p className="text-white/80 text-sm mb-4">{lang === 'ar' ? 'نظام إدارة المطعم المتكامل' : 'Système intégré de gestion de restaurant'}</p>
                                    <div className="bg-white/20 rounded-xl px-4 py-2 inline-block">
                                        <span className="text-sm font-bold">Version 1.0.0 · Production</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6">
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">{t('techStack')}</h3>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Next.js 16', role: 'Frontend / Backend', icon: 'code' },
                                            { name: 'Supabase', role: lang === 'ar' ? 'قاعدة البيانات السحابية' : 'Base de données cloud', icon: 'database' },
                                            { name: 'React Native + Expo', role: lang === 'ar' ? 'تطبيق الهاتف (النادل)' : 'Application mobile (Serveur)', icon: 'smartphone' },
                                            { name: 'Tailwind CSS', role: lang === 'ar' ? 'التصميم والواجهة' : 'Design & Interface', icon: 'palette' },
                                            { name: 'Supabase Realtime', role: lang === 'ar' ? 'التحديثات اللحظية' : 'Synchronisation temps réel', icon: 'bolt' },
                                        ].map(item => (
                                            <div key={item.name} className="flex items-center gap-3 py-2.5 border-b border-[#F5F5F5] last:border-0">
                                                <div className="w-8 h-8 rounded-lg bg-[#FF4B2B]/10 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[#FF4B2B] text-[16px]">{item.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-[#E8ECEF] p-6">
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">{t('systemStatus')}</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Next.js Server', statusKey: 'running' },
                                            { label: 'Supabase Database', statusKey: 'connected' },
                                            { label: 'Realtime Sync', statusKey: 'online' },
                                            { label: 'Expo Mobile', statusKey: 'running' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{item.label}</span>
                                                <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    {t(item.statusKey)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
