import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { type EnvConfig } from '../utils/env.js';
import { getModuleFiles, BASE_MODULES } from '../data/sdk-modules.js';

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
        path.join(projectPath, 'app', 'src', 'main', 'java'),
        path.join(projectPath, 'app', 'src', 'main', 'res', 'values'),
        path.join(projectPath, 'uniappx'),
        path.join(projectPath, 'uniappx', 'libs'),
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

      // 生成 settings.gradle
      addLog('📝 生成 settings.gradle');
      const settingsGradle = generateSettingsGradle(config);
      fs.writeFileSync(path.join(projectPath, 'settings.gradle'), settingsGradle);

      // 生成根 build.gradle
      addLog('📝 生成根 build.gradle');
      const rootBuildGradle = generateRootBuildGradle(config);
      fs.writeFileSync(path.join(projectPath, 'build.gradle'), rootBuildGradle);

      // 生成 app/build.gradle
      addLog('📝 生成 app/build.gradle');
      const appBuildGradle = generateAppBuildGradle(config);
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

      // 生成 app/src/main/AndroidManifest.xml
      addLog('📝 生成 app/AndroidManifest.xml');
      const appManifest = generateAppManifest(config);
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

      // 复制 SDK aar 文件
      if (config.SDK_PATH && fs.existsSync(config.SDK_PATH)) {
        addLog('📦 复制 SDK aar 文件');
        const requiredFiles = getModuleFiles(config.SELECTED_MODULES);
        let copiedCount = 0;
        
        for (const file of requiredFiles) {
          const srcPath = path.join(config.SDK_PATH, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(projectPath, 'uniappx', 'libs', file));
            copiedCount++;
          }
        }
        addLog(`✓ 已复制 ${copiedCount}/${requiredFiles.length} 个 aar 文件`);
      }

      // 生成 strings.xml
      addLog('📝 生成 strings.xml');
      const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${config.PROJECT_NAME}</string>
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

      addLog('');
      addLog('🎉 项目生成完成!');
      addLog(`📂 项目路径: ${projectPath}`);
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
              <Text>已选模块: <Text color="green">{config.SELECTED_MODULES.length} 个可选模块 + 基础模块</Text></Text>
            </Box>
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

function generateAppBuildGradle(config: EnvConfig): string {
  return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${config.PACKAGE_NAME}'
    compileSdk ${config.COMPILE_SDK}

    defaultConfig {
        applicationId "${config.PACKAGE_NAME}"
        minSdk ${config.MIN_SDK}
        targetSdk ${config.TARGET_SDK}
        versionCode 1
        versionName "1.0"
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
}
`;
}

function generateUniappxBuildGradle(config: EnvConfig): string {
  return `plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
    id 'io.dcloud.uts.kotlin'
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

function generateGradleProperties(): string {
  return `# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`;
}

function generateAppManifest(config: EnvConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />

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