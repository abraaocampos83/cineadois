// api/cinema.js - Localizador Inteligente CineAdois

async function chamarGeminiCinema(prompt) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error("Erro na API");

        let textoResposta = data.candidates[0].content.parts[0].text;
        const inicioJSON = textoResposta.indexOf('{');
        const fimJSON = textoResposta.lastIndexOf('}');
        
        return JSON.parse(textoResposta.substring(inicioJSON, fimJSON + 1));
    } catch (e) {
        console.error("Falha no CinemaIA:", e);
        return null;
    }
}

const CinemaIA = {
    // Objeto local simples para capitais (não gasta IA e é instantâneo)
    capitais: {
        'AC': 'Rio Branco', 'AL': 'Maceió', 'AP': 'Macapá', 'AM': 'Manaus', 'BA': 'Salvador', 'CE': 'Fortaleza', 'DF': 'Brasília', 'ES': 'Vitória', 'GO': 'Goiânia', 'MA': 'São Luís', 'MT': 'Cuiabá', 'MS': 'Campo Grande', 'MG': 'Belo Horizonte', 'PA': 'Belém', 'PB': 'João Pessoa', 'PR': 'Curitiba', 'PE': 'Recife', 'PI': 'Teresina', 'RJ': 'Rio de Janeiro', 'RN': 'Natal', 'RS': 'Porto Alegre', 'RO': 'Porto Velho', 'RR': 'Boa Vista', 'SC': 'Florianópolis', 'SP': 'São Paulo', 'SE': 'Aracaju', 'TO': 'Palmas'
    },

    async buscarOutrasCidades(estado, capital) {
        const prompt = `Liste as principais cidades do estado ${estado} que possuem cinema, EXCETO a cidade de ${capital}.
        Responda APENAS um JSON:
        { "cidades": ["Cidade A", "Cidade B"] }`;
        const resultado = await chamarGeminiCinema(prompt);
        return resultado ? resultado.cidades : [];
    },

    async buscarCinemasLocal(cidade, estado) {
        const prompt = `Liste os nomes dos cinemas reais na cidade de ${cidade}, ${estado}.
        Responda APENAS um JSON:
        { "cinemas": ["Cinema X", "Cinema Y"] }`;
        const resultado = await chamarGeminiCinema(prompt);
        return resultado ? resultado.cinemas : [];
    }
};