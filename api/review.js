// api/review.js - Analista de Filmes CineAdois
async function chamarGeminiReview(prompt) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error("Erro na API do Google");

        let textoResposta = data.candidates[0].content.parts[0].text;

        // Limpeza de segurança para isolar o JSON
        const inicioJSON = textoResposta.indexOf('{');
        const fimJSON = textoResposta.lastIndexOf('}');
        if (inicioJSON === -1 || fimJSON === -1) throw new Error("Formato JSON inválido");

        const jsonLimpo = textoResposta.substring(inicioJSON, fimJSON + 1);
        return JSON.parse(jsonLimpo);
    } catch (e) {
        console.error("Falha no ReviewIA:", e);
        return null;
    }
}

const ReviewIA = {
    async buscarReview(nomeFilme) {
        const prompt = `Aja como um crítico de cinema profissional. Analise o filme: "${nomeFilme}".
        Responda APENAS um objeto JSON com este formato exato:
        {
          "titulo": "Título Original",
          "ano": "Ano",
          "diretor": "Nome do Diretor",
          "notas": {
            "imdb": "Nota/10",
            "rotten": "0%",
            "meta": "0"
          },
          "consenso": "Resumo do que a crítica achou em uma frase.",
          "sinopse": "Resumo da trama SEM SPOILERS."
        }`;

        const resultado = await chamarGeminiReview(prompt);
        if (!resultado) throw new Error("Não foi possível obter a análise.");

        return {
            ...resultado,
            link_critica: `https://www.google.com/search?q=critica+do+filme+${encodeURIComponent(resultado.titulo)}`
        };
    }
};