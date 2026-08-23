import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, getCookie, hashToken, sql } from '../_db.js';
export default async function handler(req: VercelRequest,res: VercelResponse){if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});const token=getCookie(req,'og_session');if(token)await sql`DELETE FROM sessions WHERE token_hash=${hashToken(token)}`;clearSessionCookie(res);return res.status(200).json({ok:true});}
