---
name: xingyun-sdk
description: 魔珐星云AI具身交互智能体 SDK 开发助手。当用户提到数字人、星云、XmovAvatar、SSML、WebGL渲染、具身驱动、虚拟人、数字人SDK、星云平台、行走动画、关键动作、情绪表情、Widget组件、隐身模式、客户端打断、或任何与魔珐星云3D数字人开发相关的内容时，必须使用此技能。即使用户只是想了解如何接入、如何配置、如何调试数字人应用，也应触发。
compatibility: Designed for Claude Code and similar products
license: MIT
---

# 魔珐星云 AI 具身交互智能体 SDK 开发助手

本技能为魔珐星云 3D 数字人 Web SDK（XmovAvatar）的开发提供文档支持。

## 工作流程

当用户提出开发相关问题时：

1. **匹配文档索引**：根据用户问题中的关键词，在下方「文档索引」中找到对应的文档路径
2. **加载文档**：使用 Read 工具读取对应文档的完整内容（路径相对于技能目录，如 `sdk-docs/1 快速接入/1.1 概述.md`）
3. **基于文档回答**：严格依据文档内容回答用户问题，不要凭记忆臆断 API 或参数

> 一次只加载用户当前问题所需的文档，不要一次性加载所有文档。如果问题涉及多个模块，按需逐个加载。

## 文档索引

文档位于本技能目录下的 `sdk-docs/` 中，路径均相对于技能目录。

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

用户问「怎么让数字人走路？」→ 匹配到「行走动画」→ 加载 `sdk-docs/3 高级功能/3.4 行走动画控制.md` → 基于文档回答

用户问「speak方法怎么用？」→ 匹配到「API方法」→ 加载 `sdk-docs/2 API参考/2.2 API 参考 — 完整方法说明.md` → 基于文档回答

用户问「报错了 10003」→ 匹配到「错误码」→ 加载 `sdk-docs/2 API参考/2.4 错误处理 — 错误码体系与最佳实践.md` → 基于文档回答
