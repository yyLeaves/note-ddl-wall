const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 服务静态文件
app.use(express.static(__dirname));

// 所有路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 DDL墙应用运行在端口 ${PORT}`);
  console.log(`📌 访问 http://localhost:${PORT}`);
});
