import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Debug: in development, print the Supabase URL (and mask the anon key) so we can verify the app is pointed
// to the expected project. Remove or guard this further for production.
if (process.env.NODE_ENV !== 'production') {
	try {
		const maskedKey = supabaseAnonKey ? `${String(supabaseAnonKey).slice(0,8)}...` : null;
		// eslint-disable-next-line no-console
		console.info('supabase client configured', { supabaseUrl, supabaseAnonKey: maskedKey });
	} catch {}
}
