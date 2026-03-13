'use client';

import { useLanguage } from '@/lib/LanguageContext';
import Sidebar from '@/components/Sidebar';
import KitchenDisplay from '@/components/KitchenDisplay';

export default function Home() {
    const { dir } = useLanguage();
    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir={dir}>
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
                <KitchenDisplay />
            </main>
        </div>
    );
}
