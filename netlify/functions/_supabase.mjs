import { createClient } from "@supabase/supabase-js";

export function env(name) {
  return process.env[name] || globalThis.Netlify?.env?.get?.(name) || "";
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function getAdminClient() {
  const url = env("SUPABASE_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are missing.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function requireAdmin(request) {
  const adminEmail = env("ADMIN_EMAIL").toLowerCase();
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (!adminEmail) {
    return { error: json({ error: "ADMIN_EMAIL is not configured." }, 500) };
  }

  if (!token) {
    return { error: json({ error: "Missing authorization token." }, 401) };
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return { error: json({ error: "Invalid session." }, 401) };
  }

  if ((data.user.email || "").toLowerCase() !== adminEmail) {
    return { error: json({ error: "Admin access required." }, 403) };
  }

  return { supabase, user: data.user, adminEmail };
}
