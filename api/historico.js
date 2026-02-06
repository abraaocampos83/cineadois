export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const REDIS_REST_URL = "https://redis-11971.crce196.sa-east-1-2.ec2.cloud.redislabs.com:11971";
    const REDIS_REST_TOKEN = "427LEOBdvxBMLllMeoN9ioRvnFfwY351";

    try {
        // --- MÉTODO POST: GRAVAR NOVO MATCH ---
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // 1. Buscar histórico atual
            const responseGet = await fetch(`${REDIS_REST_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` }
            });
            const dataGet = await responseGet.json();
            
            let historico = [];
            // O Redis REST retorna o valor em dataGet.result
            if (dataGet.result) {
                try {
                    historico = JSON.parse(dataGet.result);
                } catch (e) {
                    historico = [];
                }
            }

            // 2. Adicionar o novo e limitar a 5
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // 3. Salvar de volta no Redis
            // CORREÇÃO AQUI: No Redis REST, o corpo deve ser a string direta do valor
            const valorParaSalvar = JSON.stringify(historico);

            const responseSet = await fetch(`${REDIS_REST_URL}/set/global_matches`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${REDIS_REST_TOKEN}`,
                    'Content-Type': 'text/plain' // Importante para o Redis Cloud
                },
                body: valorParaSalvar
            });

            const resultSet = await responseSet.json();
            return res.status(200).json({ success: true, debug: resultSet });
        }

        // --- MÉTODO GET: LER ÚLTIMOS MATCHES ---
        if (req.method === 'GET') {
            const response = await fetch(`${REDIS_REST_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` }
            });
            const data = await response.json();
            
            if (!data.result) {
                return res.status(200).json([]);
            }

            const historico = JSON.parse(data.result);
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API:", error);
        return res.status(200).json([]);
    }
}
