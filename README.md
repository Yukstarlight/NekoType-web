# NekoType 官方网站

> 让每句话，都带点猫脾气 🐾 —— NekoType（Android 系统级消息工具）的官网源码

纯静态单页站点：**零构建、零依赖**，双击 `index.html` 即可本地预览；推送至 GitHub Pages 即可上线。

## 项目结构

```
neko-site/
├── index.html          # 单页站点（全部板块）
├── assets/
│   ├── css/style.css   # 双主题（星空暗色 / 浅色）+ 玻璃拟态 + 响应式
│   ├── js/main.js      # 主题切换 / 星空粒子 / 规则演示引擎 / 打字动画
│   └── favicon.svg     # 猫头图标
```

## 本地预览

```bash
# 任选其一
start index.html
python -m http.server 8080
```

## 技术说明

- **双主题**：默认「星空猫夜」暗色（取自 App 内置星空模式配色 `#0A0E1E / #C8A2FF / #F5B042`），右上角一键切换浅色；选择记住在 `localStorage`。
- **互动演示**：规则引擎移植自 App 的 TextTransformEngine 语义（替换 → 前缀 → 后缀 → 随机尾缀 → 颜文字 → 加空格），可实时预览并模拟发送。
- **品牌**：Logo 矢量路径复刻自 App 内 `ic_neko` 猫头图标；配色使用官方 `colors.xml` 色板。
- **无障碍**：`prefers-reduced-motion`、语义化标签、键盘焦点可见。
- **字体**：站酷快乐体（展示）+ Noto Sans SC（正文）+ JetBrains Mono（代码，致敬 App 内置终端），Google Fonts CDN 加载并带系统回退。

## 上游项目

- 主仓库：<https://github.com/Yukstarlight/NekoType>
- 下载：<https://github.com/Yukstarlight/NekoType/releases>
- 版本：v2.6.9 · 完全离线 · BSD 2-Clause

网站内容基于上游 README 与品牌资源整理；与主仓库相互独立，保持开源精神（BSD 2-Clause）。
