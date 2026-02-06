import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Criamos o cliente usando explicitamente a sua variável REDIS_URL
    const kv = createClient({
        url: process.env.REDIS_URL,
    });

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;
            let historico = await kv.get('global_matches') || [];
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);
            await kv.set('global_matches', JSON.stringify(historico)); // Garantimos que salve como string
            return res.status(200).json({ success: true });
        } 

        if (req.method === 'GET') {
            const data = await kv.get('global_matches');
            // Se os dados voltarem como string (comum no Redis), transformamos em objeto
            const historico = typeof data === 'string' ? JSON.parse(data) : (data || []);
            return res.status(200).json(historico.slice(0, 3));
        }
    } catch (error) {
        console.error("Erro detalhado:", error);
        return res.status(500).json({ error: "Erro de conexão", detalhes: error.message });
    }
}
