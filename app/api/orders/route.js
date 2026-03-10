import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Mock DB
if (!global.mockOrders) {
    global.mockOrders = [];
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let orders = [...global.mockOrders];

    if (!isDemoMode) {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (status === 'active') {
            query = query.neq('status', 'completed');
        }

        const { data, error } = await query;
        if (!error && data) {
            // Combine and prioritize database orders, but keep unique memory orders
            const dbIds = new Set(data.map(o => String(o.id)));
            const uniqueMemory = global.mockOrders.filter(o => !dbIds.has(String(o.id)));
            orders = [...data, ...uniqueMemory];
        }
    }

    if (status === 'active') {
        const activeOrders = orders.filter(o => o.status !== 'completed');
        if (activeOrders.length > 0) {
            console.log(`🔍 Polling: Returning ${activeOrders.length} active orders (${activeOrders.filter(o => String(o.id).includes('demo') || String(o.id).includes('fallback')).length} from memory)`);
        }
        return NextResponse.json(activeOrders);
    }

    return NextResponse.json(orders);
}

export async function PATCH(request) {
    try {
        const { id, status } = await request.json();

        // 1. Supabase Update (Cloud Mode)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id);

            if (!error) {
                return NextResponse.json({ success: true, message: 'Order updated (Cloud)' });
            }
            // If Supabase fails, or order doesn't exist, proceed to memory fallback
        }

        // 2. In-Memory Update (Demo Mode Fallback)
        if (global.mockOrders) {
            const index = global.mockOrders.findIndex(o => o.id === id);
            if (index !== -1) {
                global.mockOrders[index].status = status;
                return NextResponse.json({ success: true, message: 'Order updated (Memory)' });
            }
        }

        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    } catch (error) {
        return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const orderData = await request.json();
        console.log('🚀 Incoming Order from Mobile:', JSON.stringify(orderData, null, 2));

        // 1. Basic Validation
        if (!orderData.items || orderData.items.length === 0) {
            return NextResponse.json({ error: 'Invalid Order Data' }, { status: 400 });
        }

        const newOrderBase = {
            table_number: orderData.table,
            type: orderData.type || 'Dine-In',
            items: orderData.items,
            total_amount: orderData.total_amount || 0,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // 2. Check for Supabase Keys (Demo Mode Fallback)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase keys missing. Running in DEMO MODE.');

            // Store in Memory
            const newOrder = {
                ...newOrderBase,
                id: 'demo-' + Date.now() + Math.random().toString(36).substr(2, 9),
            };

            global.mockOrders.push(newOrder);

            return NextResponse.json({
                success: true,
                message: 'Order received (Demo Mode)',
                orderId: newOrder.id,
                note: 'Stored in-memory'
            });
        }

        // 3. Insert into Supabase 'orders' table
        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    table_number: orderData.table,
                    type: orderData.type || 'Dine-In',
                    items: orderData.items,
                    total_amount: orderData.total_amount || 0,
                    status: 'pending',
                    payment_method: orderData.payment_method || 'Cash',
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            // Fallback to demo success
            const fallbackOrder = {
                ...newOrderBase,
                id: 'fallback-' + Date.now(),
            };
            global.mockOrders.push(fallbackOrder);

            return NextResponse.json({
                success: true,
                message: 'Order received (Fallback Mode)',
                orderId: fallbackOrder.id
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Order received',
            orderId: data[0].id
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
