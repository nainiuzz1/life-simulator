// Netlify Serverless 函数 - 现代人生模拟器 API
exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: '只支持POST请求' }) };
    }

    try {
        const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
        const body = JSON.parse(event.body);

        if (!ZHIPU_API_KEY) {
            const result = generateOfflineResponse(body);
            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        const requestBody = {
            model: "glm-4-flash",
            messages: body.messages,
            temperature: 0.85,
            max_tokens: body.max_tokens || 500
        };
        if (body.response_format) requestBody.response_format = body.response_format;
        if (body.model) requestBody.model = body.model;

        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ZHIPU_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { statusCode: response.status, headers, body: JSON.stringify({ error: `智谱API错误: ${errorText}` }) };
        }

        const data = await response.json();
        return { statusCode: 200, headers, body: JSON.stringify(data) };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

function generateOfflineResponse(parsed) {
    const userMsg = parsed.messages?.[parsed.messages.length - 1]?.content || '';
    const ageMatch = userMsg.match(/年龄(\d+)/) || userMsg.match(/(\d+)岁/);
    const age = ageMatch ? parseInt(ageMatch[1]) : 25;

    const customMatch = userMsg.match(/自定义行动[：:]\s*"([^"]+)"/) || userMsg.match(/自定义行动[：:]\s*'([^']+)'/);
    if (customMatch) {
        return generateCustomActionResponse(customMatch[1], age);
    }

    return generateEventChoices(age, userMsg);
}

function generateEventChoices(age) {
    return {
        choices: [{
            message: {
                content: JSON.stringify({
                    choices: [
                        {
                            text: age < 18 ? '努力学习提升自己' : '全力以赴把握机会',
                            effects: age < 18 ? { int: 2, hap: 3 } : { wlth: 3, hap: 2 },
                            result: age < 18 ? '你的努力没有白费。' : '你抓住了机会。'
                        },
                        {
                            text: age < 60 ? '发展兴趣爱好' : '享受悠闲生活',
                            effects: { eq: 1, hap: 5 },
                            result: '生活不只有眼前的苟且。'
                        },
                        {
                            text: '锻炼身体',
                            effects: { phy: 2, hap: 2 },
                            result: '身体是革命的本钱。'
                        }
                    ]
                })
            }
        }]
    };
}

function generateCustomActionResponse(action) {
    const t = action.toLowerCase();
    if (/学习|读书|看[书课]/.test(t)) return { choices: [{ message: { content: JSON.stringify({ result: '你静下心来学习，充实了自己。', effects: { int: 3 } }) } }] };
    if (/健身|跑步|运动|锻炼/.test(t)) return { choices: [{ message: { content: JSON.stringify({ result: '出了一身汗，整个人都轻松了。', effects: { phy: 3, hap: 4 } }) } }] };
    if (/赚钱|工作|加班/.test(t)) return { choices: [{ message: { content: JSON.stringify({ result: '你努力赚钱，虽然累了点但值得。', effects: { wlth: 3 } }) } }] };
    if (/旅[游行]|放松|休息/.test(t)) return { choices: [{ message: { content: JSON.stringify({ result: '你好好放松了一下，心情大好。', effects: { hap: 10 } }) } }] };
    return { choices: [{ message: { content: JSON.stringify({ result: '你做出了自己的选择。', effects: { hap: 3 } }) } }] };
}
