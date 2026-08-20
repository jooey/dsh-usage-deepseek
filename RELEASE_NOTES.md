# Release Notes

## v1.1.3

**修复：窄窗口下输入框读条覆盖左侧 Full access 下拉框**

- 读条宽度不再使用固定 `max-width` 上限，改为**实测适配**：测量输入框工具行的真实剩余空间（行内宽 − 行间隔 − 左侧工具组 − 右侧模型选择/上下文计量/发送按钮），把读条精确限制在剩余宽度内
- 空间足够时完整显示；空间紧张时平滑截断；剩余不足 80px 时收起为仅图标——任何窗口宽度下都不再向左溢出
- 通过 `ResizeObserver` 监听行与右侧组：窗口缩放、模型切换、发送按钮出现/消失时自动重算（`useLayoutEffect` 首测在绘制前完成，无闪烁）

**English**: chip width is now measured to fit the composer row's actual leftover space instead of a fixed max-width cap — full text when it fits, smooth truncation when tight, icon-only below 80px, so it never overlaps the left "Full access" dropdown at any width; refit is driven by ResizeObserver on the row and the trailing group.

## v1.1.2

**极简 DSH 用量监控 · 统一格式**

- README 全面重写：中英双语，主打「极简 DSH 用量监控」，与五插件家族（OpenCode Go / DeepSeek / MiniMax / Kimi / GLM）文案统一，移除开发成本统计
- package 元数据补齐（author / repository / keywords）、smoke test 环境变量回落

**English**: bilingual README rewritten under the unified "minimal DSH usage monitor" family branding; dev-cost stats removed; package metadata completed.

## v1.1.1

- README：修正波峰/波谷图标示意（波谷使用灰色圆圈表示灰色鲸鱼）
- README：新增开发成本（透明记录）统计

## v1.1.0

- 新增波峰/波谷显示：北京时间 09:00-12:00、14:00-18:00 为高峰，其余为空闲时段（价格为高峰的 50%）
- 波峰时右下角鲸鱼图标显示为 DeepSeek 蓝色，并标注 `Peak`
- 波谷时右下角鲸鱼图标保持主题色，并标注 `Off-peak 50%`
- `/usage-deepseek` 报告新增 `Pricing:` 行，显示当前波峰/波谷状态

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
