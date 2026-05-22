# Area de membros Vanta Black

Este MVP usa:

- Netlify para hospedar o site e as funcoes.
- Supabase Auth para login de admin e membros.
- Supabase Database para guardar clientes liberados.
- Painel admin em `admin.html`.
- Area de membros em `membros.html`.

## 1. Criar projeto Supabase

1. Acesse https://supabase.com
2. Crie um projeto.
3. Em **SQL Editor**, cole e execute o conteudo de `supabase-schema.sql`.

## 2. Criar usuario admin

1. No Supabase, va em **Authentication > Users**.
2. Crie o usuario com seu e-mail de administrador.
3. Defina uma senha forte.
4. Depois rode no SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'arthurbarris4@gmail.com';
```

Importante: a senha nao fica no codigo do site.

## 3. Configurar variaveis na Netlify

No projeto da Netlify, va em:

**Project configuration > Environment variables**

Adicione:

```txt
SUPABASE_URL=cole_a_project_url_do_supabase
SUPABASE_ANON_KEY=cole_a_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key
ADMIN_EMAIL=arthurbarris4@gmail.com
```

Onde encontrar:

- `SUPABASE_URL`: Supabase > Project Settings > API > Project URL
- `SUPABASE_ANON_KEY`: Supabase > Project Settings > API > anon public
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase > Project Settings > API > service_role

Nunca coloque a `SUPABASE_SERVICE_ROLE_KEY` dentro de HTML. Ela fica somente nas variaveis da Netlify.

## 4. Como liberar um cliente

1. Entre em `https://seusite.netlify.app/admin.html`
2. Faca login com seu e-mail admin.
3. Preencha e-mail, nome, empresa e plano.
4. Clique em **Liberar acesso**.
5. O Supabase envia o e-mail de convite para o cliente criar acesso.

## 5. Como o cliente acessa

O cliente entra em:

```txt
https://seusite.netlify.app/membros.html
```

Se o acesso estiver ativo, ele ve o dashboard premium.
