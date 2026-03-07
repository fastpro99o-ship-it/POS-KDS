import { Inter } from 'next/font/google'
import { Toaster } from 'sonner';
import './globals.css'

import ConnectionLostOverlay from '@/components/ConnectionLostOverlay';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'KDS Active Orders View',
    description: 'Kitchen Display System',
    manifest: '/manifest.json',
    themeColor: '#111318',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.className} bg-background-light dark:bg-background-dark text-[#111318] dark:text-gray-100 min-h-screen`}>
                {children}
                <ConnectionLostOverlay />
                <Toaster position="bottom-right" richColors />
            </body>
        </html>
    )
}
