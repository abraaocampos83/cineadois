import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Cabeçalhos para evitar erros de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;
            
            // Tenta buscar o que já existe
            let historico = await kv.get('global_matches') || [];
            
            // Se por algum motivo o Redis retornar uma string, transformamos em array
            if (typeof historico === 'string') historico = JSON.parse(historico);

            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);
            
            // Salva de volta
            await kv.set('global_matches', historico);
            
            return res.status(200).json({ success: true });
        } 

        if (req.method === 'GET') {
            const data = await kv.get('global_matches') || [];
            const historico = typeof data === 'string' ? JSON.parse(data) : data;
            return res.status(200).json(historico.slice(0, 3));
        }
    } catch (error) {
        // Isso vai ajudar a ver o erro real nos logs da Vercel
        console.error("Erro na API CineAdois:", error);
        return res.status(500).json({ error: "Falha na conexão", details: error.message });
    }
}
