import { neon } from '@neondatabase/serverless';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL não configurada');
export const sql = neon(connectionString);

let schemaReady = false;
export async function ensureSchema() {
  if (schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS sessions (
    token_hash text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS flavors (
    id text PRIMARY KEY,
    name text NOT NULL,
    base_price numeric(10,2) NOT NULL CHECK (base_price >= 0),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS flavor_tiers (
    id text PRIMARY KEY,
    flavor_id text NOT NULL REFERENCES flavors(id) ON DELETE CASCADE,
    min_qty integer NOT NULL CHECK (min_qty > 0),
    unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
    UNIQUE(flavor_id, min_qty)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS quotes (
    id text PRIMARY KEY,
    client text NOT NULL,
    event_type text,
    event_date date,
    status text NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho','Enviado','Fechado','Recusado','Cancelado')),
    total numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS quote_items (
    id text PRIMARY KEY,
    quote_id text NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    flavor_id text REFERENCES flavors(id) ON DELETE SET NULL,
    flavor_name text NOT NULL,
    qty integer NOT NULL CHECK (qty > 0),
    unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0)
  )`;
  schemaReady = true;
}

export const makeId = () => randomUUID();
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const newSessionToken = () => randomBytes(32).toString('hex');

export function getCookie(req: VercelRequest, name: string) {
  const raw = req.headers.cookie || '';
  const entry = raw.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export function setSessionCookie(res: VercelResponse, token: string, maxAge = 60 * 60 * 24 * 30) {
  res.setHeader('Set-Cookie', `og_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', 'og_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
}

export async function requireUser(req: VercelRequest, res: VercelResponse) {
  await ensureSchema();
  const token = getCookie(req, 'og_session');
  if (!token) { res.status(401).json({ error: 'Não autenticado' }); return null; }
  const tokenHash = hashToken(token);
  const rows = await sql`
    SELECT u.id, u.name, u.email
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now()
    LIMIT 1
  `;
  if (!rows.length) { clearSessionCookie(res); res.status(401).json({ error: 'Sessão expirada' }); return null; }
  return rows[0] as { id: string; name: string; email: string };
}
