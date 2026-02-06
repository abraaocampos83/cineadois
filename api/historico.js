export default async function handler(req, res) {
    // Cabeçalhos CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // --- CONFIGURAÇÃO ---
    // Importante: No Redis Labs, a API REST usa o formato "https://:senha@host:porta/comando"
    const PORT = "11971";
    const HOST = "redis-11971.crce196.sa-east-1-2.ec2.cloud.redislabs.com";
    const PASS = "427LEOBdvxBMLllMeoN9ioRvnFfwY351";
    
    // URL formatada para o Redis Labs REST API
    const BASE_URL = `https://:${PASS}@${HOST}:${PORT}`;

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // 1. Tentar buscar o histórico
            const resGet = await fetch(`${BASE_URL}/GET/global_matches`);
            const dataGet = await resGet.json();
            
            let historico = [];
            // O Redis Labs costuma retornar { GET: "string_do_valor" } ou { result: "string" }
            const valorBruto = dataGet.GET || dataGet.result;
            
            if (valorBruto) {
                try {
                    historico = JSON.parse(valorBruto);
                } catch (e) { historico = []; }
            }

            // 2. Adicionar e limitar
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // 3. Salvar (No Redis Labs REST, o valor vai na URL ou como corpo simples)
            const valorParaSalvar = JSON.stringify(historico);
            
            // Usando o endpoint de comando direto do Redis Labs
            await fetch(`${BASE_URL}/SET/global_matches`, {
                method: 'POST',
                body: valorParaSalvar
            });

            return res.status(200).json({ success: true });
        }

        if (req.method === 'GET') {
            const resGet = await fetch(`${BASE_URL}/GET/global_matches`);
            const dataGet = await resGet.json();
            
            const valorBruto = dataGet.GET || dataGet.result;
            const historico = valorBruto ? JSON.parse(valorBruto) : [];
            
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API:", error);
        // Se der erro de conexão, retornamos um dado fake para você ver se o layout está ok
        return res.status(200).json([{
            busca: "Erro de Conexão",
            filmes: ["Verifique as credenciais do Redis"]
        }]);
    }
}
