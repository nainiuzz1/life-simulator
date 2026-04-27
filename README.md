# 🎮 人生模拟器 - AI 对话版

一个带 AI 对话互动的网页人生模拟器游戏。玩家从 0 岁开始，每年触发事件，在关键节点（高考、相亲、裁员等）会与 AI NPC 进行对话，对话结果会影响人生属性。

## 🚀 在线体验

本项目支持一键部署到 **Netlify**，无需服务器。

## 📁 项目结构

```
life-simulator/
├── index.html              # 前端游戏页面
├── netlify/
│   └── functions/
│       └── chat.js         # Netlify Function（AI 代理）
├── netlify.toml            # Netlify 配置文件
├── package.json            # Node 项目配置
└── README.md               # 本文件
```

## 🛠️ 部署步骤（GitHub → Netlify）

### 第 1 步：推送到 GitHub

1. 打开 `life-simulator` 文件夹
2. 初始化 Git 仓库并推送：

```bash
git init
git add .
git commit -m "init: 人生模拟器"
```

3. 去 [GitHub](https://github.com) 新建一个空仓库（例如 `life-simulator`）
4. 按 GitHub 提示将本地代码推上去：

```bash
git remote add origin https://github.com/你的用户名/life-simulator.git
git branch -M main
git push -u origin main
```

### 第 2 步：部署到 Netlify

1. 访问 [Netlify](https://app.netlify.com/) 并登录
2. 点击 **"Add new site" → "Import an existing project"**
3. 选择 **GitHub**，授权后找到你的 `life-simulator` 仓库
4. 直接点击 **Deploy site**（Netlify 会自动识别 `netlify.toml` 配置）

### 第 3 步：配置 API Key（重要！）

游戏需要调用智谱 AI API 来实现对话功能，请在 Netlify 后台配置环境变量：

1. 进入 Netlify 后台 → 你的站点 → **Site configuration → Environment variables**
2. 点击 **Add a variable**
3. 添加以下变量：
   - **Key**: `ZHIPU_API_KEY`
   - **Value**: 你的智谱 API Key（从 [智谱开放平台](https://open.bigmodel.cn/) 获取）
4. 保存后，Netlify 会自动重新部署

> 💡 **没有 API Key？** 智谱 `glm-4-flash` 模型目前有免费额度，注册即可获取。

## 🎮 本地预览（前端部分）

由于 AI 对话需要后端代理，本地直接打开 `index.html` 只能看到基础人生流程，**对话功能会报错**。

如需本地完整测试，可安装 Netlify CLI：

```bash
npm install -g netlify-cli
netlify dev
```

## ⚠️ 注意事项

- AI 对话功能依赖智谱 API，请确保 Key 有效且有额度
- 前端调用路径为 `/.netlify/functions/chat`，由 `netlify.toml` 自动映射
- 项目已配置 CORS，支持跨域访问

## 📄 License

MIT
