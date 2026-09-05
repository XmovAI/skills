---
name: xingyun-sdk
description: 魔珐星云具身交互智能体 Web SDK 开发助手，覆盖两套接入入口：端到端 SDK（XingyunAvatarAgent，入口 @xmov/avatar/agent，在渲染之上增加文本对话、ASR 语音识别、LLM Brain、具身智能体播报、对话打断、断线恢复，可闭环实现感知-认知-表达的具身交互智能体）与旧版渲染 SDK（XmovAvatar，入口 @xmov/avatar，负责 WebGL 渲染、SSML 播报、行走动画、关键动作、情绪表情、Widget 组件等）。当用户提到数字人、星云、XmovAvatar、XingyunAvatarAgent、SSML、WebGL 渲染、具身驱动、具身交互智能体、具身智能体、语音识别/ASR、LLM/Brain、虚拟人、数字人 SDK、星云平台、行走动画、关键动作、情绪表情、Widget 组件、隐身模式、客户端打断，或任何魔珐星云 3D 数字人开发、接入、配置、调试、从 XmovAvatar 升级迁移相关内容时，都必须使用此技能，即使用户只是想了解如何接入、如何配置、如何调试数字人应用。
compatibility: Designed for Claude Code and similar products
license: MIT
---

# 魔珐星云具身交互智能体 Web SDK 开发助手

本技能为魔珐星云 3D 具身交互智能体 Web SDK 提供文档支持，覆盖两套接入入口：

- **端到端 SDK**（`XingyunAvatarAgent`，入口 `@xmov/avatar/agent`）：新升级的具身交互智能体 SDK，在具身智能体渲染能力之上新增 ASR 语音识别、LLM Brain 文本对话、具身智能体播报、对话打断、状态回调与断线恢复，可闭环完成「感知 → 认知 → 表达」的完整交互。
- **旧版渲染 SDK**（`XmovAvatar`，入口 `@xmov/avatar`）：负责 WebGL 渲染、SSML 播报、行走动画、关键动作、情绪表情、Widget 组件等纯渲染与驱动能力。

`XingyunAvatarAgent` **继承** `XmovAvatar`，两套 API 高度兼容，详见文档集选择与迁移指南。

## 工作流程

当用户提出开发相关问题时：

1. **选择文档集**：按下方「文档集选择（路由）」判断该读 `e2esdk-docs` 还是 `sdk-docs`
2. **匹配文档索引**：在对应文档集的索引表中，按用户问题关键词找到文档路径
3. **加载文档**：使用 Read 工具读取文档完整内容（路径相对于技能目录，如 `e2esdk-docs/1 快速接入/1.2 快速开始.md`）
4. **基于文档回答**：严格依据文档内容回答，不要凭记忆臆断 API、参数或状态取值

> 一次只加载当前问题所需的文档，不要一次性加载所有文档。问题涉及多个模块时按需逐个加载。

## 文档集选择（路由）

| 文档集 | 入口对象 | 定位 | 目录 |
|--------|----------|------|------|
| **`e2esdk-docs`**（默认优先） | `XingyunAvatarAgent`（`@xmov/avatar/agent`） | 端到端具身交互智能体 SDK，渲染 + ASR + LLM 对话闭环 | `e2esdk-docs/` |
| `sdk-docs`（旧版专用） | `XmovAvatar`（`@xmov/avatar`） | 旧版渲染驱动 SDK，渲染 / SSML / 行为状态 | `sdk-docs/` |

**默认优先加载 `e2esdk-docs`。** 只有当检测到用户当前代码实现是基于 `XmovAvatar` 构建的，才引用 `sdk-docs`。

**判定「代码基于 XmovAvatar」的信号**（命中任意一条即改用 `sdk-docs`）：

- 代码出现 `new XmovAvatar(`，或用 `import XmovAvatar from "@xmov/avatar"`（导入路径不含 `/agent` 后缀）、`<script>` 加载 `xmovAvatar@latest.js`
- `gatewayServer` 用旧版地址（以 `/user/v1/ttsa/session` 结尾）

对应地，出现 `new XingyunAvatarAgent(`、`import ... from "@xmov/avatar/agent"`、`<script>` 加载 `xmovAvatar_e2e@latest.js`、或 `gatewayServer` 以 `/ttsa_v2/session` 结尾，即用 `e2esdk-docs`。

> **继承回退**：新版 `e2esdk-docs` 已覆盖大部分继承自 `XmovAvatar` 的能力（SSML 播报、布局与隐身、动作/行走/表情、Widget、打断等，见下文「功能介绍」）。仅当需要旧版专属细节——如完整「动作意图清单」「SSML 标签速查」「运行时配置项」详细字段等——才回退到 `sdk-docs` 对应章节。

## 端到端 SDK 文档索引（`e2esdk-docs`） — 默认优先

### 快速接入

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 定位、能力、环境要求 | 概述、定位、能力、环境、浏览器、WebGL、HTTPS、麦克风、具身、感知、大脑、表达 | `e2esdk-docs/1 快速接入/1.1 概述.md` |
| 最小示例、跑通完整链路 | 快速开始、示例、5分钟、最小示例、hello world、CDN | `e2esdk-docs/1 快速接入/1.2 快速开始.md` |
| 安装、ESM/CDN 引入、Vue/React 集成 | 安装、npm、pnpm、yarn、引入、ESM、UMD、script 标签、Vue、React、原生、集成 | `e2esdk-docs/1 快速接入/1.3 安装与集成.md` |

### 功能介绍

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 连接与生命周期、状态驱动 | 生命周期、init、destroy、getAgentState、getASRState、状态驱动、AgentState、ASRState | `e2esdk-docs/2 功能介绍/2.1 连接与生命周期.md` |
| 服务与大脑配置 | asr_config、brain_config、大脑、服务配置、provider、e2eServer、authToken、base_url | `e2esdk-docs/2 功能介绍/2.2 服务与大脑配置.md` |
| 文本对话 | ask、文本对话、大模型、LLM、流式、onLLMResponse、Conversation | `e2esdk-docs/2 功能介绍/2.3 文本对话.md` |
| 语音识别与麦克风 | startASR、stopASR、语音识别、麦克风、ASR、getUserMedia、isFinal、onASRResult | `e2esdk-docs/2 功能介绍/2.4 语音识别与麦克风.md` |
| 具身智能体播报与 SSML | speak、SSML、播报、流式、口型、字幕 | `e2esdk-docs/2 功能介绍/2.5 具身智能体播报与 SSML.md` |
| 打断与状态控制 | 打断、interrupt、状态控制、idle、listen、interactiveidle、enableClientInterrupt | `e2esdk-docs/2 功能介绍/2.6 打断与状态控制.md` |
| 布局与隐身 | 布局、layout、隐身、invisible、可见、changeLayout、changeAvatarVisible、switchInvisibleMode | `e2esdk-docs/2 功能介绍/2.7 布局与隐身.md` |
| 动作、行走与表情 | 动作、行走、walk、关键动作、ka、表情、情绪 | `e2esdk-docs/2 功能介绍/2.8 动作、行走与表情.md` |
| UI 组件（Widget） | Widget、控件、字幕、图片、视频、proxyWidget、onWidgetEvent | `e2esdk-docs/2 功能介绍/2.9 UI 组件（Widget）.md` |
| 断线重连 | 断线、重连、reconnecting、reconnect、网络 | `e2esdk-docs/2 功能介绍/2.10 断线重连.md` |
| 调试与监控 | 调试、debug、监控、FPS、网络质量、debugInfo | `e2esdk-docs/2 功能介绍/2.11 调试与监控.md` |
| 错误处理 | 错误、error、onMessage、agentCallbacks.onError、domain、retryable | `e2esdk-docs/2 功能介绍/2.12 错误处理.md` |

### API 参考

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 构造参数 | 构造、options、参数、appId、appSecret、gatewayServer、container、asr_config、brain_config、features、agentCallbacks | `e2esdk-docs/3 API参考/3.1 构造参数.md` |
| 生命周期方法 | init、destroy、生命周期、方法、API | `e2esdk-docs/3 API参考/3.2 生命周期方法.md` |
| 会话与状态方法 | 会话、getAgentState、getASRState、getStatus、getRenderState、offlineMode、onlineMode、session | `e2esdk-docs/3 API参考/3.3 会话与状态方法.md` |
| 语音与对话方法 | ask、startASR、stopASR、语音、对话、方法 | `e2esdk-docs/3 API参考/3.4 语音与对话方法.md` |
| 具身智能体控制方法 | speak、interrupt、idle、listen、changeLayout、changeAvatarVisible、setVolume、控制 | `e2esdk-docs/3 API参考/3.5 具身智能体控制方法.md` |
| 回调接口 | 回调、callback、onMessage、agentCallbacks、onAgentStateChange、onASRResult、onLLMResponse | `e2esdk-docs/3 API参考/3.6 回调接口.md` |
| 错误码 | 错误码、errorCode、code、domain | `e2esdk-docs/3 API参考/3.7 错误码.md` |
| 类型定义 | 类型、interface、TypeScript、AgentState、AgentError、AgentASRState | `e2esdk-docs/3 API参考/3.8 类型定义.md` |

### 其他

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 常见问题 | FAQ、常见问题、问题、排查 | `e2esdk-docs/4 常见问题（FAQ）.md` |
| 浏览器兼容性与故障排查 | 浏览器兼容、兼容性、故障、排查、WebGL、降级 | `e2esdk-docs/5 浏览器兼容性与故障排查.md` |
| 从 XmovAvatar 升级 | 迁移、升级、从 XmovAvatar、XingyunAvatarAgent 区别、对比、兼容、升级指南 | `e2esdk-docs/6 XmovAvatar升级指南.md` |

## 旧版 SDK 文档索引（`sdk-docs`） — XmovAvatar 专用

仅当检测到代码基于 `XmovAvatar` 构建、或需要查阅新版继承自 XmovAvatar 的渲染能力时使用。

### 快速入门

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| SDK 概述、核心能力、环境要求 | 概述、简介、能力、环境、浏览器、WebGL、芯片 | `sdk-docs/1 快速接入/1.1 概述.md` |
| 最小示例、5分钟跑通 | 快速开始、示例、hello world、最小示例 | `sdk-docs/1 快速接入/1.2 快速开始.md` |
| 引入方式、Vue/React集成 | 引入、集成、script标签、Vue、React、Vanilla | `sdk-docs/1 快速接入/1.3 安装与集成 — 在 Web 项目中引入 SDK.md` |

### API 参考

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 创建实例、构造函数、options配置 | 创建实例、XmovAvatar、new、构造、options、appId、appSecret | `sdk-docs/2 API参考/2.1 创建数字人实例.md` |
| init/destroy/speak/interrupt 等全部方法 | init、destroy、speak、interrupt、idle、listen、status、方法、API | `sdk-docs/2 API参考/2.2 API 参考 — 完整方法说明.md` |
| 回调函数、事件监听 | 回调、onMessage、onStatusChange、onRenderChange、事件、callback | `sdk-docs/2 API参考/2.3 事件与回调 — 完整回调接口说明.md` |
| 错误码、错误处理 | 错误、error、错误码、errorCode、异常、排查 | `sdk-docs/2 API参考/2.4 错误处理 — 错误码体系与最佳实践.md` |
| 类型定义、TypeScript接口、SSML标签速查、动作列表 | 类型、interface、TypeScript、SSML标签、动作列表、ErrorCode | `sdk-docs/2 API参考/2.5 类型定义、错误码速查、SSML标签与相关资源.md` |

### 高级功能

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 运行时配置、Layout布局、WalkConfig | config、layout、scale、布局、配置项、resolution、raw_audio、walk_config | `sdk-docs/3 高级功能/3.1 运行时配置项.md` |
| SSML语法、播报、停顿、注音 | SSML、speak、播报、停顿、break、phoneme、注音、语音 | `sdk-docs/3 高级功能/3.2 SSML 基础.md` |
| 隐身模式、可见性控制 | 隐身、invisible、隐藏、可见、visibility、后台 | `sdk-docs/3 高级功能/3.3 隐身模式.md` |
| 行走动画、移动、点位 | 行走、walk、移动、点位、walk_config、walk_points | `sdk-docs/3 高级功能/3.4 行走动画控制.md` |
| 关键动作、KA、肢体动作 | 关键动作、ka、ka_intent、肢体、动作、action_semantic | `sdk-docs/3 高级功能/3.5 关键动作.md` |
| 动作意图列表、动作清单 | 动作意图、动作列表、ka_intent、Pointscreen、动作清单、动作大全 | `sdk-docs/3 高级功能/3.5.1 动作意图列表.md` |
| 情绪、表情、emotion | 情绪、表情、emotion、happy、sad、音色 | `sdk-docs/3 高级功能/3.6 情绪.md` |
| Widget、自定义渲染、图片/视频/控件 | Widget、控件、自定义渲染、proxyWidget、onWidgetEvent、图片、视频、字幕 | `sdk-docs/3 高级功能/3.7 Widget 自定义渲染.md` |
| 客户端打断、interrupt | 打断、interrupt、enableClientInterrupt | `sdk-docs/3 高级功能/3.8 客户端打断.md` |

### 产品概览与其他平台

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| 产品功能总览 | 功能清单、能力清单、产品概览、SaaS、能力总览 | `sdk-docs/星云功能清单(SaaS).md` |
| Android 原生 SDK 接入 | Android、安卓、aar、Lite_SDK、原生SDK、Android接入 | `sdk-docs/5 Android SDK 接入指南（v0.0.6）.md` |

### 常见问题

| 主题 | 关键词 | 文档路径 |
|------|--------|----------|
| FAQ、接入问题、性能调优、多实例 | FAQ、问题、多实例、内存、卡顿、移动端、微信、初始化失败 | `sdk-docs/4 常见问题（FAQ）— 接入、配置、多实例与性能调优.md` |

## 使用示例

用户问「怎么让具身智能体通过文本对话并语音识别？」→ 默认走端到端 SDK → 加载 `e2esdk-docs/1 快速接入/1.1 概述.md`（或 `1.2 快速开始.md`）

用户问「XingyunAvatarAgent 的 ask 怎么用？」→ 加载 `e2esdk-docs/2 功能介绍/2.3 文本对话.md`（或 `3.4 语音与对话方法.md`）

用户问「怎么从 XmovAvatar 升级到 XingyunAvatarAgent？」→ 加载 `e2esdk-docs/6 XmovAvatar升级指南.md`

用户问「`new XmovAvatar` 里怎么让具身智能体走路？」→ 检测到基于 XmovAvatar → 加载 `sdk-docs/3 高级功能/3.4 行走动画控制.md`

用户问「XingyunAvatarAgent 下怎么让具身智能体做关键动作？」→ 先加载 `e2esdk-docs/2 功能介绍/2.8 动作、行走与表情.md`；如需完整动作意图清单再回退 `sdk-docs/3 高级功能/3.5.1 动作意图列表.md`

用户问「旧 SDK 报错了 10003」→ 检测到旧版错误码 → 加载 `sdk-docs/2 API参考/2.4 错误处理 — 错误码体系与最佳实践.md`