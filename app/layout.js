import { Inter, Poppins } from 'next/font/google'
import { Toaster } from 'sonner';
import './globals.css'

import ConnectionLostOverlay from '@/components/ConnectionLostOverlay';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-poppins' })

export const metadata = {
    title: 'POS & KDS System',
    description: 'Modern Wagba-Style POS',
    manifest: '/manifest.json',
    themeColor: '#FF7A00',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} ${poppins.variable} font-sans bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen selection:bg-primary-light selection:text-primary`}>
                {children}
                <ConnectionLostOverlay />
                <Toaster position="bottom-right" richColors />
            </body>
        </html>
    )
}
