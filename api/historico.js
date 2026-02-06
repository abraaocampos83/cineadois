import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Configuração manual usando a sua REDIS_URL que já funciona
    const client = createClient({
        url: process.env.REDIS_URL,
    });

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;
            let historico = await client.get('global_matches') || [];
            
            if (typeof historico === 'string') historico = JSON.parse(historico);
            
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);
            
            await client.set('global_matches', JSON.stringify(historico));
            return res.status(200).json({ success: true });
        } 

        if (req.method === 'GET') {
            const data = await client.get('global_matches');
            const historico = typeof data === 'string' ? JSON.parse(data) : (data || []);
            return res.status(200).json(historico.slice(0, 3));
        }
    } catch (error) {
        return res.status(500).json({ error: "Erro de conexão direto", details: error.message });
    }
}
