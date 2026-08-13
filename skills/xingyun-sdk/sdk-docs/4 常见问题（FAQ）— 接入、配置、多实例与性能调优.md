# 4 常见问题（FAQ）— 接入、配置、多实例与性能调优

## 接入前准备

### Q: appId 和 appSecret 如何获取？

**A**: 通过魔珐星云平台自助注册获取：

1. 访问[魔珐星云官网](https://xingyun3d.com/)注册账号
2. 创建**横屏应用**，在应用管理页面复制 `APP ID` 和 `APP SECRET`

> `appId` 用于标识应用，`appSecret` 用于请求签名验证，请妥善保管，不要泄露到前端代码仓库。

### Q: gatewayServer 怎么填？

**A**: `gatewayServer` 为固定值，直接填写即可：

```javascript
gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'
```

## 容器尺寸与画面预设分辨率的关系

### Q: 容器大小和画面预设分辨率有什么关系？

**A**:

- **容器大小**：决定 Canvas 在页面上显示的绘制
- **画面预设分辨率**：数字人角色素材的分辨率大小，一般为1080×1920(1080P)，可在星云工作台的应用配置中确认。

**建议**：实例创建时，合理设置`config.layout.scale`，避免将数字人缩放过大，导致渲染模糊

### Q: Canvas 会自动适应容器大小吗？

**A**: 是的。SDK 在初始化时会读取容器的实际尺寸，Canvas 会填满容器。如果容器大小发生变化（如窗口缩放），Canvas 不会自动调整，需要重新创建实例。

## 移动端 H5 注意事项

### Q: 移动端浏览器有什么限制？

**A**:

| 问题 | 说明 | 解决方案 |
|-|-|-|
| 音频自动播放 | iOS 要求用户交互后才能播放音频 | 在用户点击后调用 `init()` 和 `start()` |
| WebGL 性能 | 移动端 GPU 性能有限 | 降低分辨率，使用 `raw_audio: true` |
| 后台切换 | 切到后台时 WebGL 上下文可能丢失 | 监听 `visibilitychange` 使用隐身模式 |
| 内存限制 | 移动端内存有限 | 及时 `destroy()`，避免多实例 |

### Q: 微信浏览器中如何使用？

**A**:

- Android 微信浏览器：取决于系统 WebView 版本，Chrome 94+ 内核可正常使用
- iOS 微信浏览器：跟随系统 Safari 内核版本
- 建议在微信中使用 JSSDK 配合，确保音频播放权限

## 多实例共存方案

### Q: 一个页面可以创建多个数字人吗？

**A**: 可以，但需要注意：

1. **WebGL 上下文限制**：浏览器通常限制 8-16 个 WebGL 上下文，每个数字人实例占用一个
2. **性能开销**：每个实例都有独立的渲染循环和 WebSocket 连接
3. **资源占用**：每个实例都会下载独立的资源包

**最佳实践**：

```javascript
// 场景切换时，销毁旧实例再创建新实例
async function switchAvatar(newConfig) {
  if (currentAvatar) {
    await currentAvatar.destroy('switch_avatar');
  }
  currentAvatar = new XmovAvatar(newConfig);
  await currentAvatar.init();
  currentAvatar.start();
}
```

## 内存与性能调优

### Q: 页面运行时间较长后内存增长怎么办？

**A**:

1. **检查实例是否正确销毁**：确认在页面/组件卸载时调用了 `destroy()`
2. **降低分辨率**：高分辨率会占用大量 GPU 内存
3. **使用隐身模式**：不需要渲染时及时切换隐身模式（或者使用离线）
4. **避免多实例**：不需要的实例及时销毁

### Q: 渲染卡顿怎么排查？

**A**:

1. **开启调试面板**：`enableDebugger: true`，观察 FPS 和缓存队列
2. **检查网络**：通过 `onNetworkInfo` 查看 RTT，网络延迟高会导致数据不及时
3. **检查设备性能**：低端设备可能无法流畅运行，考虑降低分辨率
4. **检查浏览器**：Chrome 性能最佳，其他浏览器可能有性能差异

```javascript
const avatar = new XmovAvatar({
  // ...
  enableDebugger: true,
  onNetworkInfo(info) {
    console.log('RTT:', info.rtt, 'ms');
  },
  onStateRenderChange(state, duration) {
    if (duration > 100) {
      console.warn(`渲染延迟: ${state} 耗时 ${duration}ms`);
    }
  },
});

avatar.showDebugInfo();  // 显示实时调试信息
```

### Q: init() 初始化耗时有多久？

**A**: `init()` 需要下载资源包、建立连接并进行渲染，网络和硬件正常的情况下需要数秒的时间完成，在网络环境较差的情况下可能会更久。

**建议**：建议通过`onDownloadProgress`回调，在UI界面中实时更新展示加载进度，给到及时的视觉反馈，保证良好的用户体验。

## 运行时问题排查

### Q: 初始化一直不完成？

**A**: `init()` 的 `onDownloadProgress` 必须到 100% 才算完成。检查网络、`gatewayServer` 连通性。

### Q: 播报了但没声音？

**A**:

- 检查音量：`sdk.setVolume(1.0)`
- 检查是否有音频输出设备
- 看 `onVoiceStateChange` 有没有触发

### Q: 行走没有效果？

**A**:

- 并非所有数字人角色支持行走动作，需确认当前应用配置的角色是否支持行走
- 检查`walk_config`是否定义了SSML`target`中声明的点位，如果未定义，行走无法触发。两种定义方法示例如下：

```TypeScript
const sdk = new XmovAvatar({
  ...
  config: {
    walk_config: {
      min_x_offset: 0, max_x_offset: 500,
      walk_points: { F:0,G:100,H:200,I:300,J:400,K:500,L:600,M:700,N:800,O:900,P:1000,Q:1100,R:1200,S:1300,T:1400,U:1500 },
      init_point: 700
    }
  }
  ...
}）
// 也可以在行走前通过 changeWalkConfig 更具当前视口和业务进行行走配置
sdk.changeWalkConfig({
  walk_points: { F:0,G:100,H:200,I:300,J:400,K:500,L:600,M:700,N:800,O:900,P:1000,Q:1100,R:1200,S:1300,T:1400,U:1500 },
  init_point: 400
})
```

- 如果数字人原地踏步走，没有发生行走位移，检查是否定义了自定义widget回调`onWidgetEvent`或`proxyWidget.set_character_canvas_offset`。自定义widget回调会覆盖原生的行走逻辑

### Q: SSML 动作不触发？

**A**: 有多种可能的原因，请逐个检查确认：

- 传入的SSML语法是否正确无误
- 选用的数字人角色是否支持相应动作
- 前后两次触发的动作是否距离过近，导致第二个动作被忽略


### Q: 离线切换到在线后发送文字，数字人不播报？

**A**: SDK 从离线恢复到在线有一个过渡期，此时 `sdk.speak()` 不会立即生效。解决方案是在应用层实现**消息缓冲队列**：

```javascript
const _pendingSpeak = []
let _isOnline = true

function executeSsml(ssml) {
  if (!sdk || !isInitialized || !_isOnline) {
    _pendingSpeak.push(ssml)  // 先存起来
    return
  }
  sdk.speak(ssml, true, true)
}

// SDK 状态变化回调
onStatusChange(status) {
  if (status === 0) {           // 0 = 在线
    _isOnline = true
    flushSpeakQueue()           // 恢复连接后逐条播放
  } else {
    _isOnline = false
  }
}

function flushSpeakQueue() {
  while (_pendingSpeak.length > 0) {
    executeSsml(_pendingSpeak.shift())
  }
}
```

**关键点**：

- SDK `onStatusChange` 回调中 `status=0` 代表在线，此时 flush 队列最安全
- `flushSpeakQueue` 里用 `while` 而非 `forEach`，确保每条消息有序播放
- `destroy()` 时清空 `_pendingSpeak.length = 0`
