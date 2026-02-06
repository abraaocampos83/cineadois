import Redis from 'ioredis';

// Cria a conexão fora do handler para reutilizá-la (performance)
const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'POST') {
            const novoMatch = req.body;

            // 1. LER (Usando comando nativo do Redis)
            const dadoBruto = await redis.get('global_matches');
            let historico = dadoBruto ? JSON.parse(dadoBruto) : [];

            // 2. ATUALIZAR
            historico.unshift(novoMatch);
            historico = historico.slice(0, 5);

            // 3. SALVAR
            await redis.set('global_matches', JSON.stringify(historico));

            return res.status(200).json({ success: true });
        }

        if (req.method === 'GET') {
            const dadoBruto = await redis.get('global_matches');
            const historico = dadoBruto ? JSON.parse(dadoBruto) : [];
            
            return res.status(200).json(historico.slice(0, 3));
        }

    } catch (error) {
        console.error("Erro no Redis:", error);
        return res.status(200).json([]);
    }
}
