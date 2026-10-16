# 4 常见问题（FAQ）

本节按「接入配置 → 容器与显示 → 麦克风 → 生命周期 → 对话与打断 → 断线恢复 → 多实例与性能 → 安全与安装」梳理 `XingyunAvatarAgent` 接入过程中最常见的问题。答案中的方法名与签名以「3 API参考」为准。

## Q: `appId`、`appSecret`、`gatewayServer`、`asr_config`、`brain_config` 从哪里获取？

A: 接入前需要准备应用信息和服务地址；`asr_config`、`brain_config` 为可选服务配置，使用平台已有配置时可以省略。来源如下：

| 配置项 | 类型 | 来源 |
|--------|------|------|
| `appId` | `string` | 项目方分配的应用 ID |
| `appSecret` | `string` | 项目方分配的应用密钥（浏览器侧凭证） |
| `gatewayServer` | `string` | 统一会话接口地址，固定为 `https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session` |
| `asr_config` | `Record<string, unknown>` | ASR 语音识别配置，由项目方提供 |
| `brain_config` | `AgentBrainConfig` | 大模型（Brain）配置，由项目方提供 |

公共云使用上述 `gatewayServer`；私有化部署按项目提供的地址填写。`asr_config`、`brain_config` 为空对象时不会随请求发送，表示不提供自定义配置。字段和 Provider 清单见 [ASR 配置参考](<7 附录/ASR 配置参考.md>)、[Brain 配置参考](<7 附录/Brain 配置参考.md>)。

## Q: 不配置 TTS 会使用什么音色？自定义音色失败如何检查？

A: 省略 `tts_config` 或传 `{}` 时，按服务端配置使用平台默认音色。自定义音色需要同时填写非空的 `provider`、`language`、`speaker_id`，其中 Provider 区分大小写。检查音色在当前环境中是否可用，以及音色 ID 是否符合该 Provider 的填写规则；不要额外拼接语种前缀，也不要删掉音色 ID 自身包含的前缀。

`tts_config` 与 `appId` 同级，不放在 `config` 内。完整字段、情感和供应商专属参数见 [TTS 配置参考](<7 附录/TTS 配置参考.md>)。

## Q: Features 配置没有生效如何检查？

A: 配置开关使用布尔值，按嵌套对象填写，最终状态以服务端返回的生效配置为准。开启 AEC 时，必须同时设置 `speech_frontend.enabled: true` 和 `speech_frontend.enable_aec: true`；只检查本地请求值不足以确认功能已开启。语义抗干扰、自动提问、片段合并等字段见 [Features 功能配置参考](<7 附录/Features 功能配置参考.md>)。

## Q: 具身智能体不显示，或者容器塌陷成一根线/一块空白怎么办？

A: 具身智能体 Canvas 会填满你传入的容器，但容器**必须有明确的高度**。塌陷最常见原因是容器高度为 0（父元素未设高度、使用 100% 高度但上级无确定高度、或用了未生效的视口单位）。请给容器显式指定宽高，并让宽高为具体像素或有效的视口单位：

```html
<div id="agent-avatar"></div>
```

```css
#agent-avatar {
  width: 360px;
  height: 640px;
  /* 或占满视口： */
  /* width: 100vw; height: 100vh; */
}
```

其它排查点：

- 确认 `init()` 已完成（`onDownloadProgress` 走到 100%），见下一条「`init()` 完成后什么时候能开始对话」。
- 通过 `getRenderState()` 确认渲染状态是否为 `rendering`；页面仍在 `reconnecting`/`stopped`/`failed` 时不会出帧。
- 确认 WebGL2 可用：浏览器不支持或上下文丢失时会经 `onMessage` 收到 `60001`–`60007` 段错误。
- 容器尺寸在 `init()` 时被读取，初始化后大幅改动容器尺寸（如窗口缩放）不会自动重排，需重建实例。

## Q: `startASR()` 拿不到麦克风，或调用后没有识别，怎么办？

A: 按顺序检查：

1. **安全上下文**：页面必须运行在 HTTPS，开发环境可用 `localhost` 或回环地址；普通 HTTP 下 `getUserMedia` 被浏览器禁用。
2. **权限**：浏览器是否允许当前站点使用麦克风；若页面嵌在 iframe 中，宿主需给 iframe 授权麦克风（`<iframe allow="microphone">`）。
3. **用户手势**：`startASR()` 应在按钮点击等用户操作中触发；非手势上下文下浏览器可能拒绝授权。
4. **浏览器能力**：AEC 关闭时检查 MediaRecorder WebM/Opus；AEC 开启时检查 AudioWorklet / WebCodecs Opus，分别可能返回 `AUDIO_WEBM_OPUS_UNSUPPORTED` 或 `AUDIO_WEBCODECS_OPUS_UNSUPPORTED`。以 Session 的实际 AEC 设置为准，见 2.4。
5. **设备**：确认系统存在可用麦克风输入设备。

```javascript
// 必须在用户手势（如按钮点击）中调用
micButton.addEventListener('click', async () => {
  try {
    await agent.startASR();
  } catch (err) {
    console.warn('startASR 失败：', err);
  }
});
```

完整的能力矩阵与排查见「5 浏览器兼容性与故障排查」。

## Q: `init()` 完成后什么时候能开始对话？

A: `await init()` 成功完成时实例已进入 `running` 状态，无需额外的启动步骤，可以发起文本交互。`startASR()` 还要求实例可见，并应由用户操作触发；隐身状态下需要先退出隐身，不能仅凭 `running` 判断麦克风可用：

```javascript
const agent = new XingyunAvatarAgent({ /* 必填参数见快速开始 */ });
try {
  await agent.init({ onDownloadProgress: (progress) => console.log(progress) });
  await agent.ask('你好');
  // startASR() 由用户点击麦克风按钮后触发。
} catch (error) {
  console.error(error);
  await agent.destroy('init_failed').catch(console.error);
}
```

以 `await init()` 成功完成或 `getAgentState() === 'running'` 判断 Agent 就绪，启动识别还需检查可见状态。`onDownloadProgress` 达到 100% 仅代表资源下载进度，不能证明 E2E / TTSA 连接均已就绪。`initializing` / `reconnecting` / `stopped` / `failed` / `destroyed` 时禁用新的交互入口。

## Q: 如何判断「一轮对话」已经完成？

A: 分两层判断，不要用 `ask()` 的返回值判断：

- `ask(text)` 返回 `Promise<void>`，仅表示消息已写入，**不代表播报完成**。
- 文本生成（LLM）完成：监听 `agentCallbacks.onLLMResponse`，先收到多条 `{ event: 'chunk' }`，最后一条 `{ event: 'done', usage: ... }` 表示大模型输出完毕。
- 播报（具身智能体说话）完成：监听 `agentCallbacks.onConversationChange` 的 `completed` / `failed` / `interrupted`；`agentCallbacks.onSpeakStateChange` 使用播报状态，如 `speak_end`，不要混用两组状态。

```javascript
const agent = new XingyunAvatarAgent({
  // ...
  agentCallbacks: {
    onConversationChange(event) {
      if (event.state === 'completed') {
        console.log('本轮对话已结束');
      }
    },
  },
});
```

## Q: `interrupt()` 打断之后，ASR / 麦克风还会继续开着吗？

A: 会。`interrupt()` 只打断当前具身智能体的**播报**，返回耗时（毫秒），麦克风与 ASR 保持开启，便于用户打断后立即继续说。若打断后需要停止监听，应另行调用 `stopASR()`：

```javascript
agent.interrupt();    // 打断当前播报；ASR 仍开启
agent.stopASR();          // 如不再需要监听，再结束识别并释放麦克风
```

## Q: 断线后会自动恢复吗？恢复后为什么没有继续识别？

A: 会自动恢复。E2E 控制面遇到可恢复的 WebSocket 关闭码（`1001`/`1006`/`1011`/`1012`/`1013`/`1014`）时，SDK 先做短重试（默认 6 次，初始 500ms，上限 8s），耗尽后重新请求统一会话接口。恢复期间状态进入 `reconnecting`，会经 `agentCallbacks.onError` 收到 `E2E_RECONNECTING`；若连恢复也失败，收到 `E2E_RECONNECT_EXHAUSTED`（此时应销毁实例后重建）。

断线时当前 ASR 会停止；连接恢复到 `running` 后，SDK **不会**自动重放断线前的音频、文本或操作（避免重复对话/重复播报），ASR 保持 `idle`。业务需在收到 `running` 状态后根据页面需要重新 `startASR()`：

```javascript
agentCallbacks: {
  onAgentStateChange(state) {
    if (state === 'running' && 用户在听音状态) {
      agent.startASR();   // 恢复后由业务决定是否重新开启麦克风
    }
  },
}
```

## Q: 一个页面能创建多个具身智能体实例吗？性能怎么控制？

A: 可以，但建议单页单实例。多实例的三点代价：

1. **WebGL 上下文**：浏览器通常限制 8–16 个 WebGL 上下文，每个实例占用一个，开多实例易触顶。
2. **网络与资源**：每个实例有独立的连接与资源下载。
3. **CPU/GPU**：每个实例都有独立渲染循环与音频处理，低端设备叠加后明显卡顿。

场景切换时先用旧实例销毁旧实例再创建新实例，避免并存：

```javascript
let current = null;

async function switchAvatar(options) {
  if (current) {
    await current.destroy('switch_avatar');  // 释放渲染、音频与连接资源
  }
  current = new XingyunAvatarAgent(options);
  await current.init();
}
```

只需移除 DOM 容器并不会释放资源；离开页面/卸载组件时务必 `await agent.destroy('page_unmount')`。

## Q: `appSecret` 会出现在浏览器里，安全吗？服务配置能放供应商密钥吗？

A: `appSecret` 是「浏览器侧凭证」，设计上就要下发给前端，但它仍属于敏感信息，应妥善保管：不要提交到公开代码仓库、不要写进日志、不要跨域暴露。请理解一条边界：**浏览器不是密钥存储**——前端代码、构建产物、localStorage 都能被用户看到或调试出来。

因此：

- 生产环境的 ASR、Brain 和 TTS 供应商凭证优先在星云平台应用管理中配置，避免通过 `asr_config`、`brain_config` 或 `tts_config.provider_config` 暴露在浏览器中。含供应商密钥的代码配置仅用于本地测试或受控私有环境。
- 高权限密钥应由你的业务服务端持有，由服务端向浏览器下发权限受限的会话配置。`gatewayServer` 只填会话接口地址，不要把签名密钥塞进 URL。

## Q: npm 和 CDN 如何选择？

A: Vite、Webpack 等构建项目通过 npm 安装，从 `/agent` 导入；原生 HTML 通过 CDN 加载 `xmovAvatar_e2e@latest.js`，使用 `window.XingyunAvatarAgent`，完整示例见 [安装与集成](<1 快速接入/1.3 安装与集成.md>)。

```bash
npm install @xmov/avatar@latest
```

```javascript
import XingyunAvatarAgent from '@xmov/avatar/agent';
```

## Q: `ask()` 和 `speak()` 有什么区别？

A:

| 方法 | 作用 | 链路 |
|------|------|------|
| `ask(text)` | 发起一轮 Brain 对话（问答/多轮交互） | ASR 文本或直接文本 → 大模型（Brain）→ 具身智能体播报 |
| `speak(ssml)` | 直接让具身智能体播报一段 SSML，跳过大模型 | 直接 → 具身智能体 TTSA 播报 |

`speak(ssml, is_start?, is_end?)` 的两个布尔参数默认 `true`，常规 Agent 路径返回 `undefined`，不接受第四参数，适合播固定话术；`ask(text)` 适合需要大模型理解与回答的场景。

```javascript
agent.ask('帮我介绍一下公司');          // 走大模型，返回不代表播报完成
agent.speak('<speak>正在为您查询，请稍候</speak>'); // 直接播报
```

## Q: `stopASR()` 和 `destroy()` 有什么区别？

A:

| 方法 | 作用 | 之后能否恢复 |
|------|------|--------------|
| `stopASR()` | 只停止本轮语音识别并释放麦克风（不发 voice_end） | 随时可再 `startASR()` |
| `destroy(reason?)` | 释放全部资源（渲染、音频、连接、会话），销毁后不可再用 | 不可恢复，需新建实例 |

页面卸载/路由离开请用 `await agent.destroy('page_unmount')`，只删容器不会释放麦克风与连接。

## Q: `onMessage` 和 `agentCallbacks.onError` 有什么区别？

A: `XingyunAvatarAgent` 有**两条独立的错误通道**，必须同时处理：

| 通道 | 位置 | 错误结构 | 覆盖范围 |
|------|------|----------|----------|
| `onMessage` | 构造参数顶层（必填） | `SDKError`（数字码） | 具身智能体渲染、会话、解码、网络、WebGL |
| `agentCallbacks.onError` | `agentCallbacks` 内 | `AgentError`（字符串码 + 域） | Agent 初始化、ASR、Brain、网络、配额 |

```javascript
const agent = new XingyunAvatarAgent({
  // ...
  onMessage(error) {
    console.error('具身智能体/渲染/会话错误', error.code, error.message);
  },
  agentCallbacks: {
    onError(error) {
      console.error('Agent/ASR/网络/配额错误', error.code, error.domain, error.message);
    },
  },
});
```

另请注意：业务回调内部抛异常不会被 SDK 统一捕获，异步处理请自行 `catch`：

```javascript
agentCallbacks: {
  onASRResult(result) {
    void saveTranscript(result).catch(console.error);
  },
}
```
