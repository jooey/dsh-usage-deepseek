# Release Notes

## v1.0.1

- README 顶部加入 Quick start（`dsh plugin --profile web add dsh-usage-deepseek`）和 GitHub/npm 链接
- Git 安装链接改为 `jooey/dsh-usage-deepseek`

## v1.0.0

DSH 插件首发：在对话里查看你的 DeepSeek provider 账户余额。

**功能**

- `/usage-deepseek` 命令：完整余额报告（状态 + 各币种 Total，granted/topped-up 非 0 时才显示）
- 输入框右下角常驻读条：DeepSeek 鲸鱼图标 + `Balance ¥x`，每分钟自动刷新
- 读条只在当前会话选中 **DeepSeek** provider（`deepseek-official`）时显示，切到其他模型自动隐藏
- 读条可点击，打开 DeepSeek 平台用量页
- 密钥只在 DSH 主机端解析，不进浏览器

**安装**

```bash
cd ~/.dsh/profiles
npm install dsh-usage-deepseek --save --registry=https://registry.npmjs.org
```

然后在 `cordis.patch.yml` 里 insert `deepseek-usage` 条目（见 README）。
