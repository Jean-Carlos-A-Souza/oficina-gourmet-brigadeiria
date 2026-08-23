import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { ensureSchema, hashToken, makeId, newSessionToken, setSessionCookie, sql } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  try {
    await ensureSchema();
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || String(password).length < 8) {
      return res.status(400).json({ error: 'Informe nome, e-mail e senha com pelo menos 8 caracteres.' });
    }
    const existing = await sql`SELECT count(*)::int AS count FROM users`;
    if (existing[0].count > 0) return res.status(409).json({ error: 'O usuário administrador já foi criado.' });

    const id = makeId();
    const passwordHash = await bcrypt.hash(String(password), 12);
    await sql`INSERT INTO users (id,name,email,password_hash) VALUES (${id},${String(name).trim()},${String(email).trim().toLowerCase()},${passwordHash})`;

    const token = newSessionToken();
    const tokenHash = hashToken(token);
    await sql`INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (${tokenHash},${id},now() + interval '30 days')`;
    setSessionCookie(res, token);
    return res.status(201).json({ ok: true, user: { id, name: String(name).trim(), email: String(email).trim().toLowerCase() } });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível criar o acesso inicial.' });
  }
}
