import { env, json, requireAdmin } from "./_supabase.mjs";

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const company = String(body.company || "").trim();
  const plan = String(body.plan || "Vanta Core").trim();
  const siteUrl = env("URL") || env("DEPLOY_PRIME_URL") || "https://vantablack.netlify.app";

  if (!email || !email.includes("@")) {
    return json({ error: "Informe um e-mail válido." }, 400);
  }

  const { data, error } = await auth.supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      company,
      plan,
      access_status: "active"
    },
    redirectTo: `${siteUrl.replace(/\/$/, "")}/membros.html`
  });

  if (error) {
    return json({ error: error.message }, 400);
  }

  const user = data?.user;
  if (user?.id) {
    const { error: profileError } = await auth.supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email,
        full_name: fullName,
        company,
        plan,
        access_status: "active",
        role: "member",
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      return json({ error: profileError.message }, 400);
    }
  }

  return json({
    ok: true,
    message: "Convite enviado e acesso liberado.",
    userId: user?.id || null
  });
}
