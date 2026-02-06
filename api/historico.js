export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const redisUrlRaw = process.env.REDIS_URL; 
    if (!redisUrlRaw) return res.status(500).json({ error: "REDIS_URL ausente" });

    // 1. Extrair os dados da URL manualmente para evitar o erro de credenciais
    const parts = redisUrlRaw.replace('redis://', '').split(/[:@]/);
    const password = parts[1];
    const host = parts[2];
    const port = parts[3];

    // URL Limpa (sem a senha nela)
    const CLEAN_URL = `https://${host}:${port}`;
    
    // Criar o Header de Autenticação (Basic Auth)
    // O Redis Labs espera "default:sua_senha" em Base64
    const authHeader = `Basic ${Buffer.from(`default:${password}`).toString('base64')}`;

    try {
        // --- MÉTODO POST ---
        if (req.method === 'POST') {
            const novoMatch = req.body;

            const responseGet = await fetch(`${CLEAN_URL}/GET/global_matches`, {
                headers: { Authorization: authHeader }
            });
            const dataGet = await responseGet.json();
            
            let historico = [];
            const valorBruto = dataGet.GET || dataGet.result;
            if (valorBruto) {
                try { historico = JSON.parse(valorBruto); } catch (e) { historico = []; }
            }

            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            await fetch(`${CLEAN_URL}/SET/global_matches`, {
                method: 'POST',
                headers: { Authorization: authHeader },
                body: JSON.stringify(historico)
            });

            return res.status(200).json({ success: true });
        }

        // --- MÉTODO GET ---
        if (req.method === 'GET') {
            const response = await fetch(`${CLEAN_URL}/GET/global_matches`, {
                headers: { Authorization: authHeader }
            });
            const data = await response.json();
            
            const valorBruto = data.GET || data.result;
            const historico = valorBruto ? JSON.parse(valorBruto) : [];
            
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API:", error);
        return res.status(200).json([]);
    }
}
