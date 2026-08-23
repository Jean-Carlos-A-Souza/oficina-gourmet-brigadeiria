import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, getCookie, hashToken, sql } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  try {
    await ensureSchema();
    const users = await sql`SELECT count(*)::int AS count FROM users`;
    const token = getCookie(req, 'og_session');
    if (!token) return res.status(200).json({ authenticated: false, hasUser: users[0].count > 0 });
    const rows = await sql`
      SELECT u.id, u.name, u.email FROM sessions s
      JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=${hashToken(token)} AND s.expires_at > now()
      LIMIT 1
    `;
    return res.status(200).json({ authenticated: rows.length > 0, hasUser: users[0].count > 0, user: rows[0] || null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível conectar ao banco.' });
  }
}
