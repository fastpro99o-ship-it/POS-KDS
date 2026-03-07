
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ خطأ: مفاتيح Supabase غير موجودة! تأكد من ملف .env.local وإعادة تشغيل السيرفر.');
} else {
    console.log('✅ تم العثور على مفاتيح Supabase، يتم الاتصال الآن...');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
