// ============================================================================
// ClickMultiShop - Função Serverless: Calcular Frete (Melhor Envio)
// ============================================================================
// Esta função fica no servidor (Netlify) e esconde o seu Token de frete.
// O site chama ela via: POST /api/calcularFrete
// ============================================================================

exports.handler = async function (event, context) {

    // Apenas aceita requisições POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método não permitido. Use POST.' })
        };
    }

    //  Pega o Token de uma variável de ambiente secreta (configurada no Netlify)
    const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
    if (!MELHOR_ENVIO_TOKEN) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Token do Melhor Envio não configurado no servidor.' })
        };
    }

    // Desestrutura o corpo da requisição vinda do site
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Corpo da requisição inválido (JSON malformado).' })
        };
    }

    const { cep_destino, produtos } = requestBody;

    // Valida se os dados básicos foram enviados
    if (!cep_destino || !produtos || produtos.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Dados incompletos: cep_destino e produtos são obrigatórios.' })
        };
    }

    // CEP de origem da loja (onde os pacotes serão postados)
    // TODO: Altere para o CEP real da loja antes de ir ao ar
    const CEP_ORIGEM = process.env.CEP_ORIGEM || '01310-100';

    // Monta o corpo da requisição para a API do Melhor Envio
    // A API espera os produtos no formato abaixo
    const payload = {
        from: { postal_code: CEP_ORIGEM.replace(/\D/g, '') },
        to: { postal_code: cep_destino.replace(/\D/g, '') },
        products: produtos.map(p => ({
            id: String(p.id),
            width: p.width || 20,
            height: p.height || 15,
            length: p.length || 25,
            weight: p.weight || 0.5,
            insurance_value: parseFloat(String(p.price).replace(',', '.')) || 0,
            quantity: p.quantity || 1
        })),
        options: {
            receipt: false,
            own_hand: false
        }
    };

    // Chama a API do Melhor Envio (modo Sandbox para testes, mude para produção quando estiver pronto)
    // Sandbox:  https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate
    // Produção: https://melhorenvio.com.br/api/v2/me/shipment/calculate
    const API_URL = process.env.MELHOR_ENVIO_SANDBOX === 'true'
        ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate'
        : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'ClickMultiShop/1.0 (contato@clickmultishop.com.br)'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro da API Melhor Envio:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Erro ao consultar o Melhor Envio.', detalhes: data })
            };
        }

        // Filtra apenas as opções com preço disponível e as ordena pelo menor preço
        const opcoesValidas = data
            .filter(opcao => !opcao.error && opcao.price)
            .map(opcao => ({
                id: opcao.id,
                nome: opcao.name,
                transportadora: opcao.company?.name || opcao.name,
                preco: parseFloat(opcao.price).toFixed(2),
                prazo_dias: opcao.delivery_time,
                logo_url: opcao.company?.picture || null
            }))
            .sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(opcoesValidas)
        };

    } catch (error) {
        console.error('Erro interno na função calcularFrete:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno no servidor ao calcular o frete.' })
        };
    }
};
