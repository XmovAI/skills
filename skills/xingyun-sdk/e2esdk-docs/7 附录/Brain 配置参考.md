# Brain 配置参考

`brain_config` 用于配置大模型或智能体服务，处理用户提问并生成回复。

使用平台已有配置时，可省略该参数；需要自定义服务时，在创建 `XingyunAvatarAgent` 时传入完整配置。

## 接入示例

以下示例适用于兼容 OpenAI 接口格式的模型服务。`baseOptions` 为公共接入参数，其余占位值需替换为实际服务配置。

<!-- validate:ts -->
```ts
import XingyunAvatarAgent, { type XingyunAvatarAgentOptions } from "@xmov/avatar/agent";

export async function connectBrain(baseOptions: XingyunAvatarAgentOptions) {
  const agent = new XingyunAvatarAgent({
    ...baseOptions,
    brain_config: {
      provider: "openai-compatible",
      base_url: "YOUR_SERVICE_BASE_URL",
      api_key: "YOUR_API_KEY",
      model: "YOUR_MODEL_NAME",
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

`openai-compatible` 表示采用兼容 OpenAI 接口格式的服务配置，具体使用哪家服务及哪个模型，由服务地址和模型名称等参数确定。

## 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `provider` | `string` | 模型或智能体服务标识。兼容 OpenAI 接口格式的服务使用 `openai-compatible`。 |
| `base_url` | `string` | 服务接口地址。 |
| `api_key` | `string` | 服务访问密钥。 |
| `model` | `string` | 服务支持的模型名称。 |
| `preset` | `string` | 服务约定的预设配置。 |
| `history_length` | `number` | 历史对话长度，计数方式和范围由服务约定。 |
| `extra_body` | `object` | 模型扩展参数，字段和取值以对应服务说明为准。 |

不同服务所需字段不同，不要求每个服务都填写全部字段。

## 配置规则

- `brain_config` 与 `appId` 同级，必须是对象，不能传 JSON 字符串、数组或 `null`。
- 省略或传 `{}` 表示不提供自定义配置。
- `llm_id` 与非空的 `brain_config` 互斥；使用示例时，`baseOptions` 不应包含 `llm_id`。
- 服务标识、地址、密钥和模型名称应对应同一服务。
- `extra_body` 可省略；填写时必须是对象。不要将某个模型的扩展参数直接套用于其他模型。
- `extra_body` 仅用于 OpenAI-compatible 模型接口的额外请求参数透传；Dify、Coze 等应用 API 暂不适配。SDK 只在调用方显式配置时透传，不会自动补 `{}`；空对象等同于未配置。

例如，服务和模型明确支持关闭思考时，可将以下片段合并到完整的 `brain_config` 中：

```json
{
  "extra_body": {
    "thinking": { "type": "disabled" }
  }
}
```

生产环境请优先在星云平台配置服务，避免在浏览器代码中暴露模型服务密钥。

## 支持的 Provider

Provider 列表如下。兼容 OpenAI 接口格式的模型服务可使用 `openai-compatible`；智能体和应用服务按各自接口配置。**实际可用性以服务端为准**，不同 Provider 的必填字段和鉴权方式可能不同，请使用对应服务提供的完整配置。

| Provider | 对应服务或接口类型 |
|---|---|
| `openai-compatible` | 兼容 OpenAI 接口格式的模型服务，通过地址和模型名称指定具体服务 |
| `youyan_agent` | 有言智能体服务 |
| `coze` | Coze 智能体服务 |
| `dify` | Dify 应用服务 |
| `doubao` | 豆包模型服务 |
| `qwen` | 通义千问模型服务 |
| `openai` | OpenAI 模型服务 |
| `deepseek` | DeepSeek 模型服务 |

## 相关文档

- [服务与配置](<../2 功能介绍/2.2 服务与配置.md>)
- [构造参数](<../3 API参考/3.1 构造参数.md>)
- [云文档原文](https://rsjqcmnt5p.feishu.cn/wiki/ZXnfwnfTNiEQy4ky4ZocvoPqnrb)（本地同步基于 2026-10-16 回读的修订 27）
