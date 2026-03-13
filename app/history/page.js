'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import Sidebar from '@/components/Sidebar';
import OrderHistory from '@/components/OrderHistory';
import { toast } from 'sonner';

export default function CashierHistoryPage() {
    const { t, dir } = useLanguage();
    const [orders, setOrders] = useState([]);
    
    // Fetch orders logic from local cache & via API
    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                
                // Add local offline-only items
                const saved = typeof window !== 'undefined'
                    ? JSON.parse(localStorage.getItem('kds_orders') || '[]')
                    : [];
                const apiIds = new Set(data.map(o => o.id));
                const localOnly = saved.filter(o =>
                    !apiIds.has(o.id) &&
                    (String(o.id).includes('offline') || String(o.id).includes('fallback'))
                );
                
                setOrders([...data, ...localOnly].sort((a,b) => {
                    const dtA = a.created_at ? new Date(a.created_at).getTime() : (a.startTime || 0);
                    const dtB = b.created_at ? new Date(b.created_at).getTime() : (b.startTime || 0);
                    return dtB - dtA; // Latest first
                }));
            }
        } catch (e) {
            console.error('Fetch orders error', e);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟ (Êtes-vous sûr de vouloir supprimer définitivement cette commande ?)')) return;
        
        try {
            // Check if it's purely a local/offline order
            if (String(id).includes('offline') || String(id).includes('fallback')) {
                const saved = JSON.parse(localStorage.getItem('kds_orders') || '[]');
                const updated = saved.filter(o => o.id !== id);
                localStorage.setItem('kds_orders', JSON.stringify(updated));
                toast.success('تم الحذف محلياً (Supprimé localement)');
                fetchOrders();
                return;
            }

            // Otherwise, delete via REST API
            const res = await fetch('/api/orders', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });

            if (res.ok) {
                toast.success('تم حذف الطلب بنجاح (Commande supprimée)');
                fetchOrders();
            } else {
                toast.error('حدث خطأ أثناء الحذف (Erreur lors de la suppression)');
            }
        } catch(e) {
            toast.error('حدث خطأ أثناء الاتصال بالخادم (Erreur de connexion)');
        }
    }

    const handlePrint = (order) => {
        toast.info('جاري الطباعة للطلب #' + order.id.toString().slice(-6));
        
        // simple print view
        const printWindow = window.open('', '_blank');
        const itemsHtml = (order.items || []).map(i => `
            <tr>
                <td style="padding: 5px 0; text-align: left;">${i.qty}x ${i.name}</td>
                <td style="padding: 5px 0; text-align: right;">${i.price} DH</td>
            </tr>
        `).join('');
        
        const type = order.type || 'Dine-In';
        const table = order.table_number || order.table || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Ticket #${order.id.toString().slice(-6)}</title>
                    <style>
                        @media print {
                            @page { margin: 0; }
                            body { margin: 10px; }
                        }
                        body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 10px; text-align: center; max-width: 300px; margin: 0 auto; color: #000; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
                        th { border-bottom: 1px dashed #000; padding: 5px 0; text-align: center; }
                        td { padding: 5px 0; font-size: 13px; font-weight: bold; }
                        .total { font-weight: bold; font-size: 18px; border-top: 1px dashed #000; padding-top: 10px; }
                        h2 { margin: 5px 0; font-size: 22px; font-weight: 900; }
                        h3 { margin: 0px 0 10px 0; font-size: 16px; color: #222; }
                    </style>
                </head>
                <body>
                    <h2>Paris Food</h2>
                    <h3>TICKET #${order.id.toString().slice(-6)}</h3>
                    <p style="margin:0; font-size:12px;">${new Date().toLocaleString('fr-FR')}</p>
                    <p style="font-weight:900; font-size:16px; margin: 10px 0;">${type} ${table ? ' - Table ' + table : ''}</p>
                    <div style="border-top: 2px solid #000; margin-top: 10px;"></div>
                    <table>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="total">Total: ${Number(order.total_amount || 0).toFixed(2)} DH</div>
                    <p style="margin-top:20px; font-size: 12px;">Merci de votre visite !</p>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }

    return (
        <div className="flex h-screen bg-[#F5F6FA] text-black overflow-hidden font-sans" dir={dir}>
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FDFDFD]">
                <header className="h-[88px] shrink-0 px-8 flex items-center justify-between bg-white border-b border-[#E8ECEF]">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1a1a1a]">{t('history')}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">إدارة الطلبات، الطباعة والإلغاء · Gestion des commandes, Impression et Annulation</p>
                    </div>
                </header>
                
                <div className="flex-1 overflow-y-auto p-8">
                    <OrderHistory orders={orders} onPrint={handlePrint} onDelete={handleDelete} />
                </div>
            </main>
        </div>
    );
}
