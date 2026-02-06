# 📌 我的DDL墙 / My DDL Wall

一个精美的DDL（截止日期）和注意事项管理应用，采用可爱的便签墙设计风格，支持便签拖动、自定义颜色和双语切换。

A beautiful DDL (Deadline) and note management app with cute sticky note wall design, supporting note dragging, custom colors, and bilingual interface.

## ✨ 功能特性 / Features

### 核心功能 / Core Features
- 📅 **DDL管理** - 添加带截止日期的任务，实时倒计时提醒 / Add tasks with deadlines and real-time countdown
- 📝 **注意事项** - 记录重要的提醒事项 / Record important notes
- 🎯 **可拖动便签** - 随意拖放便签到任意位置 / Drag and drop notes anywhere
- 🎨 **8种颜色选择** - 桃色、珊瑚、薄荷、薰衣草、天空蓝、柠檬、玫瑰、鼠尾草 / 8 beautiful colors to choose
- ⚡ **三级优先级** - 紧急、一般、不急 / Three priority levels: Urgent, Normal, Low
- 🔍 **智能筛选** - 按类型和优先级快速筛选 / Quick filtering by type and priority

### 界面特色 / UI Features
- 🎨 **可爱配色** - 温柔的渐变背景和马卡龙色便签 / Cute gradient background with pastel sticky notes
- ✍️ **手写字体** - Patrick Hand 和 Caveat 字体营造手写氛围 / Handwritten fonts for authentic feel
- 📐 **可最小化表单** - 点击最小化按钮，表单变成可拖动的浮动按钮 / Minimizable form with draggable floating button
- 🌍 **双语支持** - 中文/英文一键切换 / Chinese/English language toggle
- 📱 **响应式设计** - 完美适配手机和电脑 / Perfect for mobile and desktop
- ⏰ **智能倒计时** - 根据剩余时间自动变色提醒 / Smart countdown with color coding

### 技术特性 / Technical Features
- 💾 **本地存储** - 数据保存在浏览器本地，无需登录 / Local storage, no login required
- 🎯 **位置记忆** - 便签位置自动保存 / Note positions are saved automatically
- ⏱️ **默认午夜时间** - DDL默认设置为次日00:00 / Default deadline time is 00:00

## 🚀 Railway免费部署教程 / Railway Free Deployment

### 方法一：通过GitHub部署（推荐） / Method 1: Deploy via GitHub (Recommended)

1. **创建GitHub仓库 / Create GitHub Repository**
   ```bash
   # 在GitHub上创建一个新仓库 / Create a new repo on GitHub
   # 然后在本地初始化 / Then initialize locally
   git init
   git add .
   git commit -m "Initial commit: DDL Wall App"
   git branch -M main
   git remote add origin https://github.com/你的用户名/ddl-wall.git
   git push -u origin main
   ```

2. **连接Railway / Connect to Railway**
   - 访问 [Railway.app](https://railway.app/) / Visit Railway.app
   - 使用GitHub账号登录 / Login with GitHub
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择你刚创建的仓库 / Select your repository
   - Railway会自动检测并开始部署 / Railway will auto-detect and deploy

3. **配置完成 / Configuration**
   - 等待部署完成（通常1-2分钟）/ Wait for deployment (1-2 minutes)
   - 点击项目，在 "Settings" → "Networking" 中生成域名 / Generate domain in Settings → Networking
   - 访问生成的域名即可使用！/ Visit your generated domain!

### 方法二：Railway CLI部署 / Method 2: Railway CLI

```bash
# 1. 安装Railway CLI / Install Railway CLI
npm i -g @railway/cli

# 2. 登录 / Login
railway login

# 3. 初始化项目 / Initialize project
railway init

# 4. 部署 / Deploy
railway up

# 5. 生成域名 / Generate domain
railway domain
```

## 💻 本地运行 / Local Development

```bash
# 安装依赖 / Install dependencies
npm install

# 启动服务器 / Start server
npm start

# 访问 / Visit
# http://localhost:3000
```

## 📂 项目结构 / Project Structure

```
ddl-wall/
├── index.html      # 主应用文件 / Main app file (HTML + CSS + JS)
├── server.js       # Express服务器 / Express server
├── package.json    # 项目配置 / Project configuration
├── .gitignore      # Git忽略文件 / Git ignore file
└── README.md       # 说明文档 / Documentation
```

## 🎯 使用说明 / User Guide

### 添加DDL / Add DDL
1. 点击"添加DDL"标签 / Click "Add DDL" tab
2. 填写标题和截止日期（默认次日00:00）/ Fill in title and deadline (defaults to 00:00 next day)
3. 选择便签颜色 / Choose note color
4. 选择优先级 / Select priority
5. 点击"贴到墙上" / Click "Pin it!"

### 添加注意事项 / Add Note
1. 点击"添加注意事项"标签 / Click "Add Note" tab
2. 填写标题和描述 / Fill in title and description
3. 选择颜色和优先级 / Choose color and priority
4. 点击"贴到墙上" / Click "Pin it!"

### 便签操作 / Note Operations
- **拖动便签** - 点击并拖动便签到任意位置 / Drag notes anywhere
- **删除便签** - 点击便签上的"删除"按钮 / Click "Delete" button on note
- **筛选便签** - 使用顶部筛选按钮 / Use filter buttons on top

### 表单操作 / Form Operations
- **最小化表单** - 点击右上角"−"按钮，表单变成浮动按钮 / Click "−" to minimize to floating button
- **拖动浮动按钮** - 拖动📝按钮到任意位置 / Drag the 📝 button anywhere
- **恢复表单** - 点击浮动按钮重新展开表单 / Click floating button to restore form

### 语言切换 / Language Switch
- 点击右上角语言按钮切换中英文 / Click language button to toggle Chinese/English

## 🎨 设计特色 / Design Highlights

### 配色方案 / Color Palette
- **背景** - 粉白到暖米色的柔和渐变 / Soft gradient from pink-white to warm cream
- **便签颜色** - 8种马卡龙色系：桃色、珊瑚、薄荷、薰衣草等 / 8 pastel colors: peach, coral, mint, lavender, etc.
- **强调色** - 粉紫渐变用于按钮和重要元素 / Pink-purple gradient for buttons and accents

### 字体选择 / Font Selection
- **标题** - Kalam (俏皮圆润) / Kalam (playful and rounded)
- **正文** - Patrick Hand (自然手写) / Patrick Hand (natural handwriting)
- **便签** - Caveat (随意手写) / Caveat (casual handwriting)
- **中文** - Noto Sans SC (优雅现代) / Noto Sans SC (elegant modern)

### 动画效果 / Animations
- 便签出现的弹跳动画 / Bounce-in animation for new notes
- 悬停时的放大和阴影效果 / Scale and shadow on hover
- 浮动按钮的旋转弹入 / Rotating bounce for floating button
- 平滑的拖拽体验 / Smooth dragging experience

## 📊 数据存储 / Data Storage

所有数据都存储在浏览器的LocalStorage中 / All data is stored in browser's LocalStorage:
- DDL列表和截止时间 / DDL list and deadlines
- 注意事项内容 / Note contents
- 便签位置坐标 / Note positions
- 颜色和优先级设置 / Color and priority settings
- 语言偏好 / Language preference

**注意 / Note**: 清除浏览器缓存会删除所有数据 / Clearing browser cache will delete all data

## 🔧 技术栈 / Tech Stack

- **前端 / Frontend** - 纯HTML + CSS + JavaScript（无框架依赖 / No framework dependencies)
- **后端 / Backend** - Node.js + Express
- **部署 / Deployment** - Railway
- **字体 / Fonts** - Google Fonts (Patrick Hand, Caveat, Kalam, Noto Sans SC)

## 🌟 Railway免费额度 / Railway Free Tier

Railway提供的免费额度 / Railway's free tier includes:
- ✅ 每月$5美元免费额度 / $5 free credit per month
- ✅ 500小时运行时间 / 500 execution hours
- ✅ 无限项目数 / Unlimited projects
- ✅ 自动SSL证书 / Automatic SSL certificates
- ✅ 自定义域名支持 / Custom domain support

对于这个轻量级应用，免费额度完全够用！/ Perfect for this lightweight app!

## 📝 更新日志 / Changelog

### v2.0 - 重大更新 / Major Update
- ✨ 新增：可拖动便签功能 / NEW: Draggable notes
- 🎨 新增：8种自定义颜色 / NEW: 8 custom colors
- 📝 新增：可最小化的表单 / NEW: Minimizable form
- 🌍 新增：中英文双语支持 / NEW: Bilingual support (Chinese/English)
- ✍️ 改进：手写字体风格 / IMPROVED: Handwritten font style
- 🎨 改进：更可爱的配色方案 / IMPROVED: Cuter color scheme
- ⏰ 改进：默认时间为00:00 / IMPROVED: Default time to 00:00

### v1.0 - 初始版本 / Initial Release
- 基础DDL和注意事项管理 / Basic DDL and note management
- 便签墙设计 / Sticky note wall design
- 优先级和筛选功能 / Priority and filtering

## 🤝 贡献 / Contributing

欢迎提交Issue和Pull Request！/ Issues and Pull Requests are welcome!

## 📄 许可证 / License

MIT License - 随意使用和修改 / Feel free to use and modify

---

**享受你的DDL管理之旅！🎉 / Enjoy your DDL management journey! 🎉**

Made with 💖 by Claude
# note-ddl-wall
