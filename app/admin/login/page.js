'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setTimeout(() => {
            if (login(password)) {
                router.push('/admin');
            } else {
                setError('كلمة المرور غير صحيحة');
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 mb-4">
                        <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">تسجيل الدخول للوحة التحكم</p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-8 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                            <input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="أدخل كلمة المرور"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">error</span>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                جاري التحقق...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                دخول
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
                        🔐 هذه الصفحة مخصصة للمدير فقط
                    </p>
                </form>
            </div>
        </div>
    );
}
