import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env."
  );
}

const safeUrl = supabaseUrl || "https://example.supabase.co";
const safeAnonKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-placeholder"
;

export const supabase = createClient(safeUrl, safeAnonKey);
