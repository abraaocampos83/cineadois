export default async function handler(req, res) {
    // Configurações de CORS para evitar bloqueios do navegador
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a pré-requisições do navegador
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Credenciais extraídas da sua REDIS_URL para conexão via REST
    const REDIS_REST_URL = "https://redis-11971.crce196.sa-east-1-2.ec2.cloud.redislabs.com:11971";
    const REDIS_REST_TOKEN = "427LEOBdvxBMLllMeoN9ioRvnFfwY351";

    try {
        // --- MÉTODO POST: GRAVAR NOVO MATCH ---
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // 1. Buscar histórico atual via Fetch (Nativo do Node.js)
            const responseGet = await fetch(`${REDIS_REST_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` }
            });
            const dataGet = await responseGet.json();
            
            let historico = [];
            if (dataGet.result) {
                historico = JSON.parse(dataGet.result);
            }

            // 2. Adicionar o novo e limitar a 5
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // 3. Salvar de volta no Redis
            await fetch(`${REDIS_REST_URL}/set/global_matches`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` },
                body: JSON.stringify(historico)
            });

            return res.status(200).json({ success: true });
        }

        // --- MÉTODO GET: LER ÚLTIMOS MATCHES ---
        if (req.method === 'GET') {
            const response = await fetch(`${REDIS_REST_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` }
            });
            const data = await response.json();
            
            const historico = data.result ? JSON.parse(data.result) : [];
            
            // Retorna os 3 primeiros para o slide da Home
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API:", error);
        // Em caso de qualquer erro, retornamos um array vazio para o site não travar
        return res.status(200).json([]);
    }
}
