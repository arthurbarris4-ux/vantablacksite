import { json, requireAdmin } from "./_supabase.mjs";

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  const action = String(body.action || "").trim();
  const accessStatus = String(body.accessStatus || "").trim();
  const plan = String(body.plan || "").trim();

  if (!id) return json({ error: "ID do membro não informado." }, 400);

  if (action === "delete") {
    const { error: profileError } = await auth.supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) return json({ error: profileError.message }, 400);

    const { error: authError } = await auth.supabase.auth.admin.deleteUser(id);
    if (authError) {
      return json({
        ok: true,
        warning: "Perfil removido, mas o login do Supabase nao foi apagado automaticamente.",
        details: authError.message
      });
    }

    return json({ ok: true, deleted: true });
  }

  const patch = { updated_at: new Date().toISOString() };
  if (accessStatus) patch.access_status = accessStatus;
  if (plan) patch.plan = plan;

  const { data, error } = await auth.supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("id,email,full_name,company,plan,role,access_status,created_at,updated_at")
    .single();

  if (error) return json({ error: error.message }, 400);

  return json({ ok: true, member: data });
}
