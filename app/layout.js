import { Inter, Poppins } from 'next/font/google'
import { Toaster } from 'sonner';
import './globals.css'
import ConnectionLostOverlay from '@/components/ConnectionLostOverlay';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-poppins' })

export const metadata = {
    title: 'Paris Food POS',
    description: 'Système POS & KDS - Paris Food',
    manifest: '/manifest.json',
    themeColor: '#FF4B2B',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} ${poppins.variable} font-sans bg-background-light text-text-main min-h-screen`}>
                <Providers>
                    {children}
                    <ConnectionLostOverlay />
                    <Toaster position="bottom-right" richColors />
                </Providers>
            </body>
        </html>
    )
}
