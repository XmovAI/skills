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
| CDN 文件 | `xmovAvatar.2.4.1.js` | `xmovAvatar_e2e.2.4.1.js` |
| 全局对象 | `window.XmovAvatar` | `window.XingyunAvatarAgent` |
| npm 导入入口 | `@xmov/avatar` | `@xmov/avatar/agent`（同一个 npm 包的子路径） |

CDN 引入：

```html
<!-- 旧版 -->
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar.2.4.1.js"></script>

<!-- 端到端 SDK -->
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar_e2e.2.4.1.js"></script>
```

Agent 的 npm 引入方式：

```ts
import XingyunAvatarAgent from "@xmov/avatar/agent";
```

## gatewayServer 变化

公共云默认网关路径不同；私有化部署按服务端约定提供地址：

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
  containerId: "",
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
| `containerId` / `container` | TS 要求 `containerId`；运行时优先有效 `container` | 相同 | DOM 写法仍需 `containerId: ""` |
| `config` | 可选 | 可选 | 不变 |
| `enableClientInterrupt` | 可选，默认 `false` | 可选，默认 `true` | **默认值变化** |
| `enableDebugger` | 可选 | 可选 | 不变 |
| `asr_config` | — | 可选 | 新增（ASR 服务配置） |
| `brain_config` | — | 可选 | 新增（Brain 服务配置） |
| `tts_config` | 音色通常在 `config.tts_vcn_id` 中设置 | 可选 | 新接入使用结构化音色配置，迁移后移除旧音色字段 |
| `features` | — | 可选 | 新增（功能开关） |
| `e2eServer` / `authToken` | — | 可选 | 新增（私有化 / 调试） |
| `audio` / `reconnect` | — | 可选 | 新增 |
| `agentCallbacks` | — | 可选 | 新增（Agent 回调组） |

> 渲染层回调（`onStatusChange`、`onRenderChange`、`onVoiceStateChange`、`onSpeakStateChange`、`onWalkStateChange`、`onWidgetEvent`、`proxyWidget`、`onNetworkInfo`、`onStartSessionWarning`、`onFPSUpdate`）两套 SDK 均挂在构造参数顶层，名称与签名基本一致，可直接沿用。

## 音色配置迁移

旧配置 `config.tts_vcn_id` 仍兼容，新接入建议使用顶层 `tts_config`。迁移时将旧音色标识拆分为 `provider`、`language` 和 `speaker_id`，保留 `config` 中的其他配置，并移除旧的 `tts_vcn_id`，避免同时设置两套音色配置。

例如，`HSPro__zh_mix_zmd_peiluo` 对应：

```javascript
tts_config: {
  provider: "HSPro",
  language: "zh",
  speaker_id: "mix_zmd_peiluo",
}
```

不同 Provider 的拆分规则不同，Azure 保留完整音色名称，XMOV 克隆 ID 保持完整。`tts_config.tts_vcn_id` 不受支持。完整对照表见 [TTS 配置参考](<7 附录/TTS 配置参考.md#8-旧配置迁移>)。

## 方法对照

### 沿用（同名同义）

以下是 2.4.1 可沿用的方法。升级到 2.5 时还需检查 [版本基线与差异](<../references/sdk-versions.md>)：

| 方法 | 说明 |
|------|------|
| `destroy(reason?)` | 销毁实例 |
| `idle()` / `interactiveidle()` / `listen()` | 待机 / 交互待机 / 聆听姿态 |
| `changeLayout()` / `changeWalkConfig()` | 布局 / 行走配置 |
| `changeAvatarVisible()` | 显隐 |
| `setVolume()` | 音量 |
| `showDebugInfo()` / `hideDebugInfo()` | 调试面板 |
| `getStatus()` / `getRenderState()` | 状态查询 |
| `offlineMode()` / `onlineMode()` / `reStartSession()` | 网络与会话控制 |
| `getSessionId()` / `isDestroyed()` / `getOptions()` | 会话 / 实例信息 |

### 行为差异（需调整）

| 项 | 旧版 | 端到端 SDK | 迁移动作 |
|----|------|-----------|---------|
| `init()` | `onDownloadProgress` 必填 | 可省略；成功后自动运行 | 等待 `await init()`，不调用受保护的 `start()` |
| `speak()` | 第四参数为播报关联字段 | 仅三参数；常规返回 `undefined` | 删除第四参数，完成状态改用回调 |
| `interrupt()` | `interrupt(type)` | `interrupt()` | 删除实参，业务自行记录打断原因 |
| `switchInvisibleMode()` | 同步返回 | `Promise<void>`；进入隐身会停 ASR | 等待完成；需要语音时重新启动 ASR |
| `enableClientInterrupt` 默认值 | `false` | `true` | 配置渲染策略；`false` 不会禁用显式 `interrupt()` |

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
