// api/match.js - Versão Gemini 2.5 Flash

async function chamarGeminiMatch(prompt) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Erro na resposta da API");
        }

        let textoResposta = data.candidates[0].content.parts[0].text;

        // Limpeza: Captura apenas o que está entre as chaves { }
        const inicioJSON = textoResposta.indexOf('{');
        const fimJSON = textoResposta.lastIndexOf('}');
        
        if (inicioJSON === -1 || fimJSON === -1) {
            throw new Error("Formato de dados inválido.");
        }

        const jsonPuro = textoResposta.substring(inicioJSON, fimJSON + 1);
        return JSON.parse(jsonPuro);

    } catch (e) {
        console.error("Falha no MatchIA:", e);
        return null;
    }
}

const MatchIA = {
    async gerarSugestoes(generos, expectativa, filmesExcluir = []) {
        const listaExcluir = filmesExcluir.length > 0 
            ? `\nNÃO sugira: ${filmesExcluir.join(", ")}.` 
            : "";
        
        const prompt = `Aja como um curador de cinema para casais. Sugira 3 filmes REAIS.
        Gêneros: ${generos}. 
        Vibe: ${expectativa}.
        ${listaExcluir}

        Responda APENAS o JSON:
        {
          "sugestoes": [
            {
              "titulo_pt": "Título",
              "ano": "Ano",
              "motivo": "Por que assistir?",
              "sinopse": "Resumo.",
              "notas": {"imdb": "0.0", "rotten": "0%"}
            }
          ]
        }`;

        const resultado = await chamarGeminiMatch(prompt);

        if (!resultado || !resultado.sugestoes) return [];

        return resultado.sugestoes.map(f => ({
            ...f,
            link_streaming: `https://www.google.com/search?q=onde+assistir+${encodeURIComponent(f.titulo_pt)}+${f.ano}`
        }));
    }
};