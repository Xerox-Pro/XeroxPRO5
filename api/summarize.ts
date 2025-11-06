
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Allow', ['GET']);
    return res.status(410).json({ error: 'AI要約機能は削除されました。' });
}
