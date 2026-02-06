import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Configuração de CORS para permitir acesso do seu front-end
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde rapidamente a requisições de pre-flight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // --- MÉTODO POST: SALVA UM NOVO MATCH ---
        if (req.method === 'POST') {
            const novoMatch = req.body; // Espera { busca: "...", filmes: [...] }

            if (!novoMatch.busca || !novoMatch.filmes) {
                return res.status(400).json({ error: "Dados incompletos" });
            }

            // Busca o histórico atual
            let historico = await kv.get('global_matches') || [];
            
            // Adiciona o novo no início da lista
            historico.unshift(novoMatch);
            
            // Mantém apenas os 5 últimos para otimizar o slide
            historico = historico.slice(0, 5);
            
            // Salva de volta no Redis
            await kv.set('global_matches', historico);
            
            return res.status(200).json({ success: true });
        } 

        // --- MÉTODO GET: RETORNA OS ÚLTIMOS MATCHES ---
        if (req.method === 'GET') {
            const historico = await kv.get('global_matches') || [];
            // Retorna apenas os 3 primeiros para o slide da Home
            return res.status(200).json(historico.slice(0, 3));
        }

        // Caso usem outro método
        return res.status(405).json({ error: "Método não permitido" });

    } catch (error) {
        console.error("Erro no servidor KV:", error);
        return res.status(500).json({ error: "Erro interno no banco de dados" });
    }
}
