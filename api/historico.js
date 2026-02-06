import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    // Configuração de CORS para o seu domínio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Conectamos usando a variável que a Vercel criou automaticamente
    const client = createClient({
        url: process.env.REDIS_URL,
    });

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;
            
            // Busca dados existentes
            let data = await client.get('global_matches');
            let historico = [];

            if (data) {
                historico = typeof data === 'string' ? JSON.parse(data) : data;
            }

            // Adiciona o novo match e limita aos 5 últimos
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);
            
            // Salva no banco
            await client.set('global_matches', JSON.stringify(historico));
            
            return res.status(200).json({ success: true });
        } 

        if (req.method === 'GET') {
            const data = await client.get('global_matches');
            
            let historico = [];
            if (data) {
                historico = typeof data === 'string' ? JSON.parse(data) : data;
            }

            // Retorna os 3 primeiros para o slide
            return res.status(200).json(historico.slice(0, 3));
        }
    } catch (error) {
        console.error("Erro no Redis:", error);
        // Retornamos um array vazio em vez de erro 500 para o site não travar
        return res.status(200).json([]);
    }
}
