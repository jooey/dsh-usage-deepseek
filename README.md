<p align="center">
  <img src="https://img.shields.io/npm/v/dsh-usage-deepseek" alt="npm version" />
  <img src="https://img.shields.io/npm/dw/dsh-usage-deepseek" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/dsh-usage-deepseek" alt="license" />
</p>

<h1 align="center">dsh-usage-deepseek</h1>

<p align="center">
  <strong>极简 DSH 用量监控 · Minimal DSH usage monitor</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-usage-deepseek">npm</a>
  · <a href="https://github.com/jooey/dsh-usage-deepseek">GitHub</a>
  · <a href="#install-install">Install</a>
</p>

---

**中文** · [English](#english)

把 DeepSeek 账户余额放进 DSH 对话界面：输入 `/usage-deepseek` 查看完整报告；选中 DeepSeek 模型时，输入框右下角常驻余额读条，每分钟自动刷新，点击直达平台页面。切到其他模型自动隐藏。

- **右下角读条**：DeepSeek 鲸鱼图标 + 余额，波峰时段显示蓝色 + `Peak`，波谷显示 `Off-peak 50%`
- **`/usage-deepseek` 命令**：各币种总余额 + 赠送额/充值额明细 + 当前计价时段
- **密钥安全**：只在 DSH 主机端解析，绝不进浏览器

## 系列插件 / Family

同一套极简监控，覆盖五家服务商，格式统一（`Rolling x% (倒计时) · Weekly …`）：

| 插件 | 服务商 | 监控内容 |
|---|---|---|
| `dsh-usage-opencode-go` | OpenCode Go | Rolling / Weekly / Monthly 配额 |
| `dsh-usage-deepseek` | DeepSeek | 账户余额 + 波峰/波谷 |
| `dsh-usage-minimax-cn` | MiniMax Coding Plan | coding / video 分服务配额 |
| `dsh-usage-kimi-cn` | Kimi Coding Plan | Rolling / Weekly 配额 |
| `dsh-usage-glm-cn` | Z.ai GLM Coding Plan | Rolling / Weekly / MCP 配额 |

## 先决条件 / Prerequisites

- 已安装 **DSH**（Node.js >= 20）：`npm install -g @deepseek-ai/dsh`
- **DeepSeek API Key**，写入 `~/.dsh/.credentials.yaml`：

```yaml
DEEPSEEK_API_KEY: <你的 key>
```

（或 `export DEEPSEEK_API_KEY=<key>`）

## Install 安装

```bash
cd ~/.dsh/profiles
npm install dsh-usage-deepseek --save --registry=https://registry.npmjs.org
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 追加：

```yaml
- insert:
    - id: deepseek-usage
      name: 'dsh-usage-deepseek'
```

重启 / 刷新 web GUI 生效。

<details>
<summary>其他安装方式（git / 一键脚本 / 手动）</summary>

```bash
# git 安装
dsh plugin --profile web add github:jooey/dsh-usage-deepseek

# 一键脚本
./install.sh        # Linux / macOS
.\install.ps1       # Windows
```

</details>

## Usage 使用

- 对话里输入 **`/usage-deepseek`** → 完整余额报告
- 选中 **DeepSeek** 模型 → 右下角读条出现

```text
/usage-deepseek 输出：

DeepSeek (deepseek-official) usage

Status: available
CNY: total ¥133.58

Pricing: Peak · Beijing 09:00-12:00, 14:00-18:00
```

## Troubleshooting

- `DEEPSEEK_API_KEY is not configured` —— 检查 `~/.dsh/.credentials.yaml`
- 读条不显示 —— 确认当前选中的是 DeepSeek 模型，再硬刷新（`Ctrl+Shift+R`）

---

## English

Put your DeepSeek account balance right inside the DSH conversation UI: type `/usage-deepseek` for a full report, and while a DeepSeek model is selected, a live balance chip sits in the bottom-right of the composer — auto-refreshed every minute, click through to the platform page. Hides itself automatically on other models.

- **Composer chip**: DeepSeek whale icon + balance; blue `Peak` during Beijing peak hours, `Off-peak 50%` otherwise
- **`/usage-deepseek` command**: per-currency totals + granted/topped-up split + current pricing window
- **Key safety**: resolved host-side only, never inlined into the browser

## Prerequisites

- **DSH** installed (Node.js >= 20): `npm install -g @deepseek-ai/dsh`
- A **DeepSeek API key** in `~/.dsh/.credentials.yaml`:

```yaml
DEEPSEEK_API_KEY: <your key>
```

## Install

```bash
cd ~/.dsh/profiles
npm install dsh-usage-deepseek --save --registry=https://registry.npmjs.org
```

Then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: deepseek-usage
      name: 'dsh-usage-deepseek'
```

Restart / refresh the web GUI to activate.

MIT License · 欢迎 ⭐ Star！
