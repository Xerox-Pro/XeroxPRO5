
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Allow', ['POST']);
    return res.status(410).json({ error: 'AIアシスタント機能は削除されました。' });
}
