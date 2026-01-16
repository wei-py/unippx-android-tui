import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { type EnvConfig } from '../utils/env.js';
// @ts-ignore
import { getModuleFiles, getModulesFromManifest, BASE_MODULES } from '../data/sdk-modules.js';

// 在 ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeneratorProps {
  config: EnvConfig;
  outputPath: string;
  onComplete: () => void;
  onBack: () => void;
}

type GenerateStatus = 'ready' | 'generating' | 'success' | 'error';

export function Generator({ config, outputPath, onComplete, onBack }: GeneratorProps) {
  const [status, setStatus] = useState<GenerateStatus>('ready');
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { exit } = useApp();

  // 预读取 manifest.json 用于预览显示
  const [previewInfo, setPreviewInfo] = useState<{
    appName: string;
    versionName: string;
    versionCode: string;
    detectedModules: string[];
  }>({
    appName: config.PROJECT_NAME,
    versionName: '1.0.0',
    versionCode: '1',
    detectedModules: [],
  });

  useEffect(() => {
    if (config.PROJECT_PATH && fs.existsSync(config.PROJECT_PATH)) {
      const manifestPath = path.join(config.PROJECT_PATH, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const content = fs.readFileSync(manifestPath, 'utf-8');
          const cleaned = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
          const manifest = JSON.parse(cleaned);
          
          const modules = getModulesFromManifest(manifest);
          
          setPreviewInfo({
            appName: manifest.name || config.PROJECT_NAME,
            versionName: manifest.versionName || '1.0.0',
            versionCode: String(manifest.versionCode || '1'),
            detectedModules: modules,
          });
        } catch (e) {
          // 忽略错误，使用默认值
        }
      }
    }
  }, [config.PROJECT_PATH, config.PROJECT_NAME]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const generateProject = async () => {
    setStatus('generating');
    setLogs([]);
    setError(null);

    try {
      // 在指定的输出目录下创建项目
      const projectPath = path.join(outputPath, config.PROJECT_NAME);
      addLog(`📁 创建项目目录: ${projectPath}`);
      
      // 创建目录结构
      const dirs = [
        projectPath,
        path.join(projectPath, 'app'),
        path.join(projectPath, 'app', 'libs'),
        path.join(projectPath, 'app', 'src', 'main', 'java'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'values'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'mipmap-hdpi'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'mipmap-mdpi'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'mipmap-xhdpi'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'mipmap-xxhdpi'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi'),
        path.join(projectPath, 'uniappx'),
        path.join(projectPath, 'uniappx', 'libs'),  // uniappx 模块也需要 libs 目录
        path.join(projectPath, 'uniappx', 'src', 'main', 'java'),
        path.join(projectPath, 'uniappx', 'src', 'main', 'res', 'values'),
        path.join(projectPath, 'uniappx', 'src', 'main', 'assets', 'apps'),
        path.join(projectPath, 'plugins'),
        path.join(projectPath, 'gradle', 'wrapper'),
        path.join(projectPath, 'resources')  // 添加 resources 目录
      ];

      for (const dir of dirs) {
        fs.mkdirSync(dir, { recursive: true });
      }
      addLog('✓ 目录结构已创建');

      // 首先从 UniApp X 项目读取 manifest.json (用于版本、模块、权限等)
      let manifest: any = {};
      let androidPermissions: string[] = [];
      let appName = config.PROJECT_NAME;  // 默认使用项目名称
      let versionCode = '1';
      let versionName = '1.0.0';
      
      if (config.PROJECT_PATH && fs.existsSync(config.PROJECT_PATH)) {
        const manifestPath = path.join(config.PROJECT_PATH, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const cleanedContent = manifestContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
            manifest = JSON.parse(cleanedContent);
            addLog('✓ 读取 manifest.json 成功');
            
            if (manifest.name) {
              appName = manifest.name;
              addLog(`✓ 应用名称: ${appName}`);
            }
            
            if (manifest.versionCode) {
              versionCode = String(manifest.versionCode);
            }
            if (manifest.versionName) {
              versionName = manifest.versionName;
            }
            addLog(`✓ 版本: ${versionName} (${versionCode})`);
            
            const perms = manifest?.['app-android']?.distribute?.permissions;
            if (perms && Array.isArray(perms)) {
              androidPermissions = perms;
              addLog(`✓ 检测到 ${perms.length} 个权限配置`);
            }
          } catch (e) {
            addLog('⚠ 读取 manifest.json 失败，使用默认配置');
          }
        }
      }

      // 生成 settings.gradle
      addLog('📝 生成 settings.gradle');
      const settingsGradle = generateSettingsGradle(config);
      fs.writeFileSync(path.join(projectPath, 'settings.gradle'), settingsGradle);

      // 生成根 build.gradle
      addLog('📝 生成根 build.gradle');
      const rootBuildGradle = generateRootBuildGradle(config);
      fs.writeFileSync(path.join(projectPath, 'build.gradle'), rootBuildGradle);

      // 生成 app/build.gradle (使用 manifest.json 中的版本信息)
      addLog('📝 生成 app/build.gradle');
      const appBuildGradle = generateAppBuildGradle(config, versionCode, versionName);
      fs.writeFileSync(path.join(projectPath, 'app', 'build.gradle'), appBuildGradle);

      // 生成 uniappx/build.gradle
      addLog('📝 生成 uniappx/build.gradle');
      const uniappxBuildGradle = generateUniappxBuildGradle(config);
      fs.writeFileSync(path.join(projectPath, 'uniappx', 'build.gradle'), uniappxBuildGradle);

      // 生成 gradle.properties
      addLog('📝 生成 gradle.properties');
      const gradleProperties = generateGradleProperties();
      fs.writeFileSync(path.join(projectPath, 'gradle.properties'), gradleProperties);

      // 生成 local.properties
      addLog('📝 生成 local.properties');
      // 使用项目内部的 resources/Sdk 目录
      const localProperties = `sdk.dir=${path.join(projectPath, 'resources', 'Sdk').replace(/\\/g, '\\')}\n`;
      fs.writeFileSync(path.join(projectPath, 'local.properties'), localProperties);

      // 生成 app/src/main/AndroidManifest.xml (包含动态权限)
      addLog('📝 生成 app/AndroidManifest.xml');
      const appManifest = generateAppManifest(config, androidPermissions);
      fs.writeFileSync(path.join(projectPath, 'app', 'src', 'main', 'AndroidManifest.xml'), appManifest);

      // 生成 uniappx/src/main/AndroidManifest.xml
      addLog('📝 生成 uniappx/AndroidManifest.xml');
      const uniappxManifest = generateUniappxManifest(config);
      fs.writeFileSync(path.join(projectPath, 'uniappx', 'src', 'main', 'AndroidManifest.xml'), uniappxManifest);

      // 复制 plugins
      if (config.PLUGINS_PATH && fs.existsSync(config.PLUGINS_PATH)) {
        addLog('📦 复制 gradle 插件');
        const pluginFiles = fs.readdirSync(config.PLUGINS_PATH);
        for (const file of pluginFiles) {
          if (file.endsWith('.jar')) {
            fs.copyFileSync(
              path.join(config.PLUGINS_PATH, file),
              path.join(projectPath, 'plugins', file)
            );
          }
        }
        addLog(`✓ 已复制 ${pluginFiles.filter(f => f.endsWith('.jar')).length} 个插件文件`);
      }

      // 复制 SDK aar 文件到 app/libs 和 uniappx/libs
      if (config.SDK_PATH && fs.existsSync(config.SDK_PATH)) {
        addLog('📦 复制 SDK aar 文件');

        // 优先从 manifest.json 自动识别模块，否则使用配置中的选择
        let selectedModules = config.SELECTED_MODULES;
        if (Object.keys(manifest).length > 0) {
          const autoModules = getModulesFromManifest(manifest);
          if (autoModules.length > 0) {
            selectedModules = autoModules;
            addLog(`✓ 自动识别模块: ${autoModules.join(', ')}`);
          }
        }

        const requiredFiles = getModuleFiles(selectedModules);
        let copiedToAppCount = 0;
        let copiedToUniappxCount = 0;

        // 复制到 app/libs
        for (const file of requiredFiles) {
          const srcPath = path.join(config.SDK_PATH, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(projectPath, 'app', 'libs', file));
            copiedToAppCount++;
          }
        }

        // 复制核心19个 AAR 到 uniappx/libs（用于 Kotlin 代码编译）
        for (const file of BASE_MODULES) {
          const srcPath = path.join(config.SDK_PATH, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(projectPath, 'uniappx', 'libs', file));
            copiedToUniappxCount++;
          }
        }

        addLog(`✓ 已复制 ${copiedToAppCount}/${requiredFiles.length} 个 aar 文件到 app/libs`);
        addLog(`✓ 已复制 ${copiedToUniappxCount}/${BASE_MODULES.length} 个核心 aar 文件到 uniappx/libs`);
      }

      // 从 UniApp X 项目复制资源
      if (config.PROJECT_PATH && fs.existsSync(config.PROJECT_PATH)) {
        addLog('📱 从 UniApp X 项目复制资源');

        // 1. 复制 assets 资源 (unpackage/resources/app-android/{appid})
        const appId = config.APP_ID.trim();
        const resourcesAppPath = path.join(config.PROJECT_PATH, 'unpackage', 'resources', 'app-android', appId);
        const assetsAppsPath = path.join(projectPath, 'uniappx', 'src', 'main', 'assets', 'apps', appId);
        
        if (fs.existsSync(resourcesAppPath)) {
          addLog('📦 复制 assets 资源文件');
          copyDirectoryRecursive(resourcesAppPath, assetsAppsPath);
          addLog('✓ assets 资源复制完成');
        } else {
          addLog(`⚠ 未找到资源目录: ${resourcesAppPath}`);
          addLog('  请先在 HBuilderX 中执行: 发行 -> 原生App-本地打包 -> 生成本地打包App资源');
        }

        // 2. 复制 kt 文件 (unpackage/resources/app-android/uniappx/app-android/src/)
        const ktSrcPath = path.join(config.PROJECT_PATH, 'unpackage', 'resources', 'app-android', 'uniappx', 'app-android', 'src');
        const ktDestPath = path.join(projectPath, 'uniappx', 'src', 'main', 'java');
        
        if (fs.existsSync(ktSrcPath)) {
          addLog('📦 复制 Kotlin 源代码');
          copyDirectoryRecursive(ktSrcPath, ktDestPath);
          addLog('✓ Kotlin 源代码复制完成');
        }

        // 3. 复制图标 (从 manifest.json 的 app-android.distribute.icons)
        const androidIcons = manifest?.['app-android']?.distribute?.icons;
        if (androidIcons) {
          addLog('🎨 复制应用图标');
          const iconMapping = [
            { key: 'hdpi', dir: 'mipmap-hdpi' },
            { key: 'xhdpi', dir: 'mipmap-xhdpi' },
            { key: 'xxhdpi', dir: 'mipmap-xxhdpi' },
            { key: 'xxxhdpi', dir: 'mipmap-xxxhdpi' }
          ];
          
          let iconsCopied = 0;
          for (const { key, dir } of iconMapping) {
            const iconRelPath = androidIcons[key];
            if (iconRelPath) {
              const iconSrcPath = path.join(config.PROJECT_PATH, iconRelPath);
              if (fs.existsSync(iconSrcPath)) {
                const mipmapDir = path.join(projectPath, 'app', 'src', 'main', 'res', dir);
                fs.mkdirSync(mipmapDir, { recursive: true });
                
                // 复制为 ic_launcher.png 和 ic_launcher_round.png
                const ext = path.extname(iconSrcPath);
                fs.copyFileSync(iconSrcPath, path.join(mipmapDir, `ic_launcher${ext}`));
                fs.copyFileSync(iconSrcPath, path.join(mipmapDir, `ic_launcher_round${ext}`));
                iconsCopied++;
              }
            }
          }
          
          if (iconsCopied > 0) {
            addLog(`✓ 已复制 ${iconsCopied} 个图标`);
          } else {
            addLog('⚠ 未找到图标文件，将使用默认图标');
            generateDefaultIcons(projectPath);
          }
        } else {
          addLog('⚠ manifest.json 中未配置图标，将使用默认图标');
          generateDefaultIcons(projectPath);
        }

        // 4. 权限已在生成 AndroidManifest.xml 时处理

      } else {
        addLog('⚠ 未配置 PROJECT_PATH，跳过 UniApp X 资源复制');
        addLog('  将生成默认图标');
        generateDefaultIcons(projectPath);
      }

      // 辅助函数：生成默认图标
      function generateDefaultIcons(projectPath: string) {
        const defaultIconXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#3DDC84"
        android:pathData="M54,54m-40,0a40,40 0,1 1,80 0a40,40 0,1 1,-80 0"/>
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M42,42h24v24h-24z"/>
</vector>`;
        
        const densities = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
        for (const dir of densities) {
          const mipmapDir = path.join(projectPath, 'app', 'src', 'main', 'res', dir);
          fs.mkdirSync(mipmapDir, { recursive: true });
          fs.writeFileSync(path.join(mipmapDir, 'ic_launcher.xml'), defaultIconXml);
          fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_round.xml'), defaultIconXml);
        }
      }

      // 生成 strings.xml (使用 manifest.json 中的应用名称)
      addLog('📝 生成 strings.xml');
      const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
</resources>`;
      fs.writeFileSync(path.join(projectPath, 'app', 'src', 'main', 'res', 'values', 'strings.xml'), stringsXml);
      fs.writeFileSync(path.join(projectPath, 'uniappx', 'src', 'main', 'res', 'values', 'strings.xml'), stringsXml);

      // 复制 resources 目录到项目中
      addLog('📦 复制 resources 资源目录');
      const resourcesSrc = path.join(__dirname, '../../resources');
      const resourcesDest = path.join(projectPath, 'resources');
      
      // 递归复制整个 resources 目录
      function copyDirectoryRecursive(src: string, dest: string) {
        if (!fs.existsSync(src)) return;
        
        fs.mkdirSync(dest, { recursive: true });
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDirectoryRecursive(resourcesSrc, resourcesDest);
      addLog('✓ resources 目录复制完成');

      // 创建 Android SDK licenses 文件 (自动接受许可证)
      addLog('📜 配置 Android SDK 许可证');
      const licensesDir = path.join(projectPath, 'resources', 'Sdk', 'licenses');
      fs.mkdirSync(licensesDir, { recursive: true });
      
      // Android SDK License (通用许可证哈希值)
      const androidSdkLicense = `
8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451eabf01fb78af6dfcb131a6481e
24333f8a63b6825ea9c5514f83c2829b004d1fee`;
      
      // Android SDK Preview License
      const androidSdkPreviewLicense = `
84831b9409646a918e30573bab4c9c91346d8abd`;
      
      // Intel Android Extra License
      const intelAndroidExtraLicense = `
d975f751698a77b662f1254ddbeed3901e976f5a`;

      fs.writeFileSync(path.join(licensesDir, 'android-sdk-license'), androidSdkLicense.trim());
      fs.writeFileSync(path.join(licensesDir, 'android-sdk-preview-license'), androidSdkPreviewLicense.trim());
      fs.writeFileSync(path.join(licensesDir, 'intel-android-extra-license'), intelAndroidExtraLicense.trim());
      addLog('✓ Android SDK 许可证已接受');

      // 生成 Gradle Wrapper
      addLog('📝 生成 Gradle Wrapper');
      const gradleWrapperDir = path.join(projectPath, 'gradle', 'wrapper');
      fs.mkdirSync(gradleWrapperDir, { recursive: true });
      
      // gradle-wrapper.properties
      const wrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
      fs.writeFileSync(path.join(gradleWrapperDir, 'gradle-wrapper.properties'), wrapperProperties);
      
      // gradlew (Unix shell script)
      const gradlewScript = `#!/bin/sh
#
# Gradle wrapper script for Unix
#

# Determine the project base directory
APP_HOME="\$(cd "\$(dirname "$0")" && pwd -P)"

# Use local gradle if available
if [ -x "$APP_HOME/resources/gradle-8.4/bin/gradle" ]; then
    exec "$APP_HOME/resources/gradle-8.4/bin/gradle" "$@"
else
    echo "Error: Gradle not found. Please ensure resources/gradle-8.4 exists."
    exit 1
fi
`;
      fs.writeFileSync(path.join(projectPath, 'gradlew'), gradlewScript);
      fs.chmodSync(path.join(projectPath, 'gradlew'), 0o755);
      
      // gradlew.bat (Windows batch script)
      const gradlewBat = `@rem Gradle wrapper script for Windows
@echo off
setlocal

set APP_HOME=%~dp0

if exist "%APP_HOME%resources\\gradle-8.4\\bin\\gradle.bat" (
    call "%APP_HOME%resources\\gradle-8.4\\bin\\gradle.bat" %*
) else (
    echo Error: Gradle not found. Please ensure resources\\gradle-8.4 exists.
    exit /b 1
)

endlocal
`;
      fs.writeFileSync(path.join(projectPath, 'gradlew.bat'), gradlewBat);
      addLog('✓ Gradle Wrapper 生成完成');

      // 设置 Gradle 可执行权限
      addLog('🔧 设置 Gradle 可执行权限');
      const gradleBin = path.join(projectPath, 'resources', 'gradle-8.4', 'bin', 'gradle');
      if (fs.existsSync(gradleBin)) {
        fs.chmodSync(gradleBin, 0o755);
        addLog('✓ Gradle 可执行权限已设置');
      }

      addLog('');
      addLog('🎉 项目生成完成!');
      addLog(`📂 项目路径: ${projectPath}`);
      addLog('');
      addLog('📋 下一步操作:');
      addLog(`   cd ${projectPath}`);
      addLog('   ./gradlew assembleDebug');
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  useInput((input, key) => {
    if (status === 'ready') {
      if (key.return || input === 'g') {
        generateProject();
      } else if (key.escape || input === 'b') {
        onBack();
      } else if (input === 'q') {
        exit();
      }
    } else if (status === 'success' || status === 'error') {
      if (key.return || input === 'q') {
        exit();
      } else if (input === 'b') {
        onBack();
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">🚀 生成 Android 项目</Text>
      </Box>

      {status === 'ready' && (
        <>
          <Box flexDirection="column" marginBottom={1}>
            <Text>即将生成以下配置的项目:</Text>
            <Box marginLeft={2} flexDirection="column">
              <Text>项目名称: <Text color="green">{config.PROJECT_NAME}</Text></Text>
              <Text>包名: <Text color="green">{config.PACKAGE_NAME}</Text></Text>
              <Text>AppID: <Text color="green">{config.APP_ID}</Text></Text>
              <Text>输出路径: <Text color="green">{outputPath}</Text></Text>
            </Box>
            
            {config.PROJECT_PATH && (
              <Box marginTop={1} flexDirection="column">
                <Text bold color="cyan">📱 从 UniApp X 项目检测到:</Text>
                <Box marginLeft={2} flexDirection="column">
                  <Text>应用名称: <Text color="yellow">{previewInfo.appName}</Text></Text>
                  <Text>版本: <Text color="yellow">{previewInfo.versionName}</Text> <Text dimColor>(build {previewInfo.versionCode})</Text></Text>
                  <Text>检测模块: <Text color="yellow">{previewInfo.detectedModules.length > 0 ? previewInfo.detectedModules.join(', ') : '基础模块'}</Text></Text>
                </Box>
              </Box>
            )}
            
            {!config.PROJECT_PATH && (
              <Box marginTop={1}>
                <Text color="yellow">⚠ 未配置 UniApp 项目路径，将使用默认配置</Text>
              </Box>
            )}
          </Box>
          <Text dimColor>按 Enter 或 g 开始生成 · b 返回 · q 退出</Text>
        </>
      )}

      {(status === 'generating' || status === 'success' || status === 'error') && (
        <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
          {logs.map((log, i) => (
            <Text key={i}>{log}</Text>
          ))}
        </Box>
      )}

      {status === 'error' && error && (
        <Box marginTop={1}>
          <Text color="red">❌ 错误: {error}</Text>
        </Box>
      )}

      {status === 'success' && (
        <Box marginTop={1}>
          <Text dimColor>按 Enter 或 q 退出 · b 返回继续</Text>
        </Box>
      )}
    </Box>
  );
}

// 模板生成函数
function generateSettingsGradle(config: EnvConfig): string {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
        flatDir { dirs('./plugins/') }
    }
}

rootProject.name = "${config.PROJECT_NAME}"
include ':app'
include ':uniappx'
`;
}

function generateRootBuildGradle(config: EnvConfig): string {
  return `buildscript {
    dependencies {
        classpath(files('plugins/uts-kotlin-compiler-plugin-0.0.1.jar'))
        classpath(files('plugins/uts-kotlin-gradle-plugin-0.0.1.jar'))
    }
}

plugins {
    id 'com.android.application' version '${config.AGP_VERSION}' apply false
    id 'com.android.library' version '${config.AGP_VERSION}' apply false
    id 'org.jetbrains.kotlin.android' version '${config.KOTLIN_VERSION}' apply false
}
`;
}

function generateAppBuildGradle(config: EnvConfig, versionCode: string = '1', versionName: string = '1.0.0'): string {
  return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'io.dcloud.uts.kotlin'
}

android {
    namespace '${config.PACKAGE_NAME}'
    compileSdk ${config.COMPILE_SDK}

    defaultConfig {
        applicationId "${config.PACKAGE_NAME}"
        minSdk ${config.MIN_SDK}
        targetSdk ${config.TARGET_SDK}
        versionCode ${versionCode}
        versionName "${versionName}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation project(':uniappx')
    implementation fileTree(include: ['*.aar'], dir: './libs')
    implementation "androidx.core:core-ktx:1.10.1"
    implementation "androidx.recyclerview:recyclerview:1.3.2"
    implementation "androidx.appcompat:appcompat:1.0.0"
    implementation "androidx.exifinterface:exifinterface:1.3.6"
    implementation "androidx.localbroadcastmanager:localbroadcastmanager:1.0.0@aar"
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    implementation "androidx.webkit:webkit:1.6.0"
    implementation "com.google.android.material:material:1.4.0"
    implementation "androidx.viewpager2:viewpager2:1.1.0-beta02"
    implementation "com.alibaba:fastjson:1.2.83"
    implementation "com.facebook.fresco:fresco:3.4.0"
    implementation "com.facebook.fresco:middleware:3.4.0"
    implementation "com.facebook.fresco:animated-gif:3.4.0"
    implementation "com.facebook.fresco:webpsupport:3.4.0"
    implementation "com.facebook.fresco:animated-webp:3.4.0"
    implementation "com.caverock:androidsvg:1.4"
    implementation "com.github.bumptech.glide:glide:4.9.0"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4"
    implementation "org.jetbrains.kotlin:kotlin-stdlib:2.2.0"
    implementation "org.jetbrains.kotlin:kotlin-reflect:2.2.0"
    implementation "org.jetbrains.kotlinx:kotlinx-serialization-json:1.4.1"
    implementation "com.squareup.okhttp3:okhttp:3.12.12"
    implementation "com.github.getActivity:XXPermissions:18.63"
    implementation "net.lingala.zip4j:zip4j:2.11.5"
}
`;
}

function generateUniappxBuildGradle(config: EnvConfig): string {
  return `plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${config.PACKAGE_NAME}.uniappx'
    compileSdk ${config.COMPILE_SDK}

    defaultConfig {
        minSdk ${config.MIN_SDK}
        targetSdk ${config.TARGET_SDK}
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    // SDK AAR 依赖 (必须包含，用于 Kotlin 代码编译)
    implementation fileTree(include: ['*.aar'], dir: './libs')

    // 核心依赖
    implementation "androidx.core:core-ktx:1.10.1"
    implementation "androidx.recyclerview:recyclerview:1.3.2"
    implementation "androidx.appcompat:appcompat:1.0.0"
    implementation "androidx.exifinterface:exifinterface:1.3.6"
    implementation "androidx.localbroadcastmanager:localbroadcastmanager:1.0.0@aar"
    implementation "androidx.constraintlayout:constraintlayout:2.1.4"
    implementation "androidx.webkit:webkit:1.6.0"
    implementation "com.google.android.material:material:1.4.0"
    implementation "androidx.viewpager2:viewpager2:1.1.0-beta02"

    // Kotlin 标准库
    implementation "org.jetbrains.kotlin:kotlin-stdlib:2.2.0"
    implementation "org.jetbrains.kotlin:kotlin-reflect:2.2.0"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.6.4"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4"
    implementation "org.jetbrains.kotlinx:kotlinx-serialization-json:1.4.1"

    // JSON 解析
    implementation "com.alibaba:fastjson:1.2.83"

    // 图像库
    implementation "com.facebook.fresco:fresco:3.4.0"
    implementation "com.facebook.fresco:middleware:3.4.0"
    implementation "com.facebook.fresco:animated-gif:3.4.0"
    implementation "com.facebook.fresco:webpsupport:3.4.0"
    implementation "com.facebook.fresco:animated-webp:3.4.0"
    implementation "com.caverock:androidsvg:1.4"
    implementation "com.github.bumptech.glide:glide:4.9.0"

    // 网络库
    implementation "com.squareup.okhttp3:okhttp:3.12.12"

    // 权限库
    implementation "com.github.getActivity:XXPermissions:18.63"

    // ZIP 库
    implementation "net.lingala.zip4j:zip4j:2.11.5"
}
`;
}

function generateGradleProperties(): string {
  return `# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`;
}

function generateAppManifest(config: EnvConfig, permissions: string[] = []): string {
  // 构建权限声明
  const defaultPermissions = ['<uses-permission android:name="android.permission.INTERNET" />'];
  const allPermissions = [...defaultPermissions];
  
  // 添加从 manifest.json 读取的权限
  for (const perm of permissions) {
    // 权限可能已经是完整的 XML 标签，也可能只是权限名称
    if (perm.includes('<uses-permission')) {
      if (!allPermissions.includes(perm)) {
        allPermissions.push(perm);
      }
    } else {
      const permTag = `<uses-permission android:name="${perm}" />`;
      if (!allPermissions.includes(permTag)) {
        allPermissions.push(permTag);
      }
    }
  }
  
  const permissionsXml = allPermissions.map(p => `    ${p}`).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

${permissionsXml}

    <application
        android:name="io.dcloud.uniapp.UniApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        tools:targetApi="31">

        <meta-data
            android:name="DCLOUD_UNI_APPID"
            android:value="${config.APP_ID}" />

        <activity
            android:name="io.dcloud.uniapp.UniAppActivity"
            android:configChanges="orientation|keyboard|keyboardHidden|smallestScreenSize|screenLayout|screenSize|mcc|mnc|fontScale|navigation|uiMode"
            android:exported="true"
            android:label="@string/app_name"
            android:screenOrientation="portrait"
            android:theme="@style/UniAppX.Activity.DefaultTheme"
            android:windowSoftInputMode="adjustResize"
            tools:replace="android:label,android:exported,android:theme,android:configChanges,android:windowSoftInputMode,android:screenOrientation">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`;
}

function generateUniappxManifest(config: EnvConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
`;
}