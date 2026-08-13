# 5 Android SDK 接入指南（v0.0.6）

# 一.准备工作

## 概述

本文是Lite_SDK_Android版本的接入文档，用于指导SDK的使用方法，默认读者已经熟悉 IDE（Eclipse 或者 Android Studio）的基本使用方法，以及具有一定的 Android 编程知识基础。

## 快速体验demo

- Android压缩包附带的apk文件中是虚拟人demo的安装包，可以直接安装到Android手机上。并快速体验在您的手机上的表现。
- Android压缩包附带的demo文件夹中是虚拟人的示例工程，使用Android studio打开示例工程，完成以下步骤配置，然后直接运行起来测试。

a. 替换SettingActivity中的appid和appSecret

b.demo_configs.json中的config按需配置

c.MockAudioInputsData.json是支持自行输入音频数据的示例格式



## 开发环境搭建

（1）将开发包拷贝到工程

将SDK中libs目录下的aar包拷贝到自己工程的libs目录下，如没有该目录需新建。

在app文件夹下的build.gradle的dependencies中配置对应版本的aar依赖详细代码如下：



```Java
implementation files('libs/xmovdigitalhuman-xxx.aar')
```



（2）添加外部第三方依赖 详细代码如下：

```Java
    implementation "javax.vecmath:vecmath:1.5.2"
    implementation "com.google.code.gson:gson:2.13.1"
    implementation "com.squareup.okhttp3:okhttp:5.1.0"
    implementation "org.msgpack:msgpack-core:0.9.3"
    implementation "io.socket:socket.io-client:2.1.0"
    // Protobuf 依赖
    implementation("com.google.protobuf:protobuf-javalite:3.21.12")
    // ExoPlayer dependency for WebM/Opus streaming
    implementation "androidx.media3:media3-exoplayer:1.9.0"
```



根 build.gradle.kts文件中增加protobuf相关配置

![这张图片展示了Android项目根build.gradle.kts文件的配置页面，核心是plugins代码块中的关键配置项，红框突出标注了`alias(libs.plugins.protobuf) apply false`这一内容。该图片与文档中“根build.gradle.kts文件中增加protobuf相关配置”的要求对应，清晰呈现了protobuf插件依赖的配置代码，是SDK接入准备工作里根Gradle文件配置环节的直观演示。](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=M2MyZTBmODVhMjE0OTY3MmIxZGI0NGM0M2I4Y2Q3Y2ZfNGNlMzU1NDhiNTFlMmJmNjhkN2Y1OGIwMmUxNTNhYTdfSUQ6NzY2MTIwNzQxOTY4MjMxMTA5OF8xNzg2NTA1MTc1OjE3ODY1MDg3NzVfVjM)

![图片展示了Android工程中libs.versions.toml文件的内容。其中，protobuf版本号被红色框突出显示为“0.9.4”。该文件还列出了JUnit、Espresso等依赖库的版本号。此图片与文档中“添加外部第三方依赖”步骤相关，用于说明在根build.gradle.kts文件中增加protobuf相关配置时，protobuf版本号的具体设置情况，以确保Android SDK接入时的依赖配置正确。](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OGVkMmU0MGMzMjc3OTcwZmE0MTZjYmI4NmE0MGRjYmRfYjlkNTVlMDQwYjZjMjUzODI3YThjZDliMWJiMWNhYWJfSUQ6NzY2MTIwNzQxNjg2ODI3NzQyOF8xNzg2NTA1MTc1OjE3ODY1MDg3NzVfVjM)



（3）配置AndroidManifest.xml文件



在manifest标签内添加必要的权限支持



```XML
<uses-permission android:name="android.permission.INTERNET"/>
```



(3) 混淆规则：



```Java
-keep public class com.xmov.metahuman.sdk.data.**{*;}
-keep public class com.xmov.metahuman.sdk.impl.data.**{*;}
-keep public class com.xmov.metahuman.sdk.impl.transport.http.**{*;}
-keep public interface com.xmov.metahuman.sdk.IXmovAvatar {*;}
-keep class com.xmov.metahuman.sdk.IXmovAvatar$Companion { *;}
-keep public interface com.xmov.metahuman.sdk.IAvatarListener {
    public protected *;
}
-keep public interface com.xmov.metahuman.sdk.PreCacheListener {
    public protected *;
}
```



通过上面的几个步骤，工程就配置完成了，接下来就可以在工程中使用虚拟人SDK进行开发了。



# 二.SDK使用说明

## 1.预缓存

预缓存是提前缓存视频资源或者charbin文件资源，可按需调用，不是必须调用的；调用时机在初始化方法之前调用

（1）预缓存视频

文件较多，需要几分钟时间，大屏常驻设备可提前调用缓存，按需调用

方法原型

```Java
fun preCache(
        context: Context,
        appId: String,
        appSecret: String,
        url: String,
        listener: PreCacheListener?
    )
```



参数描述

<sheet sheet-id="iHm7mr" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>



（2）预缓存charbin

时间较快，可提前调用，缩短初始化耗时

```Java
 fun preCacheCharBin(
        context: Context,
        appId: String,
        appSecret: String,
        url: String,
        listener: PreCacheListener?
    )
```



参数描述

<sheet sheet-id="qd09Km" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>



示例代码

```Java
//预缓存视频资源
IXmovAvatar.get().preCache(this,AppConfig.appId,AppConfig.appSecret, DemoConfig.gatewayServerCache
        ,object :
                PreCacheListener {
                override fun onPreCacheComplete() {
                    runOnUiThread {
                        LogUtil.i("onPreCacheComplete")
                        dismissLoading()
                        TipsToast.showTips("预缓存完成")
                        MainActivity.start(this@SplashActivity)
                        finish()
                    }
                }
                override fun onPreCacheProgress(progress: Int) {
                    runOnUiThread {
                        LogUtil.i("onPreCacheProgress: $progress")
                        setLoadingTitle("预缓存中 $progress%")
                    }
                }
            })

//预缓存charbin
IXmovAvatar.get().preCacheCharBin(this,AppConfig.appId,AppConfig.appSecret, DemoConfig.gatewayServerCache
        ,object :
                PreCacheListener {
                override fun onPreCacheComplete() {
                    runOnUiThread {
                        LogUtil.i("onPreCacheComplete")
                        dismissLoading()
                        TipsToast.showTips("预缓存完成")
                        MainActivity.start(this@SplashActivity)
                        finish()
                    }
                }
                override fun onPreCacheProgress(progress: Int) {
                    runOnUiThread {
                        LogUtil.i("onPreCacheProgress: $progress")
                        setLoadingTitle("预缓存中 $progress%")
                    }
                }
            })
```



1.进度回调onPreCacheProgress(progress: Int)  progress 范围是0-100，缓存的进度

2.完成回调 onPreCacheComplete（） 缓存完成

3.失败回调 onPreCacheFailed(errorCode: Int, errorMessage: String) 

## 2.初始化

使用SDK功能前，必须先进行初始化操作。



方法原型



```Java
fun init(
        context: Context,
        layout: ViewGroup,
        initConfig: InitConfig,
        listener: IAvatarListener?
    )
```



参数描述

<sheet sheet-id="RSxvOI" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>



InitConfig 类介绍

<sheet sheet-id="Ui0Hlx" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>





初始化示例代码



```Java
     IXmovAvatar.get().init(this, mBinding.avatarLayout, initConfig.appId, initConfig.appSecret,initConfig.gatewayServer,object : IAvatarListener {
            override fun onInitEvent(code: Int, message: String?) {
                LogUtil.d("onInitEvent code:$code,message:$message")
            }

            override fun onWidgetEvent(widgetData: IRawEventFrameData?) {
                LogUtil.d("onWidgetEvent widgetData:$widgetData")
            }

            override fun onNetworkInfo(sdkNetworkInfo: SDKNetworkInfo?) {
                LogUtil.d("onNetworkInfo $sdkNetworkInfo")
            }

            override fun onMessage(sdkMessage: SDKMessage?) {
                LogUtil.d("onMessage $sdkMessage")
            }

            override fun onStateChange(state: String?) {
                LogUtil.d("onStateChange $state")
            }

            override fun onStatusChange(status: SDKStatus?) {
                LogUtil.d("onStatusChange $status")
            }

            override fun onStateRenderChange(state: String?, duration: Long) {
                LogUtil.d("onStateRenderChange state：$state,duration:$duration")
            }

            override fun onVoiceStateChange(status: String?,clientSpeakId: String?) {
                LogUtil.d("onVoiceStateChange state：$status")
                runOnUiThread {
                    if ("voice_end" == status) { 
                    } else if ("voice_start" == status) {
                    }
                }
            }

            override fun onDebugInfo(debugInfo: JSONObject) {
                // LogUtil.d("onDebugInfo debugInfo：$debugInfo")
            }

            override fun onReconnectEvent(code: Int, message: String?) {
                toast("重连：code=$code message=$message")
            }

            override fun onOfflineEvent() {
                toast("进入离线状态")
            }

            override fun onSDKRuntimeError(code: Int, message: String?) {
                Log.d(TAG, "onSDKRuntimeError code:$code,message:$message")
                toast("onSDKRuntimeError code:$code,message:$message")
            }
             override fun onSpeakStateChange(
                speakState: String?,
                clientSpeakId: String?,
                errorMsg: String?
            ) {
                Log.d(TAG, "onSpeakStateChange :speakState=$speakState clientSpeakId=$clientSpeakId errorMsg=$errorMsg")
                toast("onSpeakStateChange :speakState=$speakState clientSpeakId=$clientSpeakId errorMsg=$errorMsg")
            }
            override fun onWalkStateChange(walkState: String?) {
                Log.d(TAG, "onWalkStateChange $walkState")
                toast("onWalkStateChange $walkState")
            }
        })
   
```



1.初始化回调

onInitEvent(code: Int, message: String?)方法返回参数分为外层code和result，含义如下：

<sheet sheet-id="0Yy2dT" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

2.事件回调（字幕回调）

onWidgetEvent(widgetData: IRawEventFrameData?) 

IRawEventFrameData实体类

<sheet sheet-id="2i6oAC" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

3.声音播报回调

onVoiceStateChange(status: String?,clientSpeakId: String?)

<sheet sheet-id="RjaEeD" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

4.重连在线模式回调

onReconnectEvent(code: Int, message: String?)

<sheet sheet-id="aYLsv9" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

5.SDK在运行过程中的错误回调

可在该回调中，进行重新初始化逻辑，保证设备长期运行

onSDKRuntimeError(code: Int, message: String?)

<sheet sheet-id="Xpej3f" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

6.speak事件回调

返回speak事件的开始，结束，错误状态

onSpeakStateChange(speakState: String?,clientSpeakId: String?,errorMsg: String?)

<sheet sheet-id="jvxTwD" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

7.walk事件回调

 onWalkStateChange(String walkState)

<sheet sheet-id="a3z81Q" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

## 3.config配置

在进行初始化时，initConfig中的config是一个json 字符串，可以定制化做一些配置

config字段名介绍

<sheet sheet-id="aSj6gp" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>



LayoutConfig介绍

（1）container（容器配置）

<sheet sheet-id="1ApnrI" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

（2）avatar（数字人布局配置）注意：align需要容器为约束布局ConstraintLayout 类型生效

<sheet sheet-id="XteXco" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

WalkConfig介绍

<sheet sheet-id="m2Ndre" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

配置示例

```JSON
{
  "max_reconnect_count": 5,
  "render_time_out": 12,
  "input_audio": false,
  "output_audio": true,
  "enable_client_interrupt": true,
  "resolution": {
    "width": 1080,
    "height": 1920
  },
  "layout": {
    "container": {
      "size": [
        2712,
        1220
      ]
    },
    "avatar": {
      "h_align": "center",
      "v_align": "middle",
      "scale": 1,
      "offset_x": 0,
      "offset_y": 0
    }
  },
  "walk_config": {
    "walk_points": {
      "A": -500,
      "B": -400,
      "C": -300,
      "D": -200,
      "E": -100,
      "F": 0,
      "G": 100,
      "H": 200,
      "I": 300,
      "J": 400,
      "K": 500,
      "O": 600,
      "P": 700,
      "Q": 800,
      "L": 900,
      "M": 1000
    },
    "init_point": 0
  }
}
```

## 4.Speak

### 4.1 SDK内部音频播报

方法原型

```Kotlin
fun speak(
    ssml: String?,
    isStart: Boolean,
    isEnd: Boolean,
    enableSpeechCache: Boolean? = null,
    clientSpeakId: String? = null
)
```



参数说明

<sheet sheet-id="SyH1U8" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

支持全文本和流式文本输入

（1）全文本输入时代码示例：

```Java
IXmovAvatar.get().speak("welcomeMessage", true, true, false,null)
```

 (2) 流式文本输入时代码示例

```Java
//开头
IXmovAvatar.get().speak("msg 1", true, false, false,null)
IXmovAvatar.get().speak("msg 2", false, false, false,null)
...
//结尾
IXmovAvatar.get().speak("msg 2", false, true, false,null)
```

### 4.2 SDK外部音频播报

**使用该方法时必须要设置config必须要配置"input_audio": true, "output_audio": true**

方法原型

```Kotlin
fun speak(
        ssml: String?,
        isStart: Boolean,
        isEnd: Boolean,
        ttsData: JSONObject,
        enableSpeechCache: Boolean? = null,
        clientSpeakId: String? = null
    )
```



参数说明

<sheet sheet-id="hm4Kdx" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

## 5.断线重连

本sdk支持，当网络波动或者无网情况下，自动进入离线状态，当有网络时会自动重连。

也支持客户手动切换到离线状态，然后再重连（注意 重连只能是离线状态下进行重连，其他状态进行重连会报错）

方法原型

```Java
fun switchModel(isOffline: Boolean)
```



参数说明

<sheet sheet-id="VqtyOv" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>

示例代码

```Java
IXmovAvatar.get().switchModel(true) 
```

## 6.销毁

销毁sdk实例，断开连接 进行资源释放。虚拟人退出时调用

方法原型

```Java
  fun destroy()
```

示例代码

```Java
IXmovAvatar.get().destroy()
```



## 7.设置行走配置

在初始化成功后重新设置初始点位

方法原型

```Java
fun changeWalkConfig(walkConfig: WalkConfig)
```

示例代码

```Kotlin
val walkConfig = WalkConfig().apply { 
    initPoint = -1000f
    walkPoints.apply {
        put("A", -1000.0f)
        put("B", -800.0f)
        put("C", -600.0f)
        put("D", -400.0f)
        put("E", -200.0f)
        put("F", 0.0f)
        put("G", 200.0f)
        put("H", 400.0f)
        put("I", 600.0f)
        put("J", 800.0f)
        put("K", 1000.0f)
    }
}
IXmovAvatar.newInstance().changeWalkConfig(walkConfig)
```



## 8.获取数字人X偏移量

在行走过程中可以用来获取当前数字人的X偏移量，单位px

方法原型

```Kotlin
fun getGlViewOffsetX(): Float
```

## 9.日志开关

在调试阶段可以打开日志，方便分析问题，应用发布时可关闭日志，提升性能，默认是打开日志的

关闭日志方法原型

```Java
fun hideDebugInfo()
```

示例代码

```Java
IXmovAvatar.get().hideDebugInfo()
```

打开日志方法原型

```Java
fun showDebugInfo()
```

示例代码

```Java
IXmovAvatar.get().showDebugInfo()
```

# 三.虚拟人状态

虚拟人常用的一下动作状态切换

## 1.倾听

代码示例 

```Java
IXmovAvatar.get().listen()
```

## 2.思考

代码示例

```Java
IXmovAvatar.get().think()
```

## 3.打断

代码示例

```Java
IXmovAvatar.get().interrupt()
```

# 四.返回码

该返回码为虚拟人SDK自身的返回码，具体错误在碰到之后查阅

主要用于onInitEvent、onReconnectEvent、onSDKRuntimeError回调

<sheet sheet-id="TdQunI" token="BqoYs8oH1hXQgttYS2zcJCyin2c"></sheet>
