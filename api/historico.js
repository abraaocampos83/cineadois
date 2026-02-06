// api/historico.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Habilitar CORS para que o front-end consiga acessar
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body; // { busca: "...", filmes: [...] }
            
            // Pega a lista atual ou cria uma vazia
            let historico = await kv.get('global_matches') || [];
            
            // Adiciona no início e mantém os 5 últimos (por segurança)
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);
            
            await kv.set('global_matches', historico);
            return res.status(200).json({ success: true });
        } 

        if (req.method === 'GET') {
            const historico = await kv.get('global_matches') || [];
            return res.status(200).json(historico.slice(0, 3)); // Retorna os 3 últimos
        }
    } catch (error) {
        console.error("Erro no KV:", error);
        return res.status(500).json({ error: "Erro ao acessar banco de dados" });
    }
}