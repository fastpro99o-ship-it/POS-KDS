import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${Date.now()}-${originalName}`;

        const { data, error } = await supabase.storage
            .from('menu-icons')
            .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage
            .from('menu-icons')
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
    }
}
