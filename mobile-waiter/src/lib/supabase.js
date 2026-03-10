import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase URL and Anon Key from .env.local
const SUPABASE_URL = 'https://qgaqkgnchdlrngymuvqx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYXFrZ25jaGRscm5neW11dnF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDIwMjYsImV4cCI6MjA4Nzk3ODAyNn0.5hRqpCZ7rrfTiSs-xmD-18PN5jAO2ElnkwlA4jUz19c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
