# 魔珐星云 SDK Skills

本仓库收集了魔珐星云相关 AI Agent 技能（Skills），支持通过 [Agent Skills](https://github.com/agentskills/agentskills)安装使用。

## 技能列表

| 技能 | 描述 |
|------|------|
| [xingyun-sdk](./skills/xingyun-sdk/SKILL.md) | 魔珐星云具身交互智能体 Web SDK 开发助手 — 覆盖端到端 SDK（`XingyunAvatarAgent`，入口 `@xmov/avatar/agent`，ASR + LLM 闭环）与旧版渲染 SDK（`XmovAvatar`，入口 `@xmov/avatar`），内置两套接入文档（`e2esdk-docs` / `sdk-docs`）及升级迁移指南 |

## 命令行(CLI)安装

### 安装全部技能

#### 从GitHub安装

```bash
npx skills add https://github.com/XmovAI/skills
```

#### 从Gitee安装

```bash
npx skills add https://gitee.com/xmov/skills
```

### 安装指定技能

#### 从GitHub安装

```bash
npx skills add https://github.com/XmovAI/skills --skill xingyun-sdk
```

#### 从Gitee安装

```bash
npx skills add https://gitee.com/xmov/skills --skill xingyun-sdk
```

## 手动安装

通过将技能目录复制粘贴到本地技能目录即可完成安装，无需安装任何依赖。

Claude Code 的技能目录分为用户级与项目级两种：

| 安装范围 | 本地技能目录 | 说明 |
|----------|--------------|------|
| 用户级 | `~/.claude/skills/` | 所有项目均可使用 |
| 项目级 | `<项目根目录>/.claude/skills/` | 仅当前项目使用 |

以安装 `xingyun-sdk` 为例：

**方式一：命令行复制**

```bash
# 用户级安装：复制到 ~/.claude/skills/
mkdir -p ~/.claude/skills
cp -r skills/xingyun-sdk ~/.claude/skills/

# 项目级安装：复制到当前项目根目录
mkdir -p .claude/skills
cp -r skills/xingyun-sdk .claude/skills/
```

也可直接使用文件管理器将 `skills/xingyun-sdk` 目录拖拽/复制到目标技能目录。

**方式二：使用软链接（便于跟随本仓库更新）**

```bash
ln -s "$(pwd)/skills/xingyun-sdk" ~/.claude/skills/xingyun-sdk
```

安装完成后，重启 Claude Code（或新开会话）即生效，可通过 `/skills` 命令确认技能是否被识别。

> 其他兼容 Agent 的原理相同：将技能目录放入对应产品的技能目录即可（如 Cursor、Cline 等，路径各不相同，请查阅对应文档）。

## 许可

MIT License。详见 [LICENSE](./LICENSE)。
