# 魔珐星云 SDK Skills

本仓库收集了魔珐星云（XmovAI）AI Agent 技能（Skills），支持各大主流 AI Coding Agent 工具安装使用。

## 技能列表

| 技能 | 描述 |
|------|------|
| [xingyun-sdk](./skills/xingyun-sdk/SKILL.md) | 魔珐星云具身交互智能体 Web SDK 开发助手 — 覆盖端到端 SDK（`XingyunAvatarAgent`，入口 `@xmov/avatar/agent`，ASR + LLM 闭环）与旧版渲染 SDK（`XmovAvatar`，入口 `@xmov/avatar`），内置两套接入文档（`e2esdk-docs` / `sdk-docs`）及升级迁移指南 |

---

## 安装指南 (Installation)

不同 AI Agent 工具（Harness）的安装方式略有不同。如果使用多个工具，请为每个工具单独安装本仓库的技能。

### Claude Code

Claude Code 支持原生插件安装与通用技能安装两种方式：

```bash
/plugin install https://github.com/XmovAI/skills
```

---

### Antigravity

从本仓库直接安装插件：

```bash
agy plugin install https://github.com/XmovAI/skills
```

Antigravity 会自动加载该插件及其技能（位于 `~/.gemini/config/plugins/xingyun-skills`），新会话中即刻生效。重新运行相同命令即可完成更新。

**常用管理命令：**
```bash
# 查看已安装插件
agy plugin list

# 卸载插件
agy plugin uninstall xingyun-skills
```

---

### Codex App

本仓库提供 Codex marketplace 清单（`.agents/plugins/marketplace.json`）。使用与桌面客户端相同配置目录的 Codex CLI，按下一节注册 marketplace 并安装插件，然后在桌面客户端的 **Plugins** 中检查 `xingyun-skills`，开启新会话使用。

如果客户端尚未显示插件，请重启客户端。无需 CLI 的方式见下方「Codex 手动安装」。

---

### Codex CLI

在系统终端中注册 marketplace，再安装插件：

```bash
codex plugin marketplace add https://github.com/XmovAI/skills
codex plugin add xingyun-skills@xingyun-skills
```

也可以注册源后，在 Codex 会话中输入 `/plugins`，切换到 `xingyun-skills` marketplace 后安装。

本地开发时，先进入本仓库根目录，将第一条命令替换为 `codex plugin marketplace add .`。如果当前版本没有 `codex plugin` 命令，请使用下方手动安装方式。

安装后开启新会话，用以下请求验证技能可调用且能读取随附文档：

```text
$xingyun-skills:xingyun-sdk 根据随附文档说明 XingyunAvatarAgent 的最小接入步骤，并列出读取的文档路径。
```

### Codex 手动安装

Codex 支持用户级 `~/.agents/skills/` 和项目级 `<目标项目>/.agents/skills/`。以下命令均在本仓库根目录执行；同一范围内选择插件安装或手动安装中的一种，避免重复加载。

```bash
# 用户级：先确认目标目录尚不存在，再复制整个技能及随附文档
mkdir -p ~/.agents/skills
cp -R skills/xingyun-sdk ~/.agents/skills/xingyun-sdk
```

或者仅执行软链接安装，后续可通过 `git pull` 更新本仓库内容：

```bash
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills/xingyun-sdk" ~/.agents/skills/xingyun-sdk
```

项目级安装时，将目标目录改为目标项目的 `.agents/skills/xingyun-sdk`，并先创建其父目录。验证时使用技能选择器中的实际名称：复制安装为 `$xingyun-sdk`；软链接到本插件仓库时，Codex 可能沿用 `$xingyun-skills:xingyun-sdk`。如果技能未出现，请重启客户端。

复制安装需要重新复制才能更新；软链接直接读取本仓库的文件。插件安装使用缓存副本，修改本仓库后需通过插件管理流程更新或重新安装。

参考：[Codex 技能说明](https://learn.chatgpt.com/docs/build-skills)、[插件与 marketplace 说明](https://developers.openai.com/plugins/build/plugins)。

---

### Cursor

在 Cursor Agent 对话框中输入：

```text
/add-plugin https://github.com/XmovAI/skills
```

---

### Devin CLI

从本仓库安装插件：

```bash
devin plugins install XmovAI/skills
```

更新至最新版本：

```bash
devin plugins update xingyun-skills
```

---

### Factory Droid

注册市场并安装插件：

```bash
# 注册仓库源
droid plugin marketplace add https://github.com/XmovAI/skills

# 安装插件
droid plugin install xingyun-skills@xingyun-skills
```

---

### Gemini CLI

安装扩展：

```bash
gemini extensions install https://github.com/XmovAI/skills
```

更新扩展：

```bash
gemini extensions update xingyun-skills
```

---

### GitHub Copilot CLI

安装插件：

```bash
# 注册仓库源
copilot plugin marketplace add https://github.com/XmovAI/skills

# 安装插件
copilot plugin install xingyun-skills
```

---

### Grok Build CLI

在终端界面中打开插件市场并安装：

```bash
/marketplace
```

搜索并安装 `xingyun-skills` 或直接输入仓库地址安装。

---

### Kimi Code

直接通过仓库地址安装：

```bash
/plugins install https://github.com/XmovAI/skills
```

---

### OpenCode

OpenCode 使用自身独立的插件/技能安装机制。在 OpenCode 对话中输入：

```text
Fetch and follow instructions from https://raw.githubusercontent.com/XmovAI/skills/main/.opencode/INSTALL.md
```

---

### Pi

作为 Pi 包从本仓库安装：

```bash
pi install git:github.com/XmovAI/skills
```

---

### Qwen Code

从本仓库安装插件：

```bash
qwen extensions install https://github.com/XmovAI/skills
```

更新插件：

```bash
qwen extensions update xingyun-skills
```

---

### Hermes Agent

作为 Hermes 插件从本仓库安装：

```bash
hermes plugins install XmovAI/skills --enable
```

安装完成后请重启当前会话。

---

### Muse

通过克隆安装：

```bash
git clone https://github.com/XmovAI/skills.git
muse plugins install ./skills
muse plugins approve xingyun-skills
```

后续更新插件：

```bash
muse plugins update xingyun-skills
```

---

### 通用命令行安装 (Agent Skills CLI)

如果您在国内网络环境访问 GitHub 较慢，支持通过 Gitee 镜像仓库快速安装到当前环境：

#### 从 GitHub 安装
```bash
# 安装全部技能
npx skills add https://github.com/XmovAI/skills

# 安装指定技能
npx skills add https://github.com/XmovAI/skills --skill xingyun-sdk
```

#### 从 Gitee 安装
```bash
# 安装全部技能
npx skills add https://gitee.com/xmov/skills

# 安装指定技能
npx skills add https://gitee.com/xmov/skills --skill xingyun-sdk
```

---

### 手动安装 (本地复制 / 软链接)

无需任何额外依赖，直接将技能目录放入各工具的本地技能目录即可。

以 Claude Code 为例：

| 安装范围 | 本地技能目录 | 说明 |
|----------|--------------|------|
| 用户级 | `~/.claude/skills/` | 所有项目均可使用 |
| 项目级 | `<项目根目录>/.claude/skills/` | 仅当前项目使用 |

**方式一：命令行复制**
```bash
# 用户级安装：复制到 ~/.claude/skills/
mkdir -p ~/.claude/skills
cp -r skills/xingyun-sdk ~/.claude/skills/

# 项目级安装：复制到当前项目根目录
mkdir -p .claude/skills
cp -r skills/xingyun-sdk .claude/skills/
```

**方式二：软链接（便于跟随本仓库实时更新）**
```bash
ln -s "$(pwd)/skills/xingyun-sdk" ~/.claude/skills/xingyun-sdk
```

> 其他 Agent 的原理相同：只需将 `skills/xingyun-sdk` 软链接或复制到对应产品的配置目录（如 Cursor 的 `.cursor/skills/`、Windsurf 的 `.windsurf/skills/` 等）。

---

## 许可

MIT License。详见 [LICENSE](./LICENSE)。

## 文档维护与验证

技能按端到端与渲染入口组织接入说明，公共约定见 [SDK 接入约定](skills/xingyun-sdk/references/sdk-usage.md)。以下命令仅用于维护仓库，测试依赖由锁文件固定以便复现。

```bash
npm ci --ignore-scripts
npm test
# 发布前可额外比较安装入口与指定基准提交是否一致
node scripts/validate-docs.mjs --baseline b4a08d1
```

`npm test` 检查文档索引、本地链接和插件清单，并提取 `<!-- validate:ts -->`、`tsx`、`vue`、`html` 标记后的代码块，在 TypeScript Bundler 与传统 Node 解析模式下对仓库锁定的 SDK 测试依赖执行类型/语法检查。回归用例保护已纠正的签名边界；不会运行示例中的真实 SDK 连接。新增关键示例应添加标记，不要另抄一份测试代码。

发布前还需按目标环境验收初始化、麦克风授权/释放、组件卸载、断线和服务迁移。静态检查与 mock 测试不替代真实 Gateway、浏览器和设备测试。
