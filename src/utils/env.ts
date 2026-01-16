import * as fs from 'fs';
import * as path from 'path';

export interface EnvConfig {
  PROJECT_NAME: string;
  PACKAGE_NAME: string;
  APP_ID: string;
  PROJECT_PATH: string;  // UniApp X 项目路径
  SDK_PATH: string;
  PLUGINS_PATH: string;
  GRADLE_VERSION: string;
  COMPILE_SDK: string;
  MIN_SDK: string;
  TARGET_SDK: string;
  BUILD_TOOLS: string;
  KOTLIN_VERSION: string;
  AGP_VERSION: string;
  SELECTED_MODULES: string[];
}

export const DEFAULT_CONFIG: EnvConfig = {
  PROJECT_NAME: 'MyUniAppX',
  PACKAGE_NAME: 'com.example.uniappx',
  APP_ID: '__UNI__XXXXXXX',
  PROJECT_PATH: '',  // UniApp X 项目路径
  SDK_PATH: '',
  PLUGINS_PATH: '',
  GRADLE_VERSION: '8.4',
  COMPILE_SDK: '34',
  MIN_SDK: '21',
  TARGET_SDK: '34',
  BUILD_TOOLS: '35.0.0',
  KOTLIN_VERSION: '1.9.10',
  AGP_VERSION: '8.2.2',
  SELECTED_MODULES: [],
};

export function loadEnvConfig(filePath: string): EnvConfig {
  const config = { ...DEFAULT_CONFIG };

  if (!fs.existsSync(filePath)) {
    return config;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    let value = trimmed.substring(eqIndex + 1).trim();

    // 移除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key === 'SELECTED_MODULES') {
      config.SELECTED_MODULES = value ? value.split(',').map(s => s.trim()) : [];
    } else if (key in config) {
      (config as any)[key] = value;
    }
  }

  return config;
}

export function saveEnvConfig(filePath: string, config: EnvConfig): void {
  const lines: string[] = [
    '# UniApp X 离线打包配置',
    '# 由 uniappx-tui 生成',
    '',
    '# 项目基本信息',
    `PROJECT_NAME="${config.PROJECT_NAME}"`,
    `PACKAGE_NAME="${config.PACKAGE_NAME}"`,
    `APP_ID="${config.APP_ID}"`,
    `PROJECT_PATH="${config.PROJECT_PATH}"`,
    '',
    '# SDK 路径',
    `SDK_PATH="${config.SDK_PATH}"`,
    `PLUGINS_PATH="${config.PLUGINS_PATH}"`,
    '',
    '# 版本配置',
    `GRADLE_VERSION="${config.GRADLE_VERSION}"`,
    `COMPILE_SDK="${config.COMPILE_SDK}"`,
    `MIN_SDK="${config.MIN_SDK}"`,
    `TARGET_SDK="${config.TARGET_SDK}"`,
    `BUILD_TOOLS="${config.BUILD_TOOLS}"`,
    `KOTLIN_VERSION="${config.KOTLIN_VERSION}"`,
    `AGP_VERSION="${config.AGP_VERSION}"`,
    '',
    '# 选中的模块',
    `SELECTED_MODULES="${config.SELECTED_MODULES.join(',')}"`,
    '',
  ];

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

export function getDefaultSdkPath(): string {
  // 尝试从脚本目录查找 resources
  const scriptDir = path.dirname(process.argv[1] || '.');
  const resourcesPath = path.join(scriptDir, 'resources', 'Sdk', 'libs');

  if (fs.existsSync(resourcesPath)) {
    return resourcesPath;
  }

  // 尝试当前目录
  const cwdPath = path.join(process.cwd(), 'resources', 'Sdk', 'libs');
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  return '';
}

export function getDefaultPluginsPath(): string {
  const scriptDir = path.dirname(process.argv[1] || '.');
  const resourcesPath = path.join(scriptDir, 'resources', 'plugins');

  if (fs.existsSync(resourcesPath)) {
    return resourcesPath;
  }

  const cwdPath = path.join(process.cwd(), 'resources', 'plugins');
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  return '';
}