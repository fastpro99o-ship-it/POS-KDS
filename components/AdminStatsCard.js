export default function AdminStatsCard({ title, value, subtitle, icon, color = 'blue' }) {
    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    };
    const borderMap = {
        blue: 'border-blue-200 dark:border-blue-800',
        green: 'border-green-200 dark:border-green-800',
        orange: 'border-orange-200 dark:border-orange-800',
        purple: 'border-purple-200 dark:border-purple-800',
    };

    return (
        <div className={`bg-white dark:bg-gray-800/50 rounded-xl border ${borderMap[color]} p-5 flex items-center gap-4 shadow-sm`}>
            <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}
