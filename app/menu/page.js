'use client';

import { useLanguage } from '@/lib/LanguageContext';
import Sidebar from '@/components/Sidebar';
import MenuManager from '@/components/MenuManager';

export default function MenuPage() {
    const { t, lang } = useLanguage();

    const currentDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir="ltr">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD]">
                {/* Top Header */}
                <header className="h-[88px] shrink-0 px-8 flex items-center justify-between bg-white border-b border-[#E8ECEF]">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a]">{t('menuTitle')}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{t('menuSub')}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        <span className="text-sm">{currentDate}</span>
                    </div>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <MenuManager />
                </div>
            </main>
        </div>
    );
}
