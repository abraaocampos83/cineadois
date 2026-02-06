export default async function handler(req, res) {
    // Cabeçalhos de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. Extração das credenciais da sua variável REDIS_URL
    // Formato: redis://default:SENHA@HOST:PORTA
    const redisUrlRaw = process.env.REDIS_URL; 
    
    if (!redisUrlRaw) {
        console.error("Erro: Variável REDIS_URL não encontrada.");
        return res.status(500).json({ error: "Configuração ausente" });
    }

    // Limpeza da URL para extrair HOST, PORTA e SENHA
    const parts = redisUrlRaw.replace('redis://', '').split(/[:@]/);
    // [0] = default, [1] = senha, [2] = host, [3] = porta
    const password = parts[1];
    const host = parts[2];
    const port = parts[3];

    // URL formatada para a API REST do Redis Cloud
    const REDIS_REST_API = `https://:${password}@${host}:${port}`;

    try {
        // --- MÉTODO POST: GRAVAR ---
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // Busca histórico atual
            const responseGet = await fetch(`${REDIS_REST_API}/GET/global_matches`);
            const dataGet = await responseGet.json();
            
            let historico = [];
            // O Redis Cloud retorna o valor na chave do comando (GET)
            if (dataGet.GET) {
                try {
                    historico = JSON.parse(dataGet.GET);
                } catch (e) { historico = []; }
            }

            // Adiciona e limita a 5
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // Salva de volta
            await fetch(`${REDIS_REST_API}/SET/global_matches`, {
                method: 'POST',
                body: JSON.stringify(historico)
            });

            return res.status(200).json({ success: true });
        }

        // --- MÉTODO GET: LER ---
        if (req.method === 'GET') {
            const response = await fetch(`${REDIS_REST_API}/GET/global_matches`);
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
