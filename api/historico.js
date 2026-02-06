export default async function handler(req, res) {
    // 1. Configurações de CORS para permitir o acesso do seu site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. Dados do seu Upstash (Baseado no seu Quickstart)
    const UPSTASH_URL = "https://communal-fox-48020.upstash.io";
    const UPSTASH_TOKEN = "AbuUAAIncDJlYThjZDM1OTUyYzE0OGRiOGE5MzY3YTZkOGIzMTE4NnAyNDgwMjA";

    try {
        // --- MÉTODO POST: GRAVAR NOVO MATCH ---
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // Busca o histórico atual
            const responseGet = await fetch(`${UPSTASH_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
            });
            const dataGet = await responseGet.json();
            
            let historico = [];
            if (dataGet.result) {
                // O Upstash retorna o valor como string dentro de .result
                historico = JSON.parse(dataGet.result);
            }

            // Adiciona o novo no topo e mantém apenas 5
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // Salva de volta no Upstash
            await fetch(`${UPSTASH_URL}/set/global_matches`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
                body: JSON.stringify(historico)
            });

            return res.status(200).json({ success: true });
        }

        // --- MÉTODO GET: LER MATCHES ---
        if (req.method === 'GET') {
            const response = await fetch(`${UPSTASH_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
            });
            const data = await response.json();
            
            const historico = data.result ? JSON.parse(data.result) : [];
            
            // Retorna os 3 primeiros para o slide da Home
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API Upstash:", error);
        return res.status(200).json([]);
    }
}
