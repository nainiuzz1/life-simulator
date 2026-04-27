// Netlify Serverless 函数
// 这个文件运行在Netlify服务器上，玩家永远看不到里面的代码

exports.handler = async function(event, context) {
    // 设置 CORS（允许跨域）
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // 处理预检请求
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: '只支持POST请求' })
        };
    }
    
    try {
        // 🔑 从 Netlify 环境变量读取 Key（安全！玩家看不到）
        const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
        
        // 解析玩家发来的请求
        const body = JSON.parse(event.body);
        
        // 🔴 如果没有 API Key，进入离线模拟模式（零配置也能玩）
        if (!ZHIPU_API_KEY) {
            const playerText = body.messages[body.messages.length - 1]?.content || "";
            const systemPrompt = body.messages[0]?.content || "";
            
            // 简单的规则评分
            let score = 0;
            if (playerText.length > 5) score += 1;
            if (playerText.length > 15) score += 1;
            if (/谢谢|感谢|对不起|喜欢|爱|努力|坚持|梦想|理解|尊重|抱歉|对不起|加油/.test(playerText)) score += 1;
            if (/滚|傻逼|去死|讨厌|烦|垃圾|废物|没意思|无聊/.test(playerText)) score -= 2;
            
            // 根据场景给不同回复
            let reply = "（对方沉默地看着你）";
            if (systemPrompt.includes("父亲")) {
                const replies = ["爸跟你讲，你这话爸不爱听。", "你这孩子...再想想。", "嗯，有点道理，你继续说。", "爸老了，但爸能理解你。", "行，你有自己的想法也好。"];
                reply = replies[Math.floor(Math.random() * replies.length)];
            } else if (systemPrompt.includes("相亲")) {
                const replies = ["哦...这样啊。", "（礼貌地微笑）", "我觉得你还挺有趣的。", "哈哈，真的吗？", "那我们下次再约？"];
                reply = replies[Math.floor(Math.random() * replies.length)];
            } else if (systemPrompt.includes("老板")) {
                const replies = ["你这是什么态度？", "继续说。", "公司也有公司的难处。", "我理解你的处境。", "好吧，按你说的来。"];
                reply = replies[Math.floor(Math.random() * replies.length)];
            } else if (systemPrompt.includes("内心")) {
                const replies = ["是啊，这一生...", "（轻轻叹息）", "你终于明白了。", "没关系，一切都过去了。", "这就是人生啊。"];
                reply = replies[Math.floor(Math.random() * replies.length)];
            }
            
            const mockData = {
                choices: [{
                    message: {
                        content: JSON.stringify({ reply, score: Math.max(-3, Math.min(3, score)) })
                    }
                }]
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(mockData)
            };
        }
        
        // 调用智谱API
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ZHIPU_API_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4-flash",
                messages: body.messages,
                temperature: 0.9,
                max_tokens: 150
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `智谱API错误: ${errorText}` })
            };
        }
        
        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('代理函数错误:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};