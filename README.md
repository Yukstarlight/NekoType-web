# NekoType 官方网站

> 让每句话，都带点猫脾气 🐾 —— NekoType（Android 系统级消息工具）的官网源码

纯静态单页站点：**零构建、零依赖**，双击 `index.html` 即可本地预览；推送至 GitHub Pages 即可上线。

## 项目结构

```
neko-site/
├── index.html          # 单页站点（全部板块）
├── CNAME               # 自定义域名（GitHub Pages 绑定用）
├── assets/
│   ├── css/style.css   # 双主题（星空暗色 / 浅色）+ 玻璃拟态 + 响应式
│   ├── js/main.js      # 主题切换 / 星空粒子 / 规则演示引擎 / 打字动画
│   ├── js/i18n.js      # 简 / 繁 / 英 三语 + 跟随系统
│   └── index.jpg       # 应用图标（favicon / apple-touch-icon / og:image）
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
- **多语言**：`assets/js/i18n.js` 用「文本节点字典匹配」实现，没有 `data-i18n` 属性。**改中文文案时必须同步改字典里的 key**，否则切换语言会回退成中文原文；繁体走 `S2T` 字符映射 + `WORD_FIX` 词表修正，英文是完整字典。`MutationObserver` 负责动态节点补翻。
- **无障碍**：语义化标签、键盘焦点可见；尊重 `prefers-reduced-motion` 仅影响入场动效，星空背景始终保留。
- **移动端降级**：`html.is-mobile` 下星空改为静态单帧、关闭字符雨与自动演示，避免低端机掉帧。
- **字体**：Sora（展示）+ Noto Sans SC 900（中文标题）+ JetBrains Mono（代码，致敬 App 内置终端），Google Fonts CDN 加载并带系统回退。

## 域名与部署

GitHub Pages（legacy build，分支 `main`，路径 `/`）。

**全站只有两处写死了域名**，换域名时改这两处即可：

1. `CNAME` —— 内容为裸域名，如 `example.com`（在仓库 Settings → Pages → Custom domain 里改会自动提交，手动改也行）。
2. `index.html` 第 14 行的 `og:image` —— `https://<域名>/assets/index.jpg`，必须是绝对地址，社交平台抓取预览用。

> 其余所有资源引用（CSS / JS / 图片 / 字体）都是相对路径，换域名无需改动。

换完域名后：

- 在 Settings → Pages 等证书签发完成，再勾上 **Enforce HTTPS**（证书没就绪时该选项是灰的）。
- 别用"先删 Custom domain 再重新添加"的办法去催证书——中途失败会让 GitHub 直接删掉 `CNAME` 文件，把站点打回 `*.github.io`。

**一次错误排查的记录（2026-10-07）**

现象：`https://nekotype.bbroot.com/` 与 `http://nekotype.bbroot.com/` 全部连接重置（`curl: (56)/(35) Recv failure`），而 `https://yukstarlight.github.io/NekoType-web/` 正常。

一度误判为「域名被按后缀拦截」，**这个结论是错的**。补齐控制变量实验后结论完全反转：

| 实验 | 结果 |
|---|---|
| 用 `--resolve` 把 IP 固定到 GitHub Pages，再访问 `nekotype.bbroot.com` | HTTP / HTTPS **全部 200**（185.199.108~111.153 四个 IPv4 加 IPv6 全通） |
| 同一个 IP、同一个端口，只换 Host 头 | `Host: 随机子域名` 得到 GitHub 正常的 **404**，不是重置 |
| 把同样的 Host / SNI 名打到 Cloudflare 的 IP 上 | 得到 CF 正常的 **409**（未知 zone），不是重置 |
| `bbroot.com` 自身的 IP `157.254.191.45` | 对所有 Host 都超时——那台机器本来就不通，与域名无关 |

结论：那批 RST 是**时段性故障**，随 Pages 重新构建后自行恢复。现在 `https://nekotype.bbroot.com/` 返回 200，证书 `CN=nekotype.bbroot.com`（Let's Encrypt，有效期至 2027-01-02），`ssl_verify_result=0`。**既不是被墙，也不是缺证书。**

- 教训一：排查「网站打不开」先固定 IP 复测一次。同一条 RST 现象可以有完全不同的成因，别凭单一现象就下「被墙」的结论。
- 教训二：`bad_authz` 更可能来自 2026-10-04 那两次手滑的 CNAME 提交——把域名写成了 `nekotype.bbroot.co`（少一个 `m`），该次 Pages 构建状态是 `errored`。每次改域名都会重开一轮 ACME 授权并作废上一轮。
- 风险提示（未证实）：免费二级域名的注册域是共享的，理论上会共用 Let's Encrypt「每注册域每周 50 张证书」的配额；共享后缀也可能随服务商被整体处置。长期项目仍建议用自己的独立域名。
- `*.github.io` 在国内不可靠（DNS 污染），**不要当备用直链**写进文案。

## 上游项目

- 主仓库：<https://github.com/Yukstarlight/NekoType>
- 下载：<https://github.com/Yukstarlight/NekoType/releases>
- 版本：v2.8.0 · 完全离线 · GPL-3.0

网站内容基于上游 README 与品牌资源整理；与主仓库相互独立，保持开源精神（GPL-3.0）。
