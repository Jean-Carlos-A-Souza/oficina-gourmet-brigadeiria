import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { ensureSchema, hashToken, newSessionToken, setSessionCookie, sql } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  try {
    await ensureSchema();
    const { email, password } = req.body || {};
    const rows = await sql`SELECT id,name,email,password_hash FROM users WHERE email=${String(email || '').trim().toLowerCase()} LIMIT 1`;
    if (!rows.length || !(await bcrypt.compare(String(password || ''), rows[0].password_hash))) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    const token = newSessionToken();
    await sql`DELETE FROM sessions WHERE expires_at <= now()`;
    await sql`INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (${hashToken(token)},${rows[0].id},now() + interval '30 days')`;
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, user: { id: rows[0].id, name: rows[0].name, email: rows[0].email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível entrar.' });
  }
}
