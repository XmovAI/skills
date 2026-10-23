# SDK 接入约定

## 选择入口

- `@xmov/avatar/agent`：`XingyunAvatarAgent`，默认推荐的 ASR / Brain / 数字人交互闭环。
- `@xmov/avatar`：`XmovAvatar`，渲染与驱动入口。二者同属一个 npm 包。

根据实际导入与构造器选择文档。Agent 的 `speak()`、`interrupt()`、`switchInvisibleMode()` 等行为与渲染入口不同；共享 SSML 和动作资料时仍应使用对应入口的方法签名。

## 公开接口与共享资料

- 从公开入口导入类型。文档中的辅助结构不一定是 SDK 导出；未直接导出的类型可从方法、参数或回调推导，见 [类型定义](<../e2esdk-docs/3 API参考/3.8 类型定义.md>)。
- 类型解析报错时，检查项目的模块解析配置和安装包公开声明。`skipLibCheck` 不能补齐缺失的导出，不要用 `any`、私有路径或伪造模块声明绕过。
- Android 与 SaaS 功能清单是独立资料，不能据此推断 Web SDK 的接口。
- provider、音色、情感、SSML 标签支持范围属于服务端/角色契约；SDK 透传字段不能证明所有服务都支持。

## 核心调用示例

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
