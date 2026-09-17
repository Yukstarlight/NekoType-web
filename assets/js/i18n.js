/* ============================================================
   NekoType 官网 · i18n（简体 / 繁體 / English + 跟随系统）
   设计：不改 HTML 结构，按「文本节点原文」查字典替换
        · 简体(zh-Hans)：HTML 原文即简体，无需字典
        · 繁體(zh-Hant)：字符映射 + 词语修正
        · English(en)   ：显式词典
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1) 简 → 繁 字符映射（仅收录本站实际出现且字形不同的字） ---------- */
  const S2T = {
    规:'規',统:'統',级:'級',处:'處',线:'線',运:'運',悬:'懸',驻:'駐',键:'鍵',缀:'綴',随:'隨',机:'機',后:'後',
    换:'換',并:'並',发:'發',则:'則',组:'組',优:'優',数:'數',认:'認',顺:'順',严:'嚴',从:'從',条:'條',让:'讓',
    点:'點',写:'寫',无:'無',断:'斷',标:'標',结:'結',输:'輸',静:'靜',强:'強',绝:'絕',碍:'礙',触:'觸',转:'轉',
    弹:'彈',贴:'貼',构:'構',设:'設',气:'氣',创:'創',页:'頁',辑:'輯',题:'題',绪:'緒',启:'啟',图:'圖',圆:'圓',
    进:'進',号:'號',个:'個',给:'給',关:'關',观:'觀',广:'廣',过:'過',还:'還',汉:'漢',横:'橫',护:'護',画:'畫',
    话:'話',环:'環',唤:'喚',会:'會',绘:'繪',击:'擊',计:'計',记:'記',迹:'跡',间:'間',监:'監',检:'檢',减:'減',
    简:'簡',见:'見',娇:'嬌',脚:'腳',仅:'僅',据:'據',库:'庫',块:'塊',宽:'寬',馈:'饋',溃:'潰',赖:'賴',拦:'攔',
    览:'覽',类:'類',离:'離',里:'裡',连:'連',联:'聯',两:'兩',录:'錄',轮:'輪',萝:'蘿',络:'絡',马:'馬',码:'碼',
    吗:'嗎',猫:'貓',么:'麼',没:'沒',内:'內',拟:'擬',钮:'鈕',盘:'盤',骗:'騙',频:'頻',弃:'棄',签:'簽',浅:'淺',
    亲:'親',轻:'輕',倾:'傾',请:'請',区:'區',趋:'趨',权:'權',扰:'擾',骚:'騷',扫:'掃',闪:'閃',审:'審',时:'時',
    实:'實',势:'勢',试:'試',视:'視',适:'適',输:'輸',竖:'豎',说:'說',缩:'縮',锁:'鎖',态:'態',题:'題',体:'體',
    听:'聽',头:'頭',团:'團',网:'網',为:'為',稳:'穩',问:'問',务:'務',闲:'閒',显:'顯',现:'現',响:'響',项:'項',
    销:'銷',绪:'緒',续:'續',选:'選',询:'詢',讯:'訊',严:'嚴',颜:'顏',验:'驗',阳:'陽',样:'樣',义:'義',忆:'憶',
    译:'譯',阴:'陰',隐:'隱',应:'應',优:'優',邮:'郵',与:'與',语:'語',预:'預',员:'員',圆:'圓',缘:'緣',载:'載',
    则:'則',诈:'詐',帧:'幀',执:'執',终:'終',种:'種',驻:'駐',转:'轉',装:'裝',缀:'綴',资:'資',踪:'蹤',纵:'縱',
    组:'組',备:'備',笔:'筆',闭:'閉',边:'邊',编:'編',变:'變',仓:'倉',侧:'側',测:'測',层:'層',尝:'嘗',场:'場',
    畅:'暢',彻:'徹',称:'稱',诚:'誠',础:'礎',储:'儲',传:'傳',纯:'純',错:'錯',哒:'噠',单:'單',当:'當',导:'導',
    灯:'燈',电:'電',调:'調',叠:'疊',顶:'頂',丢:'丟',动:'動',独:'獨',读:'讀',队:'隊',对:'對',饭:'飯',飞:'飛',
    费:'費',风:'風',复:'複',副:'副',干:'干',挂:'掛',滚:'滾',号:'號',后:'後',怀:'懷',欢:'歡',极:'極',几:'幾',
    夹:'夾',价:'價',坚:'堅',间:'間',检:'檢',奖:'獎',酱:'醬',胶:'膠',节:'節',紧:'緊',尽:'盡',劲:'勁',惊:'驚',
    竞:'競',镜:'鏡',纠:'糾',旧:'舊',局:'局',举:'舉',觉:'覺',军:'軍',开:'開',壳:'殼',课:'課',垦:'墾',恳:'懇',
    夸:'誇',矿:'礦',亏:'虧',困:'困',扩:'擴',腊:'臘',来:'來',兰:'蘭',烂:'爛',劳:'勞',乐:'樂',累:'累',冷:'冷',
    礼:'禮',丽:'麗',历:'歷',厉:'厲',励:'勵',连:'連',怜:'憐',练:'練',炼:'煉',粮:'糧',疗:'療',辽:'遼',临:'臨',
    龄:'齡',铃:'鈴',领:'領',刘:'劉',龙:'龍',楼:'樓',陆:'陸',驴:'驢',虑:'慮',乱:'亂',论:'論',罗:'羅',蛮:'蠻',
    满:'滿',猫:'貓',贸:'貿',么:'麼',门:'門',闷:'悶',们:'們',梦:'夢',谜:'謎',绵:'綿',灭:'滅',悯:'憫',鸣:'鳴',
    谬:'謬',亩:'畝',纳:'納',难:'難',脑:'腦',闹:'鬧',拟:'擬',酿:'釀',鸟:'鳥',宁:'寧',农:'農',哦:'哦',欧:'歐',
    呕:'嘔',盘:'盤',庞:'龐',赔:'賠',喷:'噴',贫:'貧',苹:'蘋',凭:'憑',评:'評',扑:'撲',铺:'鋪',仆:'僕',朴:'樸',
    启:'啟',弃:'棄',牵:'牽',铅:'鉛',谦:'謙',钱:'錢',浅:'淺',枪:'槍',墙:'牆',抢:'搶',桥:'橋',窍:'竅',窃:'竊',
    钦:'欽',亲:'親',轻:'輕',倾:'傾',庆:'慶',琼:'瓊',穷:'窮',秋:'秋',区:'區',驱:'驅',趋:'趨',曲:'曲',权:'權',
    劝:'勸',却:'卻',确:'確',让:'讓',扰:'擾',热:'熱',认:'認',荣:'榮',绒:'絨',软:'軟',锐:'銳',润:'潤',洒:'灑',
    萨:'薩',鳃:'鰓',赛:'賽',伞:'傘',丧:'喪',骚:'騷',扫:'掃',涩:'澀',杀:'殺',纱:'紗',晒:'曬',删:'刪',闪:'閃',
    陕:'陝',缮:'繕',伤:'傷',赏:'賞',烧:'燒',绍:'紹',摄:'攝',慎:'慎',声:'聲',绳:'繩',胜:'勝',师:'師',湿:'濕',
    诗:'詩',时:'時',识:'識',实:'實',蚀:'蝕',驶:'駛',势:'勢',释:'釋',饰:'飾',适:'適',寿:'壽',书:'書',术:'術',
    树:'樹',竖:'豎',帅:'帥',双:'雙',谁:'誰',顺:'順',说:'說',硕:'碩',丝:'絲',怂:'慫',耸:'聳',讼:'訟',诵:'誦',
    搜:'搜',苏:'蘇',诉:'訴',虽:'雖',随:'隨',岁:'歲',孙:'孫',损:'損',缩:'縮',锁:'鎖',所:'所',台:'台',态:'態',
    摊:'攤',谈:'談',叹:'嘆',汤:'湯',涛:'濤',讨:'討',腾:'騰',题:'題',体:'體',条:'條',铁:'鐵',听:'聽',厅:'廳',
    廷:'廷',统:'統',头:'頭',图:'圖',团:'團',脱:'脫',驼:'駝',洼:'窪',袜:'襪',弯:'彎',万:'萬',网:'網',韦:'韋',
    违:'違',围:'圍',为:'為',维:'維',伟:'偉',纬:'緯',卫:'衛',温:'溫',闻:'聞',纹:'紋',稳:'穩',问:'問',污:'污',
    无:'無',芜:'蕪',吴:'吳',务:'務',雾:'霧',误:'誤',吸:'吸',牺:'犧',习:'習',系:'系',细:'細',虾:'蝦',辖:'轄',
    峡:'峽',狭:'狹',厦:'廈',鲜:'鮮',纤:'纖',咸:'鹹',贤:'賢',衔:'銜',显:'顯',险:'險',现:'現',献:'獻',县:'縣',
    线:'線',宪:'憲',乡:'鄉',详:'詳',响:'響',项:'項',象:'象',协:'協',胁:'脅',挟:'挾',携:'攜',谢:'謝',锌:'鋅',
    兴:'興',须:'須',许:'許',绪:'緒',续:'續',轩:'軒',悬:'懸',选:'選',学:'學',询:'詢',寻:'尋',驯:'馴',训:'訓',
    讯:'訊',压:'壓',鸦:'鴉',哑:'啞',亚:'亞',严:'嚴',岩:'岩',盐:'鹽',颜:'顏',阎:'閻',艳:'艷',厌:'厭',验:'驗',
    鸯:'鴦',杨:'楊',扬:'揚',阳:'陽',痒:'癢',养:'養',样:'樣',谣:'謠',药:'藥',爷:'爺',业:'業',叶:'葉',页:'頁',
    义:'義',议:'議',异:'異',译:'譯',阴:'陰',银:'銀',应:'應',婴:'嬰',樱:'櫻',鹰:'鷹',营:'營',蝇:'蠅',赢:'贏',
    颖:'穎',哟:'喲',拥:'擁',佣:'傭',踊:'踴',优:'優',邮:'郵',犹:'猶',鱼:'魚',渔:'漁',与:'與',屿:'嶼',语:'語',
    吁:'籲',郁:'鬱',誉:'譽',渊:'淵',园:'園',员:'員',圆:'圓',缘:'緣',远:'遠',愿:'願',约:'約',跃:'躍',钥:'鑰',
    岳:'嶽',阅:'閱',云:'雲',匀:'勻',杂:'雜',灾:'災',赞:'讚',脏:'臟',凿:'鑿',枣:'棗',责:'責',择:'擇',泽:'澤',
    贼:'賊',赠:'贈',扎:'紮',札:'札',诈:'詐',斋:'齋',债:'債',毡:'氈',盏:'盞',斩:'斬',战:'戰',张:'張',涨:'漲',
    账:'賬',帐:'帳',赵:'趙',折:'摺',这:'這',贞:'貞',针:'針',侦:'偵',诊:'診',镇:'鎮',阵:'陣',挣:'掙',睁:'睜',
    帧:'幀',郑:'鄭',证:'證',织:'織',职:'職',执:'執',纸:'紙',致:'致',帜:'幟',制:'制',质:'質',钟:'鐘',终:'終',
    种:'種',众:'眾',皱:'皺',昼:'晝',骤:'驟',猪:'豬',诸:'諸',烛:'燭',嘱:'囑',筑:'築',铸:'鑄',专:'專',转:'轉',
    赚:'賺',庄:'莊',装:'裝',妆:'妝',壮:'壯',状:'狀',锥:'錐',坠:'墜',缀:'綴',谆:'諄',准:'準',浊:'濁',兹:'茲',
    资:'資',渍:'漬',综:'綜',总:'總',纵:'縱',走:'走',奏:'奏',诅:'詛',组:'組',钻:'鑽',祖:'祖',嘴:'嘴',最:'最',
    尊:'尊',昨:'昨',左:'左',作:'作',坐:'坐',座:'座'
  };

  /* 词语级修正（单字映射会译错的） */
  const WORD_FIX = [
    ['恢复','恢復'], ['回复','回覆'], ['重复','重複'], ['复制','複製'], ['复现','復現'],
    ['后台','後台'], ['网址','網址'], ['接口','介面'], ['内存','記憶體']
  ];

  /* ---------- 2) 英文词典（键 = 页面简体原文，仅列需要翻译的） ---------- */
  const EN = {
    /* 标题 / 导航 */
    'NekoType · 全平台通用文本处理工具': 'NekoType · A cross-platform text processing tool',
    '原理': 'How it works', '试一试': 'Try it', '特性': 'Features', '更多': 'More',
    '下载': 'Download', '菜单': 'Menu',
    /* Hero */
    'v2.7.6 · 系统级文本处理 · 完全离线': 'v2.7.6 · System-level text processing · Fully offline',
    '全平台通用的': 'Cross-platform', '文本处理工具': 'text processing tool',
    'NekoType 是一款系统级文本处理工具：悬浮球常驻屏幕边缘，一键为输入框内容应用前缀、后缀、随机尾缀、文本替换等规则并自动发送。三种运行模式（悬浮球 / 篡改键盘 / 断句追加）自由切换，规则自由组合、概率可控、实时预览。':
      'NekoType is a system-level text processing tool. A floating ball stays on the edge of your screen and rewrites what you type — prefix, suffix, random tail, text replace — then sends it in one tap. Three run modes (floating ball / keyboard rewrite / punctuation trigger) switch freely, rules combine freely with controllable odds and live preview.',
    '完全离线运行，无服务器、无广告、无追踪。': 'Fully offline: no server, no ads, no tracking.',
    '下载 v2.7.6': 'Download v2.7.6', '查看源码': 'View source', '备用下载': 'Mirror',
    '不申请网络权限 · 无服务器 · 开源可审计 · 权限可随时撤销':
      'No network permission · No server · Open source & auditable · Revoke anytime',
    '文本自动改写': 'Automatic rewrite', '悬浮球已就绪 · 打字即变': 'Floating ball ready · rewrites as you type',
    '输入内容会按规则自动变换': 'Text is transformed by your rules automatically', '好的': 'Okay',
    '前缀': 'Prefix', '后缀': 'Suffix', '替换': 'Replace',
    /* 三步 */
    '三步，句子就变了样': 'Three steps and your text changes',
    '不用换键盘、不用装输入法。你照常打字，剩下交给悬浮球——或切到篡改键盘 / 断句追加模式全自动。':
      'No new keyboard, no IME to install. Type as usual and let the floating ball handle it — or switch to keyboard-rewrite / punctuation mode for full automation.',
    '正常打字': 'Type as usual',
    '在任意输入框里像平时一样输入文本。即时通讯、社交、笔记——悬浮球不依赖特定应用，全局可用。':
      'Type in any input box as you normally would. Chat, social, notes — the floating ball works globally, app-agnostic.',
    '触发变换': 'Trigger the rewrite',
    '三种模式任选：点悬浮球改写发送、篡改键盘模式打字即变、断句追加模式打完一句自动改。悬浮球支持拖动摆放、边缘吸附、位置持久记忆。':
      'Pick one of three modes: tap the ball to rewrite and send, rewrite while typing, or rewrite when you finish a sentence. The ball supports dragging, edge snapping and position memory.',
    '自动改写并发送': 'Rewrite and send automatically',
    '文本替换 → 前缀 → 后缀 → 随机尾缀，再走三级智能发送策略，一键到底，话就发出去了。':
      'Replace → prefix → suffix → random tail, then the three-level smart-send strategy takes over. One tap and it is out.',
    /* 演示 */
    '效果预览': 'Live preview', '亲手试试，文本怎么变': 'Try it: watch your text change',
    '勾选规则、修改输入，右侧实时预览叠加结果，再点悬浮球「发送」一条试试。':
      'Toggle rules, edit the input, and the stacked result updates live on the right. Then tap the ball to “send” one.',
    '规则开关': 'Rule switches', '随机后缀': 'Random suffix', '触发概率': 'Chance',
    '随机颜文字': 'Random kaomoji', '内置 65 种 · 触发概率': '65 built-in · chance',
    '替换文本': 'Replace text', '字符间加空格': 'Space between characters', '让句子透气': 'Let the text breathe',
    '预设：': 'Presets:', '猫语': 'Cat', '闪闪': 'Sparkle', '中二': 'Chuuni', '清空': 'Clear',
    '今日变换 0 次': '0 transforms today', '想去看电影嘛？': 'Wanna go see a movie?',
    '实时预览': 'Live result', '随机演示': 'Random demo',
    '点一下悬浮球发送': 'Tap the floating ball to send', '点一下悬浮球 · 发送': 'Tap the floating ball · Send',
    '输入点啥…': 'Type something…',
    /* 核心特性 */
    '核心特性': 'Core features', '规则 · 模式 · 系统增强 · 人设语气': 'Rules · Modes · System boost · Personas',
    '规则自由组合（优先级 1-100 防冲突），三种运行模式互斥切换，Shizuku / Root / Dhizuku 系统级兜底，还有 8 套人设语气包一键换人设。':
      'Rules combine freely (priority 1-100 prevents conflicts), three run modes are mutually exclusive, Shizuku / Root / Dhizuku provide system-level fallback, and 8 persona packs switch your style in one tap.',
    '开': 'ON', '随机后缀·固定': 'Random suffix · fixed', '优先级': 'Priority', '大 → 小': 'high → low',
    '执行：输入': '· run: input',
    '规则系统 · 优先级 1-100 防冲突': 'Rule system · Priority 1-100, conflict-free',
    '规则页采用列表模型，点「添加规则」即可按类型创建。每条规则都能设':
      'Rules are a list: tap “Add rule” to create one by type. Every rule can set a ',
    '优先级 1-100（数字越大越先执行，同级按列表顺序，默认 50）':
      'priority from 1-100 (higher runs first; ties keep list order; default 50)',
    '，从根上避免多条规则互相打架；还可开启「按等级全局执行」，让所有类型打散、严格按等级从大到小走一条流水线（例如让「替换」在后缀之后生效）。':
      ', which keeps multiple rules from fighting each other. You can also enable “run globally by priority” to flatten every type into one pipeline sorted by priority (e.g. let Replace run after Suffix).',
    '前缀 / 后缀 / 替换文本': 'Prefix / Suffix / Replace text',
    '随机前缀·后缀（固定 / 不固定两种）': 'Random prefix & suffix (fixed / non-fixed)',
    '优先级 1-100，数字越大越先执行': 'Priority 1-100, higher runs first',
    '按等级全局执行，杜绝规则冲突': 'Run globally by priority — no rule conflicts',
    '字符加空格、转大写、多套预设 + 效果预览': 'Space between chars, uppercase, presets + live preview',
    '我今天好开心': 'I am so happy today', '我今天好开心喵': 'I am so happy today nya',
    '三种模式 · 打字即变 / 断句即改': 'Three modes · rewrite as you type / at punctuation',
    '三种运行模式 · 互斥切换': 'Three run modes · mutex switch',
    '从手动到全自动，三种模式任选其一：': 'From manual to fully automatic, pick one of three: ',
    '悬浮球模式': 'Floating-ball mode', '点一下改写发送；': 'tap to rewrite and send; ',
    '篡改键盘模式': 'Keyboard-rewrite mode',
    '原生键盘打字即自动改（增量原文算法，后缀永不重复）；':
      'the native keyboard rewrites as you type (incremental source algorithm, suffixes never duplicate); ',
    '断句追加模式': 'Punctuation mode',
    '输入以标点结尾才篡改，打完一句自动改，更自然。随时切换。':
      'it only rewrites when you end with punctuation — finish a sentence and it changes. Switch anytime.',
    '悬浮球模式：点一下即改写发送': 'Floating ball: tap to rewrite and send',
    '篡改键盘模式：打字即变，无需点球': 'Keyboard rewrite: transforms as you type, no tap needed',
    '断句追加模式：标点结尾才改，更自然': 'Punctuation mode: rewrites at sentence end, more natural',
    '写回自动移光标到末尾，不打断输入': 'Cursor returns to the end — typing is never interrupted',
    '无障碍通道被拒 → 切换 Shizuku': 'Accessibility denied → switching to Shizuku',
    '无弹窗 · 无剪贴板 · 已发送': 'No dialog · no clipboard · sent',
    '静默修改 · 系统级增强': 'Silent edit · system-level boost',
    '当部分应用（如微信）拒绝无障碍改写时，自动改用 Shizuku 直接注入，全程无弹窗、无剪贴板提示，改完即走。支持 Shizuku / Root / Dhizuku 多通道，首页还能':
      'When an app (e.g. WeChat) refuses accessibility rewrites, NekoType injects text through Shizuku instead — no dialog, no clipboard toast, instantly done. Shizuku / Root / Dhizuku channels are supported, and the home screen can even ',
    '一键授权所有权限': 'grant all permissions in one tap', '，省去逐项点击。': ', skipping per-item setup.',
    'Shizuku / Root / Dhizuku 多通道注入': 'Shizuku / Root / Dhizuku multi-channel injection',
    '一键授权所有权限（Shizuku 直写）': 'One-tap grant all permissions (Shizuku write)',
    '固定动作架构，不接受任意命令，杜绝注入': 'Fixed-action architecture — no arbitrary commands, no injection',
    '免 Root，中文文本自动回退无障碍': 'No root needed; Chinese text falls back to accessibility',
    '🐱 人设语气包 · 一键套用': '🐱 Persona packs · one-tap apply',
    '萝莉语': 'Loli', '古风文言': 'Classical', '译制片腔': 'Dub voice', '阴阳怪气': 'Sarcastic',
    '火星文': 'Mars text', '病娇': 'Yandere', '雌小鬼': 'Mesugaki', '猫娘': 'Catgirl',
    '点击即自动创建对应规则预设并激活 · 可在规则页查看 / 修改':
      'Tap to auto-create and activate the matching rule preset · review or edit it on the Rules page',
    '人设语气包 · 聊天秒换人设': 'Persona packs · switch style instantly',
    '内置': 'Built-in ', '8 套风格预设': '8 style presets',
    '：萝莉语 / 古风文言 / 译制片腔 / 阴阳怪气 / 火星文 / 病娇 / 雌小鬼 / 猫娘。点一下':
      ': Loli / Classical / Dub voice / Sarcastic / Mars text / Yandere / Mesugaki / Catgirl. One tap ',
    '自动创建对应规则预设并激活': 'auto-creates and activates the matching rule preset',
    '，无需手动配规则，规则页可随时查看与二次修改。':
      ' — no manual setup, and you can review or edit it on the Rules page anytime.',
    '8 套内置人设，点击即创建并激活': '8 built-in personas, tap to create and activate',
    '自动生成规则预设，可二次编辑': 'Auto-generated rule presets, fully editable',
    '🐱 猫娘主题：全 UI 切换猫娘用语': '🐱 Catgirl theme: whole UI switches to catgirl speech',
    '🐱 情绪小猫：随机情绪概率，猫娘主题 +20%': '🐱 Mood cat: random mood chance, +20% under catgirl theme',
    /* 更多能力 */
    '更多能力': 'More capabilities', '一只悬浮球，比你想象的更强': 'One floating ball, stronger than you think',
    '从启动动画到集成终端，从三种模式到防篡改，全部基于系统公开 API 实现。':
      'From the splash animation to the integrated terminal, from three modes to tamper protection — all built on public system APIs.',
    '启动动画': 'Splash animation',
    '图标圆形弹性弹出 + 标题副标题依次淡入，1 秒进入首页。启动 slogan：Welcome to Mist Unveils Infinite Tomorrows。':
      'The icon pops in with a circular spring, then title and subtitle fade in — home screen in 1 second. Splash slogan: Welcome to Mist Unveils Infinite Tomorrows.',
    '悬浮按钮': 'Floating button',
    '永久常驻屏幕边缘，默认 56dp，拖动摆放、边缘吸附、位置记忆。柔光玻璃效果、5 秒空闲收成小圆点、自定义大小与透明度。':
      'Always on the screen edge, 56dp by default — drag it, edge snapping, position memory. Soft-glass look, collapses to a dot after 5s idle, custom size and opacity.',
    '三种运行模式': 'Three run modes',
    '悬浮球 / 篡改键盘 / 断句追加三种模式互斥切换：手动点一下、打字即自动改、或打完一句才改，各取所需。':
      'Floating ball / keyboard rewrite / punctuation — three mutually exclusive modes: tap manually, rewrite as you type, or only at sentence end.',
    '一键授权': 'One-tap grant',
    'Shizuku 直写一次性写入无障碍、免电、悬浮窗等所有权限，省去逐项跳转系统设置，五步引导一步到位。':
      'Shizuku writes all permissions at once — accessibility, battery whitelist, overlay — so you skip the per-item system settings. Five-step guide in one go.',
    'Mist 集成终端': 'Mist integrated terminal',
    'Welcome to Mist Unveils Infinite Tomorrows 集成终端（Beta）。复用 Termux 引擎，PTY 真实交互，内置 460+ 命令与 nekosay / nekomood / catbomb 等猫系命令，JetBrains Mono 等宽字体。':
      'Welcome to Mist Unveils Infinite Tomorrows integrated terminal (Beta). Built on the Termux engine with real PTY interaction, 460+ commands plus cat-themed ones (nekosay / nekomood / catbomb), JetBrains Mono monospace font.',
    '应用黑名单': 'App blacklist',
    '独立黑名单页列出全部已安装应用，勾选即加入。黑名单内不自动篡改，悬浮球手动点击不受限。':
      'A dedicated page lists every installed app — tick to blacklist. Nothing is auto-rewritten inside blacklisted apps, but manual ball taps still work.',
    '日志查看器': 'Log viewer',
    '7 级日志体系 + 系统 logcat 直读，变换失败、发送被拦截一眼定位。系统标签轻汉化，字体可缩放、可复制导出。':
      '7 log levels plus direct logcat reading, so failed rewrites and blocked sends are easy to spot. System tags lightly localized, scalable font, copy & export.',
    '数据管理': 'Data management',
    '一键导出/导入全部配置（规则+行为+外观），文本格式可读可编辑，换机备份都方便。每日变换次数 + 7 天趋势一目了然。':
      'Export/import the whole config (rules + behaviour + appearance) as readable, editable text — handy for backups and new phones. Daily transform count plus a 7-day trend.',
    '三语切换': 'Three languages',
    '简体中文 / 繁體中文 / English 一键切换，全局即时生效，含 toast、对话框、按钮全部文案。':
      'Simplified Chinese / Traditional Chinese / English switch instantly, everywhere — toasts, dialogs and every button label.',
    '外观与主题': 'Look & themes',
    '深色 / 浅色 / 跟随系统 / 星空四套主题，外加自定义任意图片作应用背景（仅保存在本地），悬浮球大小与透明度实时可调。':
      'Dark / Light / Follow system / Starry Sky — four themes, plus any image as app background (stored locally only). Ball size and opacity adjust in real time.',
    '人设语气包': 'Persona packs',
    '萝莉语 / 古风文言 / 译制片腔 / 阴阳怪气 / 火星文 / 病娇 / 雌小鬼 / 猫娘 共 8 套人设，点击即自动创建并激活规则预设，聊天秒换人设。':
      'Loli / Classical / Dub voice / Sarcastic / Mars text / Yandere / Mesugaki / Catgirl — 8 personas. Tap to auto-create and activate the rule preset; switch style instantly.',
    '猫娘主题': 'Catgirl theme',
    '第五套主题「猫娘」：全 UI 切换猫娘用语（喵语口癖、自称喵），底部导航换成猫咪头像并给文字加「喵~」，同时联动情绪小猫 +20%。':
      'The fifth theme, Catgirl: the whole UI switches to catgirl speech (nya tics, self-referring as 喵), the bottom nav turns into cat avatars with “喵~” suffixes, and Mood cat gets +20%.',
    '情绪小猫': 'Mood cat',
    '随机情绪概率 0-100（默认 30），开启猫娘主题自动 +20%。终端': 'Random mood chance 0-100 (default 30), +20% with catgirl theme on. In the terminal, ',
    '可指定 happy / sleepy / angry / shy / berserk，': 'can pick happy / sleepy / angry / shy / berserk, and ',
    '一键停止。': 'stops it in one tap.',
    '安全防护': 'Security',
    'Argon2id 密码锁 + Keystore 加密；隐藏模式 pm hide + 设备管理员防卸载；支持 Shizuku/Root/Dhizuku；TamperGuard 签名校验 + Hook 框架检测。':
      'Argon2id password lock + Keystore encryption; hidden mode via pm hide + device-admin anti-uninstall; Shizuku/Root/Dhizuku; TamperGuard signature check + hook-framework detection.',
    '常驻保活': 'Keep-alive',
    '60 秒心跳 AlarmManager 唤醒、崩溃自启、快捷设置磁贴一键开关、开机自动拉起悬浮服务。':
      '60-second AlarmManager heartbeat, auto-restart after crashes, a quick-settings tile, and auto-start on boot.',
    /* 隐私 */
    '纯本地与隐私': 'Local & private', '一句话：不联网，数据只在你的手机上': 'In one line: no network — your data stays on your phone',
    '应用本体不申请任何网络权限，没有联网能力，更没有服务器。断网、飞行模式，全部功能照常运行。':
      'The app requests no network permission at all: no connectivity, no server. In airplane mode everything still works.',
    '网络权限': 'Network permissions', '广告 / 追踪 SDK': 'Ad / tracking SDKs', '离线本地处理': 'Processed locally',
    '内置终端命令': 'Terminal commands', '种内置颜文字': 'Built-in kaomoji', '级发送兜底': 'Send fallbacks',
    '种运行模式': 'Run modes',
    '数据不出设备': 'Data never leaves', '所有文本读取、规则变换、发送触发全部在设备本地内存完成，处理完即丢弃，不留存、不上传。':
      'All reading, transforming and sending happens in local memory — discarded right after, never stored or uploaded.',
    '权限最小化': 'Minimal permissions',
    '无障碍仅用于读写当前输入框并触发发送，不读密码框；悬浮窗仅显示按钮；所有权限可随时撤销。':
      'Accessibility only reads/writes the focused input box and triggers send — never password fields; the overlay only shows the ball; revoke anytime.',
    '开源可审计': 'Open & auditable',
    '项目完全开源，任何一条权限、任何一行代码你都可以查看。你看到的就是全部代码。':
      'The project is fully open source: every permission and every line of code is visible. What you see is all of it.',
    /* FAQ */
    '常见问题': 'FAQ', '先问后用，心里有数': 'Ask first, use with confidence',
    '需要 Root 吗？': 'Do I need root?',
    '不需要。基础模式仅需悬浮窗 + 无障碍权限即可使用；想要「静默修改」等增强功能，装一个 Shizuku（免 Root）就行。':
      'No. Basic mode only needs overlay + accessibility permissions. For extras like silent edit, install Shizuku (no root required).',
    '微信能用吗？': 'Does it work with WeChat?',
    '微信目前还在适配中——它对无障碍改写有限制。NekoType 会自动尝试用 Shizuku 静默注入兜底，但部分场景可能仍需手动点悬浮球。':
      'WeChat is still being adapted — it restricts accessibility rewrites. NekoType automatically falls back to silent Shizuku injection, but some cases may still need a manual ball tap.',
    '会读取我的聊天记录吗？': 'Does it read my chat history?',
    '不会。NekoType 只读取当前聚焦输入框里的文本，不扫描、不记录、不存储聊天内容，处理完即丢弃。应用本身也没有任何联网能力。':
      'No. NekoType only reads the text in the currently focused input box — it never scans, records or stores chats, and discards everything after processing. The app has no network capability at all.',
    '篡改键盘模式会把后缀叠成「喵喵喵」吗？': 'Will keyboard-rewrite stack suffixes into “喵喵喵”?',
    '不会。增量原文算法会记录你的真实输入和上次写回内容，只把新增部分并入原文后重新变换一次，连续打字后缀也只出现一次。':
      'No. The incremental source algorithm tracks your real input and the last written-back text, merging only the new part and re-transforming once — so the suffix appears exactly once.',
    '有几种运行模式？启动有动画吗？': 'How many run modes? Is there a startup animation?',
    '三种互斥模式：悬浮球（点一下改写发送）、篡改键盘（打字即自动改）、断句追加（标点结尾才改）。启动时有图标弹性弹出 + 标题淡入的动画，1 秒进入首页。':
      'Three mutually exclusive modes: floating ball (tap to rewrite and send), keyboard rewrite (as you type), punctuation (only at sentence end). On launch the icon springs in and the title fades in — home screen in 1 second.',
    '耗电吗？': 'Does it drain battery?',
    '无障碍事件监听是系统级轻量回调，无轮询、无常驻网络，耗电可忽略。配合关闭电池优化白名单，后台常驻更稳。':
      'Accessibility event listening is a lightweight system callback — no polling, no persistent network, negligible battery use. Whitelisting it against battery optimization keeps it alive more reliably.',
    '如何彻底停用？': 'How do I fully disable it?',
    'App 内关闭「启动服务」，并在系统设置中撤销无障碍 / 悬浮窗权限即可；卸载即清除全部本地数据，不留痕迹。':
      'Turn off “Start service” in the app and revoke accessibility / overlay permissions in system settings. Uninstalling clears all local data with no trace.',
    /* CTA */
    '现在，让悬浮球接管你的输入与发送': 'Now let the floating ball take over your typing and sending',
    '免费 · 开源 · 完全离线。装上它，让文本处理变得自动、可控、安静。':
      'Free · open source · fully offline. Install it and make text processing automatic, controllable and quiet.',
    '备用下载 · 飞机盘': 'Mirror · FeijiPan', '全部版本': 'All releases',
    '仅限本人设备、合法合规的个人用途，禁止用于骚扰、诈骗、冒充他人等非法用途。':
      'For your own device and lawful personal use only. Harassment, fraud, impersonation and other illegal uses are prohibited.',
    /* 页脚 */
    '悬浮球常驻屏幕边缘，三种运行模式 + 系统级增强，文本处理一键到底。':
      'A floating ball on the edge of your screen: three run modes, system-level boost, text processing in one tap.',
    '项目': 'Project', 'GitHub 仓库': 'GitHub repo', 'Releases 下载': 'Releases', 'Issues 反馈': 'Issues',
    '构建说明': 'Build guide', '社区': 'Community', 'QQ 频道': 'QQ channel', '法律': 'Legal',
    '无网络权限 · 无服务器': 'No network permission · No server',
    '© 2026 NekoType · 由 NekoType 团队诚意打造': '© 2026 NekoType · Crafted by the NekoType team',
    '本站基于开源 README 与品牌资源由 NekoType 团队诚意打造':
      'Built from the open-source README and brand assets by the NekoType team',
    /* 语言菜单 */
    '语言': 'Language', '跟随系统': 'Follow system',
    /* 无障碍属性文案 */
    'NekoType 首页': 'NekoType home', '主导航': 'Main navigation',
    '切换主题': 'Toggle theme', '切换亮/暗主题': 'Switch light/dark theme',
    /* 联系方式 */
    'QQ 群 · 1007865515': 'QQ group · 1007865515', '邮箱 · TR114512@qq.com': 'Email · TR114512@qq.com',
    /* 动态文案（JS 生成，%s 为占位） */
    '已应用「%s」预设': 'Preset “%s” applied',
    '已复制 QQ 群号：%s': 'QQ group copied: %s',
    'QQ 群号：%s': 'QQ group: %s'
  };

  /* ---------- 3) 引擎 ---------- */
  const LANG_KEY = 'neko-lang';
  const SKIP = { SCRIPT: 1, STYLE: 1, CANVAS: 1, NOSCRIPT: 1 };
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  let cache = new WeakMap();
  let applied = new WeakMap();
  let attrCache = new WeakMap();
  let current = 'zh-Hans';

  function toHant(str) {
    let s = str;
    for (let i = 0; i < WORD_FIX.length; i++) s = s.split(WORD_FIX[i][0]).join(WORD_FIX[i][1]);
    return s.replace(/[\u4e00-\u9fff]/g, function (c) { return S2T[c] || c; });
  }
  function zh(s) { return /[\u4e00-\u9fff]/.test(s); }

  /* 供 JS 动态文案使用：nekoT('今日变换 3 次') */
  window.nekoT = function (s) {
    if (!zh(s)) return s;
    if (current === 'en') return EN[s] || s;
    if (current === 'hant') return toHant(s);
    return s;
  };

  function convert(raw) {
    const lead = /^\s/.test(raw), trail = /\s$/.test(raw);
    let core = raw.trim();
    let out;
    if (current === 'en') out = EN[core] || core;
    else if (current === 'hant') out = toHant(core);
    else out = core;
    return (lead ? ' ' : '') + out + (trail ? ' ' : '');
  }

  window.nekoApplyLang = function () {
    /* 文本节点 */
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        const p = n.parentNode;
        if (!p || SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
        if (!zh(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      /* 若节点内容被 JS 换成了新文本（与上次写入的不同）且含中文，则视为新的原文 */
      if (!cache.has(n) || (n.nodeValue !== applied.get(n) && zh(n.nodeValue))) cache.set(n, n.nodeValue);
      const orig = cache.get(n);
      if (!zh(orig)) continue;
      const next = convert(orig);
      if (n.nodeValue !== next) n.nodeValue = next;
      applied.set(n, next);
    }
    /* 属性 */
    document.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(function (el) {
      let store = attrCache.get(el);
      if (!store) { store = {}; attrCache.set(el, store); }
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        if (!store[a]) store[a] = el.getAttribute(a);
        const orig = store[a];
        if (!zh(orig)) return;
        const next = current === 'en' ? (EN[orig] || orig) : (current === 'hant' ? toHant(orig) : orig);
        if (el.getAttribute(a) !== next) el.setAttribute(a, next);
      });
    });
    /* 文档标题 */
    if (!window.__nekoTitle) window.__nekoTitle = document.title;
    document.title = current === 'en' ? EN[window.__nekoTitle] || window.__nekoTitle
      : current === 'hant' ? toHant(window.__nekoTitle) : window.__nekoTitle;
    document.documentElement.setAttribute('lang',
      current === 'en' ? 'en' : current === 'hant' ? 'zh-Hant' : 'zh-CN');
    /* 切换按钮上的当前语言标记 */
    const code = { 'zh-Hans': '简', 'zh-Hant': '繁', 'en': 'EN' }[current] || '简';
    document.querySelectorAll('[data-lang-code]').forEach(function (el) { el.textContent = code; });
    document.querySelectorAll('#langMenu [data-lang]').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.lang === window.nekoLangMode);
    });
  };

  function detectSystem() {
    const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'zh-CN'];
    for (let i = 0; i < list.length; i++) {
      const l = String(list[i]).toLowerCase();
      if (l.indexOf('zh') === 0) {
        if (/hant|tw|hk|mo/.test(l)) return 'zh-Hant';
        return 'zh-Hans';
      }
      if (l.indexOf('en') === 0) return 'en';
    }
    return 'zh-Hans';
  }

  window.setNekoLang = function (mode) {
    window.nekoLangMode = mode;
    try { localStorage.setItem(LANG_KEY, mode); } catch (e) {}
    current = mode === 'system' ? detectSystem() : mode;
    window.nekoApplyLang();
  };

  let saved = 'system';
  try { saved = localStorage.getItem(LANG_KEY) || 'system'; } catch (e) {}
  window.setNekoLang(saved);

  /* 切换器接线 + 动态内容自动跟随语言 */
  document.addEventListener('DOMContentLoaded', function () {
    const picker = document.getElementById('langPicker');
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (picker && btn && menu) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        picker.classList.toggle('open');
        btn.setAttribute('aria-expanded', picker.classList.contains('open') ? 'true' : 'false');
      });
      menu.querySelectorAll('[data-lang]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          window.setNekoLang(b.dataset.lang);
          picker.classList.remove('open');
        });
      });
      document.addEventListener('click', function () { picker.classList.remove('open'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') picker.classList.remove('open'); });
    }
    window.nekoApplyLang();

    const mo = new MutationObserver(function () {
      clearTimeout(mo._t);
      mo._t = setTimeout(window.nekoApplyLang, 30);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
