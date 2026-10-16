# SDK 版本基线与差异

本技能的 Web SDK 文档以 `@xmov/avatar@2.4.1` 为默认基线。源码核对点为 `offline-sdk` 的 `master` 提交 `4c4b36b3bcbaf1728e5b677937906c8b8c530765`；核对日期 2026-10-16。机器可读记录见 [sdk-baseline.json](sdk-baseline.json)。

回答前先读取目标项目的 package.json、锁文件或实际 CDN URL，确认版本与入口。没有版本信息时说明采用 2.4.1 基线；不要把浮动 `@latest` 当作 2.4.1。源码和类型检查可确认接口，不代表真实 Gateway、角色素材、音色或设备已验收。

## TypeScript 解析模式

本仓库以 TypeScript 5.6.3 的 `module: "ESNext"`、`moduleResolution: "Bundler"` 验证 Agent 示例，使用 npm 上实际的 2.4.1 包，不映射到本地 SDK 源码。

2.4.1 的 `.d.ts` 包含 `../index`、`./types` 等无扩展名相对导入；在 Node16/NodeNext ESM 解析下，除了根入口缺少 `exports.types`，Agent 的继承成员和构造参数也可能解析不完整。`skipLibCheck` 不能修复丢失的类型。需要这类解析模式的项目应先验证目标 SDK 修订版，不要通过 `any`、私有路径或伪造模块声明绕过。Node 的传统解析与 Bundler 解析由仓库校验覆盖，差异不代表运行时网络验收。

## 两个入口

- `@xmov/avatar/agent`：`XingyunAvatarAgent`，默认推荐的 ASR / Brain / 数字人交互闭环。
- `@xmov/avatar`：`XmovAvatar`，渲染与驱动入口。二者同属一个 npm 包；“渲染入口”不等于已经停止维护。

2.4.1 的 Agent 类继承渲染类，但覆盖了 `speak()`、`interrupt()`、`switchInvisibleMode()` 等行为。共享 SSML 和动作资料不代表方法签名可以互换。

## 2.5 开发版差异

以下仅针对 `develop` 的 `2.5.0-alpha.1`，提交 `978608aa0a4776121ad1b37e1470b4b9cddb0723`。这是开发版快照，不作为 2.4.1 的功能说明，也不保证后续 2.5 版本完全相同。

| 项目 | 2.4.1 基线 | 2.5.0-alpha.1 快照 |
|------|------------|-------------------|
| Agent 类结构 | 继承 `XmovAvatar` | 公开类显式转发允许的方法，不能依赖旧原型链或内部成员 |
| 类型导出 | Agent 类型从 `/agent` 导出；根入口未显式导出渲染类型 | 根入口导出 `InitModel`、`RenderState`、`AvatarStatus` 等公开类型；Agent 类型仍从 `/agent` 导入 |
| 类型解析 | 根入口缺少 `exports.types`；声明内部有无扩展名相对导入，Node16 ESM 下可能丢失继承类型 | 根入口增加 `types` 条件并收敛声明；仍需以目标发布包实测 |
| 继承方法 | 可见 `offlineMode()`、`onlineMode()`、`reStartSession()`、`isDestroyed()`、`getOptions()` | 上述方法不在公开类中；按应用目的重新设计，不能直接调用内部实现替代 |
| 测试注入与内部选项 | 类型/继承链中仍有内部用途字段 | 构造参数按公开白名单转发，`webSocketCtor` 不再公开 |
| 包内容 | 包含 `dist/` 及部分源码/内部声明 | 白名单发布 `package-dist/`；深层源码与内部类型不作为消费入口 |
| 监控配置 | 以该版本的实现和部署为准 | 公开 `sentry.enabled`，显式启用才开启公共云监控 |
| 录制方法 | 部分方法可调用 | `startRecoder`、`stopRecoder`、`exportVideo` 保留但标为 deprecated；`exportVideo()` 不返回 Blob |

两版都保留 `containerId: string` 的类型要求。Agent 的三参数 `speak()`、无参数 `interrupt()`、异步隐身和外部音频流入口也不能因升级而套用旧版签名。

## 文档使用边界

- `sdk-docs/` 的 Web 内容按 2.4.1 核对；Android v0.0.6 与 SaaS 功能清单是独立资料，不用 JS 版本推断其能力。
- 需要旧版 SSML、动作意图或 Widget 细节时可以查共享资料；回到 Agent 生成代码前，复核 Agent 公开方法签名。
- 2.4.1 不支持从 `@xmov/avatar/agent` 导入 `AgentServiceConfig`、`RenderState`、`InitModel`。类型推导方式见 [类型定义](<../e2esdk-docs/3 API参考/3.8 类型定义.md>)。不要使用包内部路径绕过导出边界。
- provider、音色、情感、SSML 标签支持范围属于服务端/角色契约；SDK 透传字段不能证明所有服务都支持。

## 2.4.1 核心调用示例

此示例由仓库校验直接提取并进行类型检查。页面需提供 `#agent-avatar`，填写应用配置后运行；麦克风采集由单独的用户操作触发。

<!-- validate:ts -->
```ts
import XingyunAvatarAgent from "@xmov/avatar/agent";

export async function connect() {
  const agent = new XingyunAvatarAgent({
    containerId: "#agent-avatar",
    appId: "your-app-id",
    appSecret: "your-app-secret",
    gatewayServer: "https://nebula-agent.xingyun3d.com/user/v1/ttsa_v2/session",
    onMessage: console.error,
    agentCallbacks: {
      onConversationChange(event) {
        if (event.state === "completed") console.log("本轮完成");
      },
      onError: console.error,
    },
  });
  try {
    await agent.init();
    agent.speak("<speak>首段</speak>", true, false);
    agent.speak("<speak>中间段</speak>", false, false);
    agent.speak("<speak>末段</speak>", false, true);
    return agent;
  } catch (error) {
    await agent.destroy("init_failed").catch(console.error);
    throw error;
  }
}

export async function pauseInteraction(agent: XingyunAvatarAgent) {
  agent.interrupt();
  await agent.stopASR();
  await agent.switchInvisibleMode(); // 切换，调用前应确认当前是否可见
}

export function updateWalk(agent: XingyunAvatarAgent) {
  agent.changeWalkConfig({
    min_x_offset: -400,
    max_x_offset: 400,
    walk_points: { left: 0, center: 400, right: 800 },
    init_point: 400,
  });
}
```
