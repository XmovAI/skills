# Features 功能配置参考

`features` 用于配置语音交互功能，所有开关均为可选布尔值。**功能最终是否开启，以服务端接口返回的生效配置为准。**

## 接入示例

以下示例请求关闭自动提问，识别完成后由用户确认文本，再交给大模型处理。

`baseOptions` 为公共接入参数。

<!-- validate:ts -->
```ts
import XingyunAvatarAgent, { type XingyunAvatarAgentOptions } from "@xmov/avatar/agent";

export async function connectWithConfirmation(baseOptions: XingyunAvatarAgentOptions) {
  const agent = new XingyunAvatarAgent({
    ...baseOptions,
    features: {
      ...baseOptions.features,
      auto_send_asr_to_llm: false,
    },
    agentCallbacks: {
      ...baseOptions.agentCallbacks,
      onASRResult({ text, isFinal }) {
        if (isFinal) {
          // 在页面展示文本，供用户确认或编辑。
          console.log("待确认文本：", text);
        }
      },
    },
  });

  try {
    await agent.init();
    return agent;
  } catch (error) {
    await agent.destroy("init_failed").catch(console.error);
    throw error;
  }
}
```

开始采集语音仍需在用户操作中调用返回实例的 `startASR()`。收到最终识别结果后，在页面展示或编辑文本；用户确认后再提交：

```javascript
const question = confirmedText.trim();
if (question) {
  await agent.ask(question);
}
```

其中 `agent` 为 `connectWithConfirmation()` 返回的实例，`confirmedText` 为用户确认的文本。自动提问开启时，不要重复将同一段识别文本提交给 `ask()`。

## 字段说明

下表所有字段的类型均为 `boolean`，实际开关状态以服务端返回结果为准。

| 字段 | 说明 |
|---|---|
| `auto_send_asr_to_llm` | 是否将识别结果自动交给大模型。关闭后可自行调用 `ask()` 提交文本。 |
| `anti_interference.semantic_judge_enabled` | 是否启用语义抗干扰，判断用户话语是否有意义，过滤无意义语气词和无关插话。 |
| `vad_merge_mode` | 是否合并被用户短暂停顿切开的语音片段，避免抢话。 |
| `volume_and_repetition_text_detection` | 是否启用音量和重复文本检测。音量检测用于过滤音量未达标的识别结果；重复文本检测用于判断 ASR 结果是否来自数字人自身的播报，减少回声引起的自我打断。 |
| `speech_frontend.enabled` | 是否启用语音前处理。 |
| `speech_frontend.enable_aec` | 是否启用回声消除；开启时必须同时设置 `speech_frontend.enabled: true`。 |
| ~~`speech_frontend.enable_speech_separation`~~ | ~~是否启用语音分离。（已废弃）~~ |

`speech_frontend.enable_speech_separation` 仍存在于 SDK 类型声明中，但配置文档已标记废弃，新接入不应使用它。它不是 AEC 或双路音频上行开关。

## 配置规则

- `features` 与 `asr_config`、`brain_config` 同级，必须是对象。
- 不能传 JSON 字符串、数组或 `null`。
- 省略或传 `{}` 表示不提供自定义功能配置。
- 开关填写布尔值 `true` 或 `false`，不能使用字符串。
- 表格中的点号表示嵌套关系，应按对象层级填写。
- 开启回声消除（speech_frontend.enable_aec）时，必须同时开启语音前处理（speech_frontend.enabled）：

```javascript
features: {
  speech_frontend: {
    enabled: true,
    enable_aec: true,
  },
}
```

## 相关文档

- [服务与配置](<../2 功能介绍/2.2 服务与配置.md>)
- [构造参数](<../3 API参考/3.1 构造参数.md>)
- [云文档原文](https://rsjqcmnt5p.feishu.cn/wiki/V6Agw9kwLi5lQakfPWTch4wnn5d)（本地同步基于 2026-10-16 回读的修订 68）
