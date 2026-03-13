'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { href: '/order',   icon: 'point_of_sale', labelKey: 'newOrder' },
        { href: '/',        icon: 'soup_kitchen',  labelKey: 'kitchen' },
        { href: '/history', icon: 'receipt_long',  labelKey: 'history' },
        { href: '/menu',    icon: 'menu_book',     labelKey: 'menu' },
        { href: '/admin',   icon: 'bar_chart',     labelKey: 'stats' },
    ];

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-[110px] bg-white border-none flex flex-col items-center py-8 shrink-0 z-20 h-full shadow-[2px_0_24px_rgba(0,0,0,0.03)] relative">
            {/* Logo */}
            <div className="w-14 h-14 flex items-center justify-center text-white bg-gradient-to-br from-[#FF4B2B] to-[#FF4B2B] rounded-[20px] shadow-lg shadow-[#FF4B2B]/20 mb-10 shrink-0 transform transition-transform hover:scale-105 cursor-pointer">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    filter_vintage
                </span>
            </div>

            {/* Main Nav */}
            <nav className="flex flex-col gap-3 w-full px-3 flex-1">
                {navItems.map(({ href, icon, labelKey }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={t(labelKey)}
                            className={`relative w-full h-[80px] flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 gap-1.5 border border-transparent ${
                                active
                                    ? 'bg-[#FFF2EF] text-[#FF4B2B] shadow-[0_8px_16px_rgba(255,75,43,0.06)] scale-[1.02] border-[#FFE5E0]'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {/* Active dot indicator */}
                            {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF4B2B]"></div>}
                            
                            <span 
                                className={`material-symbols-outlined text-[28px] transition-transform duration-300 ${active ? '-translate-y-0.5' : ''}`} 
                                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {icon}
                            </span>
                            <span className="text-[11px] font-bold text-center px-1 leading-tight">{t(labelKey)}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings — pinned to bottom */}
            <div className="mt-auto pt-6 px-3 w-full flex justify-center border-t border-gray-100/50">
                <Link
                    href="/settings"
                    title={t('settings')}
                    className={`relative w-full h-[80px] flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 gap-1.5 border border-transparent ${
                        isActive('/settings')
                            ? 'bg-[#FFF2EF] text-[#FF4B2B] shadow-[0_8px_16px_rgba(255,75,43,0.06)] scale-[1.02] border-[#FFE5E0]'
                            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {isActive('/settings') && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF4B2B]"></div>}
                    <span 
                        className={`material-symbols-outlined text-[28px] transition-transform duration-300 ${isActive('/settings') ? 'rotate-90' : ''}`}
                        style={isActive('/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        settings
                    </span>
                    <span className="text-[11px] font-bold leading-tight">{t('settings')}</span>
                </Link>
            </div>
        </aside>
    );
}
