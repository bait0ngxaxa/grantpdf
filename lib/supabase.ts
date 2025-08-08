// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// For client-side (browser) and server-side (API Routes, Server Components)
// This client uses the 'anon' key and is suitable for public actions or actions
// that will be authorized by Row Level Security (RLS) policies.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side only operations that require elevated privileges (e.g., in API Routes)
// This client uses the 'service_role' key and bypasses RLS.
// Use with extreme caution and ONLY on the server.
const supabaseServiceRoleUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseServiceRoleUrl, supabaseServiceRoleKey);
