<p align="center">
  <img src="https://img.shields.io/npm/v/dsh-usage-deepseek" alt="npm version" />
  <img src="https://img.shields.io/npm/dw/dsh-usage-deepseek" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/dsh-usage-deepseek" alt="license" />
  <img src="https://img.shields.io/github/stars/jooey/dsh-usage-deepseek" alt="GitHub stars" />
</p>

<h1 align="center">dsh-usage-deepseek</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-usage-deepseek">npm package</a>
  ·
  <a href="https://github.com/jooey/dsh-usage-deepseek">GitHub repo</a>
  ·
  <a href="https://github.com/jooey/dsh-usage-deepseek/releases">Releases</a>
  ·
  <a href="#install">Install</a>
  ·
  <a href="#usage">Usage</a>
</p>

<p align="center">
  <strong>🚀 Quick start（一条命令装到 DSH）</strong>
</p>

```bash
dsh plugin --profile web add dsh-usage-deepseek
```

> 完整步骤（含 DSH 安装、patch 注册、源码安装）见下方 <a href="#install">Install</a>。

一个用于 **DSH（DeepSeek Harness）** 的插件：把 **DeepSeek 官方 API 账户余额**直接显示在对话里，并且**只在当前会话选中 DeepSeek provider（`deepseek-official`）时展示**；切到其他模型/供应商时自动隐藏。

- 输入 **`/usage-deepseek`** —— 打印完整账户余额报告。
- 输入框右下角常驻一个小读条 —— DeepSeek 鲸鱼图标 + `Balance ¥x` 余额，每分钟自动刷新，点击打开 DeepSeek 平台用量页。
- 读条只在模型选择器选中 **DeepSeek** provider 时出现。
- 显示波峰/波谷：高峰时段（北京时间 09:00-12:00、14:00-18:00）显示**蓝色鲸鱼 + Peak**；其余空闲时段为高峰价格的 50%，显示**主题色鲸鱼 + Off-peak 50%**。

## DeepSeek provider 能提供什么样的用量统计？

我们分析了 DeepSeek 官方 API 的可用数据面：

| 数据面 | 是否可用 | 说明 |
|---|---|---|
| `GET https://api.deepseek.com/user/balance` | ✅ 可用 | 账户余额：`is_available` + `balance_infos[]`（`currency`、`total_balance`、`granted_balance`、`topped_up_balance`） |
| 当日 cost / 按日 cost | ❌ 官方 API 无此端点 | 平台网页后台有私有接口 `/api/v0/usage/by_api_key/cost`，但它要求**平台登录后的 Token**，不认 `DEEPSEEK_API_KEY`，所以本插件不接入 |
| Rolling / Weekly / Monthly 配额窗口（像 OpenCode Go 那样的百分比用量） | ❌ 无公开端点 | DeepSeek 官方 API 不提供按窗口统计的用量百分比 |
| 按模型/按日 token 用量明细 | ❌ 无公开端点 | 仅平台后台可见 |
| 订阅到期 / 重置时间 | ❌ 无公开端点 | 仅平台后台可见 |

因此本插件展示的“用量/额度统计”就是 DeepSeek 官方 **账户余额**：状态（可用/不可用）和各币种总余额；赠送额 / 充值额只在非 0 时出现在 `/usage-deepseek` 报告里（granted 为 0 时 total 与 topped-up 相同，重复展示没有意义）。密钥通过 harness 凭据层（`~/.dsh/.credentials.yaml` 或环境变量里的 `DEEPSEEK_API_KEY`）**只在主机端解析**，绝不会进浏览器、不会被打包进前端代码。

> 波峰/波谷说明：高峰时段为北京时间 09:00-12:00、14:00-18:00；其余为空闲时段，价格为高峰时段的 50%。readout 会随北京时间实时切换（无需关心本机时区）。

## 截图 / 效果

```text
DeepSeek (deepseek-official) usage

Status: available
CNY: total ¥133.58

Pricing: Peak · Beijing 09:00-12:00, 14:00-18:00

DeepSeek platform: https://platform.deepseek.com/usage
```

输入框底部工具行（模型选择器左侧，且仅选中 DeepSeek 时）:

```text
波峰: [ 🔵 蓝色鲸鱼 ] Balance ¥133.58 · Peak
波谷: [ 🐋 主题色鲸鱼 ] Balance ¥133.58 · Off-peak 50%
```

## 第 0 步：安装 DSH

还没有 DSH？先全局安装启动器（Node.js >= 20）：

```bash
npm install -g @deepseek-ai/dsh
dsh --version
```

首次使用会自动初始化 `web` profile 到 `~/.dsh/profiles/web`（Windows：`%USERPROFILE%\.dsh\profiles\web`）。

## 先决条件

- 已安装 **DSH** 并使用 `web` profile（见上一步）。
- 拥有 **DeepSeek API Key**（`DEEPSEEK_API_KEY`）。
  - 到 <https://platform.deepseek.com> 申请，然后写入 `~/.dsh/.credentials.yaml`：

    ```yaml
    DEEPSEEK_API_KEY: <你的 key>
    ```

    （也可以直接 `export DEEPSEEK_API_KEY=<key>`）

## Install

### 方式 A：npm 安装（推荐）

```bash
cd ~/.dsh/profiles
npm install dsh-usage-deepseek --save --registry=https://registry.npmjs.org
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 中追加：

```yaml
- insert:
    - id: deepseek-usage
      name: 'dsh-usage-deepseek'
```

### 方式 B：直接给 DSH 传 GitHub 链接（git 安装）

```bash
dsh plugin --profile web add github:jooey/dsh-usage-deepseek

# 或完整 URL 形式（任选其一）
dsh plugin --profile web add https://github.com/jooey/dsh-usage-deepseek.git
```

> 注意：仓库必须是**公开**的；安装器会直接以仓库根目录的
> `package.json`（名字必须为 `dsh-usage-deepseek`）建链安装。
> 本仓库是纯 JS 包、无构建步骤，所以 git 安装可以直接用。

安装后同样要在 `~/.dsh/profiles/web/cordis.patch.yml` 里追加：

```yaml
- insert:
    - id: deepseek-usage
      name: 'dsh-usage-deepseek'
```

### 方式 C：一键脚本

仓库自带安装脚本（Windows PowerShell / Linux·macOS bash）：

```powershell
# Windows
.\install.ps1
```

```bash
# Linux / macOS
./install.sh
```

它会自动拷贝文件并写入 profile patch。

### 方式 D：源码手动安装

```powershell
# 1. 拷贝包到 profile 的 node_modules fallback
Copy-Item -Recurse -Force .\dsh-usage-deepseek "$env:USERPROFILE\.dsh\profiles\node_modules\dsh-usage-deepseek"

# 2. 在 $env:USERPROFILE\.dsh\profiles\web\cordis.patch.yml 里追加
#    - insert:
#        - id: deepseek-usage
#          name: 'dsh-usage-deepseek'
```

以下通用步骤（方式 A–D 都要做）：改完 patch 后，**重启 / 刷新** web GUI（该 profile 默认关闭 HMR）。

## Usage

安装后**重启 / 刷新** web GUI：

- 对话里输入 **`/usage-deepseek`** → 完整余额报告。
- 选中 **DeepSeek** provider 的模型 → 输入框右下角显示余额 readout；切到其他 provider 自动隐藏。

### 验证配置（不启动服务）

```powershell
dsh --profile web --dump-config
# 找到：- id: deepseek-usage /  name: dsh-usage-deepseek
```

## 工作原理

| 端 | 文件 | 作用 |
|---|---|---|
| 主机 | `lib/index.js` | Cordis 插件：`/usage-deepseek` 命令 + `deepseekUsage` Typert 远程服务 |
| 主机 | `lib/typert.host.js` | Typert 主机 face 清单（`deepseekUsage/snapshot`） |
| 主机 | `lib/logic.js` | 无依赖纯逻辑（fetch / 格式化） |
| 浏览器 | `lib/client.js` | 挂载远程服务，注册 `conversation.input.right` slot readout；通过 `modelDirectories` 订阅当前模型，仅 `deepseek-official` 时渲染 |
| 浏览器 | `lib/typert.remote-client.js` | Typert 客户端 face 清单 |
| 类型 | `lib/index.d.ts` | 主机 face 类型声明 |

## Troubleshooting

- `DEEPSEEK_API_KEY is not configured` —— 检查 `~/.dsh/.credentials.yaml` 是否已写入 `DEEPSEEK_API_KEY`。
- `DeepSeek balance API returned HTTP 4xx` —— key 被额度接口拒绝；必须是有余额权限的 DeepSeek API key。
- 右下角 readout 不显示 —— 先确认当前选中的模型是 **DeepSeek** provider；若是，再硬刷新浏览器（`Ctrl+Shift+R`）。若控制台报 `Failed to load plugins`，确认包已正确安装、patch 里的 `name` 是 `dsh-usage-deepseek`。

## 为开发者

```bash
# 跑通核心逻辑（读取真实 key）
node test/logic.mjs

# 打包前预览 tarball
npm pack --dry-run

# 发布
npm publish --registry=https://registry.npmjs.org --access public
```

MIT License · 欢迎 ⭐ Star！
