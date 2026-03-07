'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
    { href: '/', label: 'KDS', icon: 'display_settings' },
    { href: '/order', label: 'New Order', icon: 'add_shopping_cart' },
    { href: '/admin', label: 'Admin', icon: 'admin_panel_settings' },
];

export default function Header() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Init dark mode
        const saved = localStorage.getItem('kds_theme');
        const wantsDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(wantsDark);
        if (wantsDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const next = !prev;
            if (next) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            localStorage.setItem('kds_theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg sm:text-xl">restaurant_menu</span>
                    </div>
                    <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate max-w-[80px] sm:max-w-none">Kitchen System</h1>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-0.5 sm:gap-1 overflow-hidden">
                    {navLinks.map(({ href, label, icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
                                <span className="hidden sm:block">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active</span>
                            <span className="text-lg font-bold text-primary">Live</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Online</span>
                        </div>
                    </div>
                    <button onClick={toggleTheme} title="تغيير المظهر" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
