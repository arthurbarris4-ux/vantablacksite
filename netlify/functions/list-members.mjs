import { json, requireAdmin } from "./_supabase.mjs";

export default async function handler(request) {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed." }, 405);
  }

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id,email,full_name,company,plan,role,access_status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 400);

  return json({ members: data || [] });
}
