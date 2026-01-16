import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import * as path from 'path';
import { ConfigEditor } from './components/ConfigEditor.js';
import { SdkSelector } from './components/SdkSelector.js';
import { Generator } from './components/Generator.js';
import { 
  type EnvConfig, 
  DEFAULT_CONFIG, 
  loadEnvConfig, 
  saveEnvConfig,
  getDefaultSdkPath,
  getDefaultPluginsPath 
} from './utils/env.js';

interface AppProps {
  outputDir?: string;
}

// 流程: config -> modules (可选广告等模块) -> generate
type Screen = 'config' | 'modules' | 'generate';

export function App({ outputDir }: AppProps = {}) {
  const [screen, setScreen] = useState<Screen>('config');
  const [config, setConfig] = useState<EnvConfig>(DEFAULT_CONFIG);
  const [envPath, setEnvPath] = useState('');

  useEffect(() => {
    // 初始化配置
    const cwd = process.cwd();
    const envFile = path.join(cwd, '.uniappx.env');
    setEnvPath(envFile);

    // 加载现有配置
    const loadedConfig = loadEnvConfig(envFile);
    
    // 自动设置 SDK 和插件路径 (用户不需要手动配置)
    if (!loadedConfig.SDK_PATH) {
      loadedConfig.SDK_PATH = getDefaultSdkPath();
    }
    if (!loadedConfig.PLUGINS_PATH) {
      loadedConfig.PLUGINS_PATH = getDefaultPluginsPath();
    }

    setConfig(loadedConfig);
  }, []);

  const handleConfigUpdate = (newConfig: EnvConfig) => {
    setConfig(newConfig);
    // 自动保存配置
    if (envPath) {
      saveEnvConfig(envPath, newConfig);
    }
  };

  const handleModulesUpdate = (modules: string[]) => {
    const newConfig = { ...config, SELECTED_MODULES: modules };
    setConfig(newConfig);
    if (envPath) {
      saveEnvConfig(envPath, newConfig);
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} borderStyle="double" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">
          🚀 UniApp X Android 离线打包脚手架
        </Text>
      </Box>

      {screen === 'config' && (
        <ConfigEditor 
          config={config}
          onUpdate={handleConfigUpdate}
          onComplete={() => setScreen('modules')}
        />
      )}

      {screen === 'modules' && (
        <SdkSelector
          selectedModules={config.SELECTED_MODULES}
          onUpdate={handleModulesUpdate}
          onComplete={() => setScreen('generate')}
          onBack={() => setScreen('config')}
        />
      )}

      {screen === 'generate' && (
        <Generator
          config={config}
          outputPath={outputDir || process.cwd()}
          onComplete={() => {}}
          onBack={() => setScreen('modules')}
        />
      )}

      <Box marginTop={1}>
        <Text dimColor>
          配置自动保存到: {envPath}
        </Text>
      </Box>
    </Box>
  );
}
