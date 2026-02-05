// api/gemini.js - Versão Protegida (Cache + Identificação)
export default async function handler(req, res) {
    const API_KEY = process.env.CINE_GEMINI_KEY;
    const MODELO = "gemini-2.5-flash"; 
    
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${API_KEY}`;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Método não permitido" });
    }

    try {
        // Identificação básica do IP (para monitoramento nos logs da Vercel)
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(`Requisição CineAdois - IP: ${userIp}`);

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Erro na API do Google:", data);
            return res.status(response.status).json(data);
        }

        // --- ALTERAÇÃO PROPOSTA: CACHE INTELIGENTE ---
        // s-maxage=3600: A Vercel guarda a resposta por 1 hora.
        // stale-while-revalidate: Garante que o app nunca fique "travado" esperando a IA
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}