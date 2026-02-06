export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const UPSTASH_URL = "https://communal-fox-48020.upstash.io";
    const UPSTASH_TOKEN = "AbuUAAIncDJlYThjZDM1OTUyYzE0OGRiOGE5MzY3YTZkOGIzMTE4NnAyNDgwMjA";

    // --- FILTRO DE SEGURANÇA ---
    const listaNegra = ["palavrao1", "ofensa2", "spam3"]; // Adicione aqui os termos que deseja bloquear

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // Validar se a busca contém termos bloqueados
            const textoBusca = novoMatch.busca.toLowerCase();
            const ehImproprio = listaNegra.some(termo => textoBusca.includes(termo));

            if (ehImproprio) {
                return res.status(200).json({ success: false, message: "Conteúdo filtrado" });
            }

            const responseGet = await fetch(`${UPSTASH_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
            });
            const dataGet = await responseGet.json();
            
            let historico = dataGet.result ? JSON.parse(dataGet.result) : [];
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            await fetch(`${UPSTASH_URL}/set/global_matches`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
                body: JSON.stringify(historico)
            });

            return res.status(200).json({ success: true });
        }

        if (req.method === 'GET') {
            const response = await fetch(`${UPSTASH_URL}/get/global_matches`, {
                headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
            });
            const data = await response.json();
            const historico = data.result ? JSON.parse(data.result) : [];
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro na API:", error);
        return res.status(200).json([]);
    }
}
