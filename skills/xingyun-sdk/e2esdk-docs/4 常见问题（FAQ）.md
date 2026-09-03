# 4 常见问题（FAQ）

本节按「接入配置 → 容器与显示 → 麦克风 → 生命周期 → 对话与打断 → 断线恢复 → 多实例与性能 → 安全与版本」梳理 `XingyunAvatarAgent` 接入过程中最常见的问题。答案中的方法名与签名以「3 API参考」为准。

## Q: `appId`、`appSecret`、`gatewayServer`、`asr_config`、`brain_config` 从哪里获取？

A: 这几项均为接入前必须拿到的配置，来源如下：

| 配置项 | 类型 | 来源 |
|--------|------|------|
| `appId` | `string` | 项目方分配的应用 ID |
| `appSecret` | `string` | 项目方分配的应用密钥（浏览器侧凭证） |
| `gatewayServer` | `string` | 统一会话接口地址，固定为 `https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session` |
| `asr_config` | `Record<string, unknown>` | ASR 语音识别配置，由项目方提供 |
| `brain_config` | `AgentBrainConfig` | 大模型（Brain）配置，由项目方提供 |

`gatewayServer` 为固定值，直接填写上述地址即可，无需按环境替换。`asr_config`、`brain_config` 为空对象时不会随请求发送，按项目方给定的字段填写即可。

## Q: 数字人不显示，或者容器塌陷成一根线/一块空白怎么办？

A: 数字人 Canvas 会填满你传入的容器，但容器**必须有明确的高度**。塌陷最常见原因是容器高度为 0（父元素未设高度、使用 100% 高度但上级无确定高度、或用了未生效的视口单位）。请给容器显式指定宽高，并让宽高为具体像素或有效的视口单位：

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
4. **浏览器能力**：`MediaRecorder.isTypeSupported("audio/webm;codecs=opus")` 必须为 `true`，否则会经 `agentCallbacks.onError` 返回 `AUDIO_WEBM_OPUS_UNSUPPORTED`。
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

A: `init()` 返回时实例已进入 `running` 状态，无需额外的启动步骤，可以直接调用 `ask()`、`speak()`、`startASR()`：

```javascript
const agent = new XingyunAvatarAgent({ /* ... */ });

agent.init({
    onDownloadProgress: (progress) => {
        if (progress === 100) {
            // 可交互
        }
    },
}).then(() => {
    // 可交互
    agent.ask('你好');          // 直接可用
    agent.startASR();           // 语音直接可用
});
```

`init()` 返回 `Promise<void>`，当 Promise resolve 后即可进入可交互状态；另外也可以监听 `init()` 的回调函数 `onDownloadProgress`，当 `progress === 100` 时，也可发起对话。此时获取状态 `getAgentState()` 为 `'running'`，`initializing`/`reconnecting`/`stopped`/`failed`/`destroyed` 状态下应禁用交互按钮。

## Q: 如何判断「一轮对话」已经完成？

A: 分两层判断，不要用 `ask()` 的返回值判断：

- `ask(text)` 返回 `Promise<void>`，仅表示消息已写入，**不代表播报完成**。
- 文本生成（LLM）完成：监听 `agentCallbacks.onLLMResponse`，先收到多条 `{ event: 'chunk' }`，最后一条 `{ event: 'done', usage: ... }` 表示大模型输出完毕。
- 播报（数字人说话）完成：监听 `agentCallbacks.onSpeakStateChange` 或 `agentCallbacks.onConversationChange`，当 `event.state === 'completed'` 表示本轮播报结束（`'failed'` 为失败，`'interrupted'` 为被打断）。

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

A: 会。`interrupt(type)` 只打断当前数字人的**播报**，返回耗时（毫秒），麦克风与 ASR 保持开启，便于用户打断后立即继续说。若打断后需要停止监听，应另行调用 `stopASR()`：

```javascript
agent.interrupt('user');    // 打断当前播报；ASR 仍开启
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

## Q: 一个页面能创建多个数字人实例吗？性能怎么控制？

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

## Q: `appSecret` 会出现在浏览器里，安全吗？`asr_config`/`brain_config` 能放服务端密钥吗？

A: `appSecret` 是「浏览器侧凭证」，设计上就要下发给前端，但它仍属于敏感信息，应妥善保管：不要提交到公开代码仓库、不要写进日志、不要跨域暴露。请理解一条边界：**浏览器不是密钥存储**——前端代码、构建产物、localStorage 都能被用户看到或调试出来。

因此：

- 不要在 `asr_config`/`brain_config` 中写入高权限的服务端 API Key，除非项目方明确确认该凭证允许在浏览器使用。
- 高权限密钥应由你的业务服务端持有，由服务端向浏览器下发权限受限的会话配置。`gatewayServer` 只填会话接口地址，不要把签名密钥塞进 URL。

## Q: 安装时用 `@latest` 还是锁定具体版本？

A: 快速体验可用浮动标签 `@latest`，安装到的是当前最新版；生产环境务必锁定项目方提供的具体版本号，并避免使用会自动漂移的版本范围（如 `^` 宽泛范围）导致生产环境意外升级：

```bash
npm install @xmov/avatar@latest   # 快速体验：安装最新版
npm install @xmov/avatar@1.0.0    # 生产：以项目方提供版本号为准
```

```javascript
import XingyunAvatarAgent from '@xmov/avatar/agent';
```

## Q: `ask()` 和 `speak()` 有什么区别？

A:

| 方法 | 作用 | 链路 |
|------|------|------|
| `ask(text)` | 发起一轮 Brain 对话（问答/多轮交互） | ASR 文本或直接文本 → 大模型（Brain）→ 数字人播报 |
| `speak(ssml)` | 直接让数字人播报一段 SSML，跳过大模型 | 直接 → 数字人 TTSA 播报 |

`speak(ssml, is_start?, is_end?, extra?)` 返回 `string | undefined`（本次播报的标识），适合播固定话术；`ask(text)` 适合需要大模型理解与回答的场景。

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
| `onMessage` | 构造参数顶层（必填） | `SDKError`（数字码） | 数字人渲染、会话、解码、网络、WebGL |
| `agentCallbacks.onError` | `agentCallbacks` 内 | `AgentError`（字符串码 + 域） | Agent 初始化、ASR、Brain、网络、配额 |

```javascript
const agent = new XingyunAvatarAgent({
  // ...
  onMessage(error) {
    console.error('数字人/渲染/会话错误', error.code, error.message);
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