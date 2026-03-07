import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KitchenDisplay from '@/components/KitchenDisplay';

export default function Home() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto p-6 pb-32">
                <KitchenDisplay />
            </main>
            <Footer />
        </>
    );
}
