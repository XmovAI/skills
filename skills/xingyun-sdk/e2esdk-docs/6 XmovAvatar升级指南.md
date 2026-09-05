# 6 XmovAvatar升级指南

本节面向正在使用旧版渲染 SDK `XmovAvatar` 的开发者，说明如何平滑迁移到端到端 SDK `XingyunAvatarAgent`。内容涵盖两套 SDK 的定位差异、逐项 API 对照、行为差异与建议的迁移步骤。

## 定位差异

| 维度 | 旧版 `XmovAvatar` | 端到端 SDK `XingyunAvatarAgent` |
|------|------------------|-------------------------------|
| 定位 | 数字人**渲染与播报** SDK | 具身交互智能体 SDK（**端到端**） |
| 语音识别（ASR） | 无，需业务自行接入 | 内置 `startASR()` / `stopASR()` |
| 大模型（LLM）对话 | 无，需业务自行接入 | 内置 Brain，`ask()` 直接对话 |
| 播报 | `speak(ssml)` | `speak(ssml)` ＋ `ask()` / ASR 自动播报 |
| 断线重连 | 渲染层自动重连 | E2E 控制面 + 渲染层自动重连 |
| 异常监听 | 单一 `onMessage` | `onMessage`（渲染层）＋ `agentCallbacks.onError`（Agent 层） |

一句话概括：旧版是「会说话的数字人」，对话中的「感知」（ASR）与「认知」（LLM）需要业务自己搭建；新版把「感知 → 认知 → 表达」串成一条链路，业务只需一行 `ask()` 或 `startASR()`。

## 引入方式升级

| 项 | 旧版 | 端到端 SDK |
|----|------|-----------|
| CDN 文件 | `xmovAvatar@latest.js` | `xmovAvatar_e2e@latest.js` |
| 全局对象 | `window.XmovAvatar` | `window.XingyunAvatarAgent` |
| npm 包 | 无（仅 CDN） | `@xmov/avatar/agent` |

CDN 引入：

```html
<!-- 旧版 -->
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js"></script>

<!-- 端到端 SDK -->
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar_e2e@latest.js"></script>
```

新增 npm 引入方式：

```ts
import XingyunAvatarAgent from "@xmov/avatar/agent";
```

## gatewayServer 变化

两套 SDK 的 `gatewayServer` 均为固定值，但**路径不同**，迁移时务必替换：

| 项 | 地址 |
|----|------|
| 旧版 | `https://nebula-agent.xingyun3d.com/user/v1/ttsa/session` |
| 端到端 SDK | `https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session` |

## 实例创建对照

两套 SDK 的构造参数大部分同名同义，核心变化如下：

```javascript
// 旧版
const avatar = new XmovAvatar({
  containerId: "#avatar-container",
  appId: "your-app-id",
  appSecret: "your-app-secret",
  gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa/session",
  enableClientInterrupt: true,
  onMessage(error) {
    console.error(error.code, error.message);
  },
});

// 端到端 SDK
const agent = new XingyunAvatarAgent({
  container: document.getElementById("avatar-container"),
  appId: "your-app-id",
  appSecret: "your-app-secret",
  gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session",
  onMessage(error) {
    console.error(error.code, error.message);
  },
  agentCallbacks: {
    onError(error) {
      console.error(error.code, error.message);
    },
  },
});
```

### 构造参数对照表

| 参数 | 旧版 | 端到端 SDK | 变化 |
|------|------|-----------|------|
| `appId` | 必填 | 必填 | 不变 |
| `appSecret` | 必填 | 必填 | 不变 |
| `gatewayServer` | 固定 `/ttsa/session` | 固定 `/ttsa_v2/session` | **值变化** |
| `onMessage` | 必填 | 必填 | 不变（渲染层错误） |
| `containerId` / `container` | 二选一 | 二选一（条件必填） | 不变 |
| `config` | 可选 | 可选 | 不变 |
| `enableClientInterrupt` | 可选，默认 `false` | 可选，默认 `true` | **默认值变化** |
| `enableDebugger` | 可选 | 可选 | 不变 |
| `asr_config` | — | 可选 | 新增（ASR 服务配置） |
| `brain_config` | — | 可选 | 新增（Brain 服务配置） |
| `features` | — | 可选 | 新增（功能开关） |
| `e2eServer` / `authToken` | — | 可选 | 新增（私有化 / 调试） |
| `audio` / `reconnect` | — | 可选 | 新增 |
| `agentCallbacks` | — | 可选 | 新增（Agent 回调组） |

> 渲染层回调（`onStatusChange`、`onRenderChange`、`onVoiceStateChange`、`onSpeakStateChange`、`onWalkStateChange`、`onWidgetEvent`、`proxyWidget`、`onNetworkInfo`、`onStartSessionWarning`、`onFPSUpdate`）两套 SDK 均挂在构造参数顶层，名称与签名基本一致，可直接沿用。

## 方法对照

### 沿用（同名同义）

旧版的方法在端到端 SDK 中基本原样保留，业务无需改动：

| 方法 | 说明 |
|------|------|
| `init(params?)` | 初始化 |
| `destroy(reason?)` | 销毁实例 |
| `speak(ssml, ...)` | 播报 SSML |
| `interrupt(type)` | 客户端打断 |
| `idle()` / `interactiveidle()` / `listen()` | 待机 / 交互待机 / 聆听姿态 |
| `changeLayout()` / `changeWalkConfig()` | 布局 / 行走配置 |
| `changeAvatarVisible()` / `switchInvisibleMode()` | 显隐 / 隐身模式 |
| `setVolume()` | 音量 |
| `showDebugInfo()` / `hideDebugInfo()` | 调试面板 |
| `getStatus()` / `getRenderState()` | 状态查询 |
| `offlineMode()` / `onlineMode()` / `reStartSession()` | 网络与会话控制 |
| `getSessionId()` / `isDestroyed()` / `getOptions()` | 会话 / 实例信息 |

### 行为差异（需调整）

| 项 | 旧版 | 端到端 SDK | 迁移动作 |
|----|------|-----------|---------|
| `enableClientInterrupt` 默认值 | `false` | `true` | 如需禁用须显式传 `false` |

### 新增方法（端到端能力）

| 方法 | 说明 |
|------|------|
| `ask(text)` | 发起一轮文本对话（大模型 → 具身智能体播报） |
| `startASR()` / `stopASR()` | 开始 / 结束语音识别 |
| `getAgentState()` | Agent 整体状态查询 |
| `getASRState()` | 语音识别 / 麦克风状态查询 |

## 回调体系对照

### 新增：Agent 回调（agentCallbacks 内）

端到端 SDK 新增 `agentCallbacks` 回调组，覆盖状态机、ASR、大模型、网络与配额。迁移到「自动对话」场景时，主要改用以下回调：

| 回调 | 用途 |
|------|------|
| `onAgentStateChange(state)` | Agent 整体状态（`running` / `reconnecting`…），替代旧版用 `onStatusChange` 判断可用性 |
| `onSocketStateChange(state)` | E2E 控制面 WebSocket 状态（`connecting` / `open`…） |
| `onASRStateChange(state)` | 麦克风 / 识别状态（`listening`…），替代旧版自行维护的收音状态 |
| `onASRResult(result)` | 语音识别文本（含 `isFinal`） |
| `onLLMResponse(response)` | 大模型流式回复（`chunk` / `done`） |
| `onConversationChange(event)` | 一轮对话状态（`completed` = 播报结束） |
| `onSpeakStateChange(event)` | 播报状态（**对象参数**，与顶层同名回调签名不同） |
| `onError(error)` | Agent / ASR / Brain / 网络 / 配额错误 |

## 建议迁移步骤

建议按以下顺序平滑切换：

1. **替换引入与构造**：改 CDN 文件名、全局对象名、`gatewayServer` 路径；在 `onMessage` 之外补上 `agentCallbacks.onError`，覆盖完整异常监听。
2. **重构对话链路**：把「业务自建 ASR + LLM → 拼 SSML → `speak()`」改为直接 `ask()` 或 `startASR()`；判断「一轮对话完成」改用 `onConversationChange` 的 `completed`。
3. **灰度验证**：先在灰度环境验证具身智能体渲染、文本对话、语音识别、打断与重连，再全量切换。

## 迁移示例

### 旧版：自建对话链路

```javascript
const avatar = new XmovAvatar({
  containerId: "#avatar-container",
  appId: "your-app-id",
  appSecret: "your-app-secret",
  gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa/session",
  onMessage(error) {
    console.error(error.code, error.message);
  },
});

await avatar.init({
  onDownloadProgress(p) {
    console.log(p + "%"); // 0–100
  },
});

// 业务自建 ASR + LLM，拿到回复后拼 SSML 播报
const replyText = await myLLM(await myASR()); // 听 + 想
avatar.speak(`<speak>${replyText}</speak>`);   // 说
```

### 新版：端到端对话链路

```javascript
const agent = new XingyunAvatarAgent({
  containerId: "#avatar-container",
  appId: "your-app-id",
  appSecret: "your-app-secret",
  gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session",
  onMessage(error) {
    console.error(error.code, error.message);
  },
  agentCallbacks: {
    onError(error) {
      console.error(error.code, error.message);
    },
    onConversationChange(event) {
      if (event.state === "completed") {
        console.log("一轮对话结束");
      }
    },
  },
});

await agent.init({
  onDownloadProgress(p) {
    console.log(p + "%"); // 0–100
  },
});

// 文本对话：听 + 想 + 说 一条链路
agent.ask("你好，介绍一下这个产品");

// 语音对话：识别完成后自动进入大模型对话链路
agent.startASR();
```

## 相关文档

- 端到端 SDK 概览：`1.1 概述`
- 安装与集成：`1.3 安装与集成`
- 构造参数：`3.1 构造参数`
- 回调接口：`3.6 回调接口`
- 文本对话 / 语音识别：`2.3 文本对话`、`2.4 语音识别与麦克风`
- 常见问题：`4 常见问题（FAQ）`