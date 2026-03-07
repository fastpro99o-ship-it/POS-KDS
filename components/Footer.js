export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 py-3 px-6">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">System Online</span>
                    </div>
                    <div className="text-xs text-gray-400">Station: Kitchen Main</div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold transition-colors hover:bg-gray-200">
                        <span className="material-symbols-outlined text-sm">history</span>
                        Order History
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold transition-colors hover:bg-primary/20">
                        <span className="material-symbols-outlined text-sm">print</span>
                        Print All
                    </button>
                </div>
            </div>
        </footer>
    );
}
