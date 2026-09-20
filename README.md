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

- 在 Codex 桌面客户端中，点击侧边栏的 **Plugins**。
- 点击右上角添加插件，输入本仓库地址：`https://github.com/XmovAI/skills`。
- 点击添加并按提示完成安装。

---

### Codex CLI

打开插件管理界面：

```bash
/plugins
```

输入 `https://github.com/XmovAI/skills` 安装插件。

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
