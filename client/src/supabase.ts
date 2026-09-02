import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY. See client/.env.example.'
  );
}

export const supabase = createClient(url, anonKey);
