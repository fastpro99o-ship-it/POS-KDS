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

    if (!isDemoMode) {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (status === 'active') {
            query = query.neq('status', 'completed');
        }

        const { data, error } = await query;
        if (!error && data) {
            return NextResponse.json(data);
        }
        // Fallback to mock on error
    }

    if (status === 'active') {
        const activeOrders = global.mockOrders.filter(o => o.status !== 'completed');
        return NextResponse.json(activeOrders);
    }

    return NextResponse.json(global.mockOrders || []);
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

        // 1. Basic Validation
        if (!orderData.items || orderData.items.length === 0) {
            return NextResponse.json({ error: 'Invalid Order Data' }, { status: 400 });
        }

        // 2. Check for Supabase Keys (Demo Mode Fallback)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Supabase keys missing. Running in DEMO MODE.');

            // Store in Memory
            const newOrder = {
                id: 'demo-' + Date.now() + Math.random().toString(36).substr(2, 9),
                table_number: orderData.table,
                type: orderData.type || 'Dine-In',
                items: orderData.items,
                status: 'pending',
                created_at: new Date().toISOString()
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
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            // Fallback to demo success if table doesn't exist
            const fallbackOrder = {
                id: 'fallback-' + Date.now(),
                table_number: orderData.table,
                type: orderData.type || 'Dine-In',
                items: orderData.items,
                status: 'pending',
                created_at: new Date().toISOString()
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
