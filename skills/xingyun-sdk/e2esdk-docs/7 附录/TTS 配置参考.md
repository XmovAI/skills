# TTS 配置参考

`tts_config` 是可选的语音合成配置，用于指定音色、语种、语速、音调、音量和情感。不填写或传入空对象 `{}` 时，使用平台默认音色。

## 1. 快速接入

自定义音色时，必须同时填写非空的 `provider`、`language` 和 `speaker_id`。页面需提供有明确宽高的 `#agent-avatar` 容器。填写应用信息，并使用当前环境中可用的音色配置：

<!-- validate:ts -->
```ts
import XingyunAvatarAgent, { type XingyunAvatarAgentOptions } from "@xmov/avatar/agent";

export function createAgent(ttsConfig: NonNullable<XingyunAvatarAgentOptions["tts_config"]>) {
  return new XingyunAvatarAgent({
    containerId: "#agent-avatar",
    appId: "your-app-id",
    appSecret: "your-app-secret",
    gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session",
    onMessage: console.error,
    tts_config: ttsConfig, // 使用服务端确认的完整配置；生产密钥优先在平台配置
    session_speak_req_id: 0,
  });
}

export async function connect() {
  const agent = createAgent({
    provider: "XMOV_HN_TTS",
    language: "zh",
    speaker_id: "15",
  });
  try {
    await agent.init();
    agent.speak("你好");
    return agent;
  } catch (error) {
    await agent.destroy("init_failed").catch(console.error);
    throw error;
  }
}
```

## 2. 配置规则

- **配置时机**：在 `init()` 创建会话时提交。2.4.1 不提供运行中更新该配置的公开方法；需要变更时，先销毁旧实例，再使用新配置创建实例。
- **配置位置**：`tts_config` 与 `appId` 等构造参数同级，不放在 `config` 内。
- **默认音色**：不填写或传入 `{}` 时，使用平台默认音色。
- **自定义音色**：配置必须是 JSON 对象，且同时提供非空的 `provider`、`language` 和 `speaker_id`。`null`、数组和字符串不受支持。
- **参数取值**：provider 区分大小写；音色、情感标签和数值范围以所选服务支持的值为准。可选字段按需填写。
- **专属参数**：统一放在 `provider_config` 中，仅填写当前 provider 支持的字段。

## 3. 字段说明

下表列出配置参考约定的服务端默认值；SDK 不会在客户端为缺失字段自动补齐这些值，实际支持范围以当前服务端和所选音色为准。

| 字段 | JSON 类型 | 是否必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `provider` | `string` | 自定义音色时必填 | 无 | TTS 供应商或模型类型，使用下文列出的精确值。 |
| `language` | `string` | 自定义音色时必填 | 无 | 音色语种，如 `zh`、`en`；允许值由服务和音色决定。 |
| `speaker_id` | `string` | 自定义音色时必填 | 无 | 音色 ID，填写方式见“音色 ID 规则”。 |
| `is_large_model` | `boolean` | 否 | `false` | XMOV 系列是否使用大模型 TTS；XMOV 克隆音色 provider 不依赖该字段。 |
| `support_emotion` | `array<string>` 或 `string` | 否 | `[]` | 当前音色支持的情感标签。字符串使用英文逗号分隔。 |
| `tts_speed` | `number` | 否 | `1` | 语速倍率，`1` 为原始语速。 |
| `pitch` | `number` | 否 | `1` | 音调倍率，`1` 为原始音调。 |
| `volume` | `number` | 否 | `1` | 音量倍率，`1` 为原始音量。 |
| `audio_sample_rate` | `integer` | 否 | `24000` | TTS PCM 采样率，单位 Hz；须与服务实际输出一致。 |
| `emotion` | `string` | 否 | `""` | 会话默认情感；非空值应包含在 `support_emotion` 中。 |
| `provider_config` | `object` | 否 | `{}` | 当前 provider 的账号、凭证、地址或专属合成参数。 |

`tts_speed`、`pitch`、`volume` 没有统一的跨供应商取值范围。`audio_sample_rate` 通常保持 `24000`，如需修改，应先确认服务实际输出的采样率。

## 4. 支持的 provider 与音色 ID 规则

| `provider` | 说明 |
|---|---|
| `XMOV_LV_TTS` | XMOV LV 音色 |
| `XMOV_HN_TTS` | XMOV HN 音色 |
| `XMOV_ML_TTS` | XMOV ML 音色 |
| `XMOV_EN_TTS` | XMOV 英文音色 |
| `XMOV_JIM_TTS` | XMOV JIM 音色 |
| `XMOV_LYH_TTS` | XMOV LYH 音色 |
| `XMOV_CNVC_TTS` | XMOV 中文克隆音色 |
| `XMOV_ENVC_TTS` | XMOV 英文克隆音色 |
| `AZURE` | Microsoft Azure TTS |
| `HS` | 火山标准 TTS |
| `HSPro` | 火山 Pro TTS |
| `HSPro2` | 火山 Pro2 TTS |
| `11LABS` | ElevenLabs TTS |
| `Minimax` | MiniMax TTS |

以上取值区分大小写，实际可用性以服务端为准。

### XMOV 系列

`speaker_id` 直接填写完整音色 ID，不添加语种前缀：

```json
{
  "provider": "XMOV_HN_TTS",
  "language": "zh",
  "speaker_id": "15"
}
```

`XMOV_EN_TTS`、`XMOV_ENVC_TTS` 使用 `language: "en"`，其他 XMOV provider 使用 `language: "zh"`。克隆音色填写完整克隆 ID：

```json
{
  "provider": "XMOV_ENVC_TTS",
  "language": "en",
  "speaker_id": "CLONED_voice_xxx"
}
```

`CLONED_voice_xxx` 为示例占位符，需替换为实际克隆音色 ID。

### Azure

`speaker_id` 保留完整音色名称，包括语种和地区：

```json
{
  "provider": "AZURE",
  "language": "zh",
  "speaker_id": "zh-CN-XiaoxiaoNeural"
}
```

### HS、HSPro、HSPro2、11LABS、Minimax

语种填写到 `language`，音色填写到 `speaker_id`，不要额外拼接 `language_`：

```json
{
  "provider": "HSPro",
  "language": "zh",
  "speaker_id": "mix_zmd_peiluo"
}
```

音色 ID 自身可能包含语种前缀或下划线，应保留原始内容。例如，`zh_female_vv_uranus_bigtts` 是完整音色 ID，不能直接删除其中的 `zh_`。

## 5. 情感配置

`support_emotion` 声明音色支持的情感标签，`emotion` 指定会话默认情感。以下是可合并到 `tts_config` 中的配置片段：

```json
{
  "support_emotion": ["happy", "sad", "angry"],
  "emotion": "happy"
}
```

`support_emotion` 也支持英文逗号分隔字符串：

```json
{
  "support_emotion": "happy,sad,angry",
  "emotion": "happy"
}
```

情感标签不是统一枚举，应以服务和音色实际支持的标签为准。语音情感不保证与角色面部表情联动。`emotion: ""` 表示不指定固定情感。

### HSPro2 语气参考与情感强度

HSPro2 支持在 `provider_config` 中设置：

```json
{
  "provider_config": {
    "context_texts": ["请使用自然、亲切的语气"],
    "emotion_scale": 2
  }
}
```

- `context_texts`：语气参考文本。可传字符串或字符串数组，字符串按一条文本处理。
- `emotion_scale`：情感强度，可传数值或 `null`，有效范围由 HSPro2 服务决定。

情感通过 `tts_config` 设置为会话默认值，当前 Agent SDK 不支持在单次 `speak()` 中覆盖。

## 6. 供应商专属配置

`provider_config` 必须是 JSON 对象。未提供或传入 `{}` 时，使用默认服务配置。

除 HSPro2 的 `context_texts` 和 `emotion_scale` 外，提供的配置值必须是非空字符串。不支持的字段不会生效。

### 支持范围

| `provider` | 可配置字段 |
|---|---|
| `AZURE` | `speech_key`、`speech_region` |
| `HS`、`HSPro` | `app_id`、`access_token`、`cluster`、`api_url` |
| `HSPro2` | `app_id`、`access_token`、`cluster`、`api_url`、`context_texts`、`emotion_scale` |
| `Minimax` | `api_key`、`group_id`、`api_url`、`websocket_url` |
| XMOV 系列、`11LABS` | 当前不支持调用方覆盖服务配置 |

### 字段说明

以下字段均为可选项。

| 字段 | JSON 类型 | 适用 provider | 说明 |
|---|---|---|---|
| `speech_key` | `string` | `AZURE` | Azure Speech 订阅密钥。未提供时使用默认凭证。 |
| `speech_region` | `string` | `AZURE` | Azure Speech 服务区域，如 `eastus2`、`westus`。 |
| `app_id` | `string` | `HS`、`HSPro`、`HSPro2` | 火山 TTS 应用 ID。未提供时使用默认配置。 |
| `access_token` | `string` | `HS`、`HSPro`、`HSPro2` | 火山 TTS 访问令牌。未提供时使用默认凭证。 |
| `cluster` | `string` | `HS`、`HSPro`、`HSPro2` | 火山 TTS 集群名称。未提供时使用默认配置。 |
| `api_url` | `string` | `HS`、`HSPro`、`HSPro2`、`Minimax` | 自定义服务地址。未提供时使用默认地址。 |
| `api_key` | `string` | `Minimax` | MiniMax API Key。未提供时使用默认凭证。 |
| `group_id` | `string` | `Minimax` | MiniMax Group ID。未提供时使用默认配置。 |
| `websocket_url` | `string` | `Minimax` | MiniMax WebSocket 服务地址。 |
| `context_texts` | `array<string>` 或 `string` | `HSPro2` | 情感或语气参考文本，默认 `[]`。 |
| `emotion_scale` | `number` 或 `null` | `HSPro2` | 情感强度，默认 `null`。 |

### 地址格式

| `provider` | 字段 | 允许的协议 |
|---|---|---|
| `HS` | `api_url` | `http://`、`https://` |
| `HSPro`、`HSPro2` | `api_url` | `ws://`、`wss://` |
| `Minimax` | `api_url` | `http://`、`https://` |
| `Minimax` | `websocket_url` | `ws://`、`wss://` |

地址还必须包含有效主机名。

### 凭证安全

`speech_key`、`access_token`、`api_key` 是敏感凭证，不要写入日志、截图、公开仓库或浏览器持久化存储。生产环境的供应商凭证请通过星云平台应用管理配置。

## 7. 配置示例

以下示例均为构造参数 `tts_config` 的对象内容，配套服务和凭证应先在平台配置。`YOUR_SPEAKER_ID` 是音色 ID 占位符，使用前需替换。

### XMOV 常用配置

```json
{
  "provider": "XMOV_HN_TTS",
  "language": "zh",
  "speaker_id": "15",
  "is_large_model": false,
  "tts_speed": 1,
  "pitch": 1,
  "volume": 1,
  "audio_sample_rate": 24000
}
```

### Azure 音色配置

```json
{
  "provider": "AZURE",
  "language": "zh",
  "speaker_id": "zh-CN-XiaoxiaoNeural"
}
```

### HSPro2 情感配置

情感标签需与实际音色匹配：

```json
{
  "provider": "HSPro2",
  "language": "zh",
  "speaker_id": "YOUR_SPEAKER_ID",
  "support_emotion": [
    "happy",
    "sad"
  ],
  "emotion": "happy",
  "provider_config": {
    "context_texts": [
      "请使用自然、亲切的语气"
    ],
    "emotion_scale": 2
  }
}
```

### MiniMax 音色配置

```json
{
  "provider": "Minimax",
  "language": "zh",
  "speaker_id": "male-qn-qingse"
}
```

## 8. 旧配置迁移

旧配置 `config.tts_vcn_id` 仍兼容。新接入应使用构造参数 `tts_config`，将旧音色标识拆分为 `provider`、`language` 和 `speaker_id`。迁移时保留 `config` 中的其他配置，并移除旧的 `tts_vcn_id`，避免同时设置两套音色配置。

旧构造参数：

```javascript
const oldOptions = {
  ...baseOptions,
  config: {
    ...baseOptions.config,
    tts_vcn_id: "HSPro__zh_mix_zmd_peiluo",
  },
};
```

`baseOptions` 为原有公共接入参数。迁移时从旧 `config` 中移除音色字段，其他配置原样保留；若旧实例已初始化，应先销毁旧实例，再用新参数创建实例：

```javascript
const { tts_vcn_id: legacyVoiceId, ...renderConfig } = oldOptions.config;

const agent = new XingyunAvatarAgent({
  ...oldOptions,
  config: renderConfig,
  tts_config: {
    provider: "HSPro",
    language: "zh",
    speaker_id: "mix_zmd_peiluo",
  },
});
```

### 常见对应关系

| 旧 `tts_vcn_id` | `provider` | `language` | `speaker_id` |
|---|---|---|---|
| `HS__zh_BV001_streaming` | `HS` | `zh` | `BV001_streaming` |
| `HSPro__zh_mix_zmd_peiluo` | `HSPro` | `zh` | `mix_zmd_peiluo` |
| `HSPro2__zh_zh_female_vv_uranus_bigtts` | `HSPro2` | `zh` | `zh_female_vv_uranus_bigtts` |
| `11LABS__en_pNInz6obpgDQGcFmaJgB` | `11LABS` | `en` | `pNInz6obpgDQGcFmaJgB` |
| `Minimax__zh_mix_zmd_peiluo` | `Minimax` | `zh` | `mix_zmd_peiluo` |
| `AZURE__zh-CN-XiaoxiaoNeural` | `AZURE` | `zh` | `zh-CN-XiaoxiaoNeural` |
| `XMOV_HN_TTS__15` | `XMOV_HN_TTS` | `zh` | `15` |
| `XMOV_EN_TTS__100` | `XMOV_EN_TTS` | `en` | `100` |
| `XMOV_CNVC_TTS__CLONED_voice_cn` | `XMOV_CNVC_TTS` | `zh` | `CLONED_voice_cn` |
| `XMOV_ENVC_TTS__CLONED_voice_en` | `XMOV_ENVC_TTS` | `en` | `CLONED_voice_en` |

拆分规则：

- **HS 系列、11LABS、Minimax**：双下划线后第一个下划线前是语种，其余内容完整保留为音色 ID。
- **Azure**：从完整音色名称第一个连字符前取得语种，音色名称保持完整。
- **XMOV**：双下划线后的内容全部作为音色 ID；英文模型和英文克隆音色使用 `en`，其他 XMOV provider 使用 `zh`。

`tts_config.tts_vcn_id` 不受支持。

## 9. 常见问题

| 问题 | 说明 |
|---|---|
| 不配置 TTS 会使用什么音色？ | 不填写 `tts_config` 或传入 `{}` 时，使用平台默认音色。 |
| 自定义音色后初始化失败怎么办？ | 检查 `provider`、`language`、`speaker_id` 是否同时提供且非空，以及 provider 大小写是否准确。 |
| 找不到音色怎么办？ | 确认音色在当前环境中可用，且语种和音色 ID 符合对应 provider 的规则。 |
| 配置应该放在哪里？ | `tts_config` 与 `appId` 等构造参数同级，不放在 `config` 内。 |
| 专属参数或情感未生效怎么办？ | 检查字段是否属于当前 provider 的支持范围；情感标签须为音色实际支持的值，且 `emotion` 应包含在 `support_emotion` 中。 |
| 自定义地址无效怎么办？ | 检查协议是否符合 provider 要求，且地址包含有效主机名。 |
| 迁移后还需要保留旧字段吗？ | 迁移完成后移除 `config.tts_vcn_id`，保留 `config` 中其他配置。 |

## 相关文档

- [服务与配置](<../2 功能介绍/2.2 服务与配置.md>)
- [构造参数](<../3 API参考/3.1 构造参数.md>)
- [云文档原文](https://rsjqcmnt5p.feishu.cn/wiki/TcWtwe3sKia6zGkbXbVcpKXFnwM)（本地同步基于 2026-10-16 回读的修订 66）
