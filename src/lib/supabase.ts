import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crlduukuhevovagorsce.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8GOvehpBBclunyNLlW5lSA_TXWoGSV3';

// Supabase anahtarları girilmişse istemciyi başlat, girilmemişse null döndür (mock fallback için)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
