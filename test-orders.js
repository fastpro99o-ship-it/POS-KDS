
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Connecting to:', supabaseUrl);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        console.log('Recent Orders:', JSON.stringify(data, null, 2));
    }
}

check();
