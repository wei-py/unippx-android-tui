## uniappx 原生SDK Android版 一切依据文档

> https://doc.dcloud.net.cn/uni-app-x/native/use/android.html

## 环境要求（正式版）

| 组件 | 版本 | 备注 |
|------|------|------|
| Java | 17 | Oracle JDK |
| Gradle | 8.4 | |
| AGP | 8.2.2 | Android Gradle Plugin |
| Kotlin 插件 | 1.9.10 | |
| kotlin-stdlib | 2.2.0 | 运行时依赖 |
| Android Studio | 2023.2.1 Patch 2 | 可选，命令行可不用 |

## 相关链接

- [uni-app x Android原生SDK 下载](https://doc.dcloud.net.cn/uni-app-x/native/download/android.html)
- [Android cmdline-tools](https://developer.android.com/studio?hl=zh-cn#command-line-tools-only)
- [Gradle 8.4](https://gradle.org/releases/#8.4)
- [Java 17](https://www.oracle.com/java/technologies/downloads/#java17)

我使用的是正式版, 全程使用命令行

## 项目框架

- ink react vite daisyui pnpm

- 我已下载当前文件夹
  - Gradle 8.4
  - cmdline-tools
  - uni-app x Android原生SDK
    - plugins
    - Sdk

## 目的

- 写创建 一个 uniappx 离线打包的 Android 模板的脚手架

## .env 配置

```.uniappx.env
SDK_PATH="/d/soft/Android/Sdk"
PLUGINS_PATH="/d/soft/Android/plugins"
GRADLE_VERSION="8.4"
COMPILE_SDK="34"
MIN_SDK="21"
TARGET_SDK="34"
BUILD_TOOLS="35.0.0"
KOTLIN_VERSION="1.9.0"
AGP_VERSION="8.2.2"

## 需求: 支持hjkl,空格选择或取消, enter确认或聚焦以及进入

- 基本信息: 即可展示也可修改, 数据保存到创建项目下的.unappx.env
  - PROJECT_NAME: 你的项目名称
  - PACKAGE_NAME: 你的包名
  - SDK_PATH: SDK路径
  - PLUGINS_PATH: 插件路径
  - GRADLE_VERSION: Gradle版本
  - COMPILE_SDK: 编译SDK版本
  - MIN_SDK: 最小SDK版本
  - TARGET_SDK: 目标SDK版本
  - BUILD_TOOLS: 构建工具版本
  - KOTLIN_VERSION: Kotlin版本
  - AGP_VERSION: AGP版本

- 选择sdk: 选中后自动填充sdk路径, 显示功能介绍和文件名
  
  
