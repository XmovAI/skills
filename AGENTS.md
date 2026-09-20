# 魔珐星云 SDK Skills — Agent 指引

本仓库包含魔珐星云（XmovAI）AI Agent 技能库与接入文档。

## 技能索引

- **xingyun-sdk**（位于 [skills/xingyun-sdk](file:///home/mypal/Codes/skills/skills/xingyun-sdk/SKILL.md)）：
  魔珐星云具身交互智能体 Web SDK 开发助手。覆盖端到端 SDK（`XingyunAvatarAgent`，入口 `@xmov/avatar/agent`）与旧版渲染 SDK（`XmovAvatar`，入口 `@xmov/avatar`）。
  详细文档位于：
  - `skills/xingyun-sdk/e2esdk-docs/`（端到端交互智能体 SDK 文档）
  - `skills/xingyun-sdk/sdk-docs/`（旧版渲染驱动 SDK 文档）

## 开发原则

1. **优先推荐端到端闭环**：新项目默认优先接入 `@xmov/avatar/agent`（`XingyunAvatarAgent`），具备感知-认知-表达完整交互闭环。
2. **查阅文档后再回答**：严格基于技能目录内的官方文档回答 SDK 参数、接口及生命周期，避免臆造配置项。
