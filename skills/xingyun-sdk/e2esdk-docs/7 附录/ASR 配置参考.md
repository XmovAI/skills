# ASR 配置参考

`asr_config` 用于配置语音识别服务，将用户语音转换为文本。

使用平台已有配置时，可省略该参数；需要自定义服务时，在创建 `XingyunAvatarAgent` 时传入完整配置。

## 接入示例

`baseOptions` 为公共接入参数，`asrConfig` 为项目提供的有效识别服务配置。

<!-- validate:ts -->
```ts
import XingyunAvatarAgent, { type XingyunAvatarAgentOptions } from "@xmov/avatar/agent";

export async function connectASR(baseOptions: XingyunAvatarAgentOptions, asrConfig: NonNullable<XingyunAvatarAgentOptions["asr_config"]>) {
  const agent = new XingyunAvatarAgent({
    ...baseOptions,
    asr_config: asrConfig,
    agentCallbacks: {
      ...baseOptions.agentCallbacks,
      onASRResult({ text, isFinal }) {
        if (isFinal) {
          console.log("识别结果：", text);
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

在用户点击“开始说话”等操作中调用返回实例的 `startASR()`，配置识别服务不会自动启动麦克风。麦克风权限、隐身限制和音频能力见 [语音识别与麦克风](<../2 功能介绍/2.4 语音识别与麦克风.md>)。

## 字段说明

不同服务的必填项和取值不同，请使用对应服务提供的配置。

| 字段 | 类型 | 说明 |
|---|---|---|
| `provider` | `string` | 识别服务标识。 |
| `base_url` | `string` | 识别服务地址。 |
| `headers` | `object` | 服务要求的鉴权参数。 |
| `request` | `object` | 服务支持的识别参数。 |

## 配置规则

- `asr_config` 与 `appId` 同级，必须是对象，不能传 JSON 字符串、数组或 `null`。
- 省略或传 `{}` 表示不提供自定义配置。
- `asr_id` 与非空的 `asr_config` 互斥；使用示例时，`baseOptions` 不应包含 `asr_id`。
- 服务标识、地址、鉴权信息和识别参数应使用同一套有效配置。
- 识别结果是否自动交给大模型，由 `features.auto_send_asr_to_llm` 控制。

生产环境请优先在星云平台配置服务，避免在浏览器代码中暴露服务密钥。

## 支持的 Provider

Provider 列表如下，**实际可用性以服务端为准**。不同 Provider 的必填字段和鉴权方式可能不同，请使用对应服务提供的完整配置。

| Provider | 对应服务或接口类型 |
|---|---|
| `xmov` | XMOV 语音识别服务 |
| `doubao` | 豆包语音识别服务 |
| `tencent` | 腾讯语音识别服务 |
| `xunfei` | 讯飞语音识别服务 |

## 相关文档

- [服务与配置](<../2 功能介绍/2.2 服务与配置.md>)
- [构造参数](<../3 API参考/3.1 构造参数.md>)
- [云文档原文](https://rsjqcmnt5p.feishu.cn/wiki/KU1iwqzYfiI8B6k0hEAcR2TFn1e)（本地同步基于 2026-10-16 回读的修订 46）
