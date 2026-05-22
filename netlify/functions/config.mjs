import { env, json } from "./_supabase.mjs";

export default async function handler() {
  return json({
    supabaseUrl: env("SUPABASE_URL"),
    supabaseAnonKey: env("SUPABASE_ANON_KEY"),
    adminEmail: env("ADMIN_EMAIL")
  });
}
