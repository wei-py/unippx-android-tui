# UniApp X Android 离线打包问题诊断流程

> 支持使用 [markmap](https://markmap.js.org/) 可视化

## 编译错误诊断

### Kotlin 版本不兼容错误

#### 错误信息
```
CreateVueComponent was compiled with an incompatible version of Kotlin.
The actual metadata version is 2.2.0, but the compiler version 1.9.x can read versions up to 2.0.0
```

#### 问题根源
- SDK AAR 文件编译版本 ≠ 项目 Kotlin 版本
- DCloud SDK 4.87 实际使用 Kotlin 2.2.0（文档滞后）

#### 解决方案
1. 检查 `.uniappx.env` 配置
   - `KOTLIN_VERSION="2.2.0"`
   - `AGP_VERSION="8.2.2"` (支持 Kotlin 2.2.0)
   - `GRADLE_VERSION="8.4"`
2. 删除旧生成项目
3. 重新生成项目

#### 验证步骤
```bash
# 检查 AAR 编译版本
unzip -p path/to/framework-release.aar classes.jar | jar tf - | grep kotlin

# 检查项目配置
cat .uniappx.env | grep KOTLIN_VERSION
```

---

### Unresolved reference 错误

#### 错误类型 A: `_uM` 等 UTS 语法错误

##### 错误信息
```
Unresolved reference: _uM
```

##### 问题根源
- 缺少 UTS Kotlin 编译器插件

##### 解决方案
1. 检查 `uniappx/build.gradle`
   ```gradle
   plugins {
       id 'io.dcloud.uts.kotlin'  // 必须包含
   }
   ```
2. 检查 `plugins/` 目录存在
   - `uts-kotlin-compiler-plugin-0.0.1.jar`
   - `uts-kotlin-gradle-plugin-0.0.1.jar`
3. 重新生成项目

#### 错误类型 B: SDK 类型无法识别

##### 错误信息
```
Unresolved reference: VueComponent
Unresolved reference: UTSArray
Unresolved reference: io.dcloud.*
```

##### 问题根源
- `uniappx` 模块缺少 SDK AAR 依赖
- `uniappx/libs/` 目录缺失或为空

##### 解决方案
1. 检查 `uniappx/libs/` 包含19个核心 AAR
   ```bash
   ls uniappx/libs/*.aar | wc -l  # 应该 = 19
   ```
2. 检查 `uniappx/build.gradle` 包含
   ```gradle
   dependencies {
       implementation fileTree(include: ['*.aar'], dir: './libs')
   }
   ```
3. 确认 `src/data/sdk-modules.js` 中 `BASE_MODULES` 完整
4. 重新生成项目

##### 为什么 uniappx 需要单独的 AAR？
- `uniappx` 是 library 模块
- Library 模块无法访问父项目的 `app/libs` 依赖
- Kotlin 源码编译需要直接依赖

---

### AAR 文件缺失错误

#### 错误信息
```
Could not find android-gif-drawable-1.2.29.aar
```

#### 问题根源
- `resources/Sdk/libs/` 中 AAR 文件不完整
- `BASE_MODULES` 列表中的文件名与实际不符

#### 解决方案
1. 检查 SDK 下载完整性
   ```bash
   ls resources/Sdk/libs/*.aar | wc -l
   ```
2. 对比 `src/data/sdk-modules.js` 中 `BASE_MODULES`
3. 检查版本号匹配（如 `1.2.29` vs `1.2.28`）
4. 重新下载 SDK 或更新 `BASE_MODULES` 列表

#### SDK 版本差异
- 正式版 4.87: `android-gif-drawable-1.2.29.aar`
- 旧版本: `android-gif-drawable-1.2.28.aar`
- **文件名必须精确匹配**

---

### Gradle 相关错误

#### 错误 A: Gradle daemon 无法启动

##### 错误信息
```
Error: Gradle not found. Please ensure resources/gradle-8.4 exists.
```

##### 解决方案
1. 检查 `resources/gradle-8.4/` 目录存在
2. 检查 `gradlew` 可执行权限
   ```bash
   chmod +x gradlew
   chmod +x resources/gradle-8.4/bin/gradle
   ```
3. 检查 `.uniappx.env` 中 `GRADLE_VERSION` 匹配

#### 错误 B: AGP 版本不兼容

##### 错误信息
```
This version of the Android Gradle plugin requires Kotlin version X
```

##### 解决方案参考表

| AGP 版本 | 支持的 Kotlin 版本 | Gradle 版本 |
|---------|------------------|------------|
| 8.2.2   | 1.9.x - 2.2.0   | 8.4+       |
| 8.12.0  | 2.2.0+          | 8.14.3+    |

修改 `.uniappx.env` 使版本配套一致

---

## 资源复制问题

### UniApp X 项目资源未找到

#### 错误信息
```
⚠ 未找到资源目录: /path/to/unpackage/resources/app-android/{appid}
```

#### 问题根源
- 未在 HBuilderX 中执行"生成本地打包App资源"

#### 解决方案
1. 在 HBuilderX 中操作
   - 发行 → 原生App-本地打包 → 生成本地打包App资源
2. 等待生成完成
3. 验证目录存在
   ```bash
   ls PROJECT_PATH/unpackage/resources/app-android/
   ```
4. 重新运行脚手架

### manifest.json 解析失败

#### 错误信息
```
⚠ 读取 manifest.json 失败，使用默认配置
```

#### 常见原因
1. JSON 格式错误（注释语法）
2. 文件路径配置错误

#### 解决方案
1. 检查 `PROJECT_PATH` 配置正确
2. 验证 manifest.json 存在
   ```bash
   cat $PROJECT_PATH/manifest.json
   ```
3. 移除 JavaScript 注释
   - 脚手架会自动清理 `//` 和 `/* */`
   - 但嵌套复杂的情况可能失败

---

## 配置文件问题

### .uniappx.env 格式错误

#### 症状
- 配置值为空
- 路径解析错误

#### 正确格式示例
```bash
# 字符串用双引号包裹
PROJECT_NAME="MyApp"
PACKAGE_NAME="com.example.myapp"

# 路径使用绝对路径
PROJECT_PATH="/Users/username/projects/myapp"

# 版本号也用引号
KOTLIN_VERSION="2.2.0"

# 模块列表逗号分隔
SELECTED_MODULES="storage,network,camera"
```

#### 常见错误
```bash
# ❌ 错误：缺少引号
PROJECT_NAME=MyApp

# ❌ 错误：相对路径
PROJECT_PATH=../myapp

# ❌ 错误：模块列表有空格
SELECTED_MODULES="storage, network"
```

---

## 完整诊断流程图

### 编译失败诊断决策树

```
编译失败
├── Kotlin 版本错误？
│   ├── 是 → 检查 KOTLIN_VERSION="2.2.0"
│   └── 否 → 继续
├── Unresolved reference？
│   ├── _uM 相关
│   │   └── 添加 UTS Kotlin 插件
│   ├── VueComponent / UTSArray
│   │   └── 复制19个 AAR 到 uniappx/libs
│   └── 其他
│       └── 检查模块依赖
├── AAR not found？
│   ├── 检查 resources/Sdk/libs/ 完整性
│   └── 对比 BASE_MODULES 文件名
├── Gradle 错误？
│   ├── daemon 启动失败
│   │   └── 检查 resources/gradle-8.4/
│   └── AGP 不兼容
│       └── 修改 AGP_VERSION
└── 其他错误
    └── 查看完整日志 --stacktrace
```

### 资源生成问题决策树

```
资源未找到
├── unpackage 目录不存在？
│   └── HBuilderX 生成本地打包资源
├── manifest.json 解析失败？
│   ├── 检查 JSON 格式
│   └── 检查 PROJECT_PATH 配置
├── 图标未复制？
│   ├── 检查 manifest.json icons 配置
│   └── 使用默认图标（自动生成）
└── Kotlin 源码未复制？
    └── 检查 uniappx/app-android/src/ 存在
```

---

## 快速修复命令

### 完全重置并重新生成

```bash
# 1. 清理旧项目
rm -rf /path/to/generated/project

# 2. 清理 Gradle 缓存（可选，如果依赖问题）
rm -rf ~/.gradle/caches

# 3. 重新运行脚手架
cd /path/to/uniappx-tui
npm run dev

# 4. 编译新项目
cd /path/to/generated/project
./gradlew assembleDebug --stacktrace
```

### 验证 SDK 完整性

```bash
# 检查核心 AAR 数量
ls resources/Sdk/libs/*.aar | grep -E '(uts-runtime|app-common|framework|uni-)' | wc -l
# 应该 >= 19

# 检查插件 JAR
ls resources/plugins/*.jar
# 应该看到 uts-kotlin-*.jar

# 检查 Gradle
ls resources/gradle-8.4/bin/gradle
```

### 验证生成的项目

```bash
cd /path/to/generated/project

# 检查 AAR 分布
ls app/libs/*.aar | wc -l           # 全部模块 AAR
ls uniappx/libs/*.aar | wc -l       # 应该 = 19

# 检查 Kotlin 源码
find uniappx/src/main/java -name "*.kt" | head -5

# 检查 assets
ls uniappx/src/main/assets/apps/

# 测试编译（只编译不安装）
./gradlew uniappx:compileDebugKotlin
```

---

## 版本兼容性矩阵

### UniApp X SDK 版本对照

| SDK 版本 | 文档说明 Kotlin | 实际编译 Kotlin | AGP 版本 | Gradle 版本 |
|---------|---------------|---------------|---------|-----------|
| 4.87 正式版 | 1.9.10 | 2.2.0 ⚠️ | 8.2.2 | 8.4 |
| 4.87 alpha | 2.2.0 | 2.2.0 | 8.12.0 | 8.14.3 |

⚠️ 文档与实际不符，以实际编译版本为准

### Kotlin vs AGP 兼容性

| Kotlin 版本 | 最低 AGP | 推荐 AGP | 最高 AGP |
|-----------|---------|---------|---------|
| 2.2.0 | 7.3.1 | 8.2.2 | 8.13.0 |
| 2.3.0 | 8.2.2 | 8.12.0 | 9.0.0 |

### 依赖库版本约束

```gradle
// uniappx/build.gradle 必需的最低版本
implementation "org.jetbrains.kotlin:kotlin-stdlib:2.2.0"
implementation "androidx.core:core-ktx:1.10.1"
implementation "com.facebook.fresco:fresco:3.4.0"
```

---

## 调试技巧

### 查看 AAR 元数据

```bash
# 查看 Kotlin 版本
unzip -p framework-release.aar classes.jar | \
  jar tf - | grep -i kotlin_metadata

# 查看 AndroidManifest.xml
unzip -p uni-storage-release.aar AndroidManifest.xml | \
  xmllint --format -
```

### Gradle 调试模式

```bash
# 查看详细依赖树
./gradlew :uniappx:dependencies --configuration debugCompileClasspath

# 查看任务执行详情
./gradlew assembleDebug --info --stacktrace

# 只编译不打包（更快）
./gradlew compileDebugKotlin
```

### 日志关键词速查

| 错误关键词 | 可能原因 | 排查位置 |
|----------|---------|---------|
| `metadata version` | Kotlin 版本不匹配 | .uniappx.env |
| `_uM` | UTS 插件缺失 | build.gradle |
| `VueComponent` | AAR 缺失 | uniappx/libs/ |
| `Could not find` | 文件路径错误 | resources/ |
| `daemon` | Gradle 配置错误 | gradlew |
| `permission denied` | 文件权限 | chmod +x |

---

## 常见问题 FAQ

### Q: 为什么要复制 AAR 到两个地方？

**A:** Android Gradle 架构限制
- Library 模块（uniappx）无法访问 App 模块（app）的依赖
- uniappx 中的 Kotlin 代码需要编译，必须直接依赖 SDK AAR
- app 模块需要所有功能 AAR（包括可选模块）

### Q: 能否使用 Gradle 7.x？

**A:** 不推荐
- Kotlin 2.2.0 最低要求 Gradle 7.6.3
- 但会有 deprecation warnings
- UniApp X SDK 测试基于 Gradle 8.4

### Q: 如何添加自定义模块？

**A:** 修改 `src/data/sdk-modules.js`
```javascript
export const OPTIONAL_MODULES = [
  // ... 现有模块
  {
    name: 'my-custom',
    displayName: '自定义模块',
    description: '我的自定义功能',
    files: ['uni-my-custom-release.aar'],
  }
];
```

### Q: 生成的项目可以移动到其他机器吗？

**A:** 可以，但注意：
- `resources/` 目录包含 Gradle 和 SDK，需要一起复制
- `local.properties` 使用相对路径 `resources/Sdk`
- 不依赖系统环境的 Gradle/SDK 安装

### Q: 如何更新到新版本 SDK？

**A:** 步骤：
1. 下载新版 SDK 替换 `resources/Sdk/libs/`
2. 检查 AAR 文件名变化（如版本号）
3. 更新 `src/data/sdk-modules.js` 中 `BASE_MODULES`
4. 检查编译 Kotlin 版本并更新 `DEFAULT_CONFIG`
5. 重新测试生成和编译流程
