export default function StationFilters() {
    return (
        <div className="mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-8">
                <a className="flex items-center justify-center border-b-[3px] border-primary text-primary pb-3 font-bold text-sm tracking-wide" href="#">
                    ALL STATIONS
                </a>
                <a className="flex items-center justify-center border-b-[3px] border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 pb-3 font-bold text-sm tracking-wide transition-colors" href="#">
                    GRILL
                </a>
                <a className="flex items-center justify-center border-b-[3px] border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 pb-3 font-bold text-sm tracking-wide transition-colors" href="#">
                    SALADS
                </a>
                <a className="flex items-center justify-center border-b-[3px] border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 pb-3 font-bold text-sm tracking-wide transition-colors" href="#">
                    APPETIZER
                </a>
            </div>
        </div>
    );
}
