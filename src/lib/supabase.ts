import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Anon client — safe for both client and server */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Service-role client — bypasses RLS, server-only (lazy init) */
let _supabaseAdmin: SupabaseClient | null = null;
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        if (!_supabaseAdmin) {
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceKey) throw new Error("supabaseAdmin is server-only");
            _supabaseAdmin = createClient(supabaseUrl, serviceKey);
        }
        return (_supabaseAdmin as unknown as Record<string, unknown>)[prop as string];
    },
});
