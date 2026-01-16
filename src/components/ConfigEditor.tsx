import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { type EnvConfig, DEFAULT_CONFIG, loadEnvConfig, saveEnvConfig, getDefaultSdkPath, getDefaultPluginsPath } from '../utils/env.js';

interface ConfigEditorProps {
  config: EnvConfig;
  onUpdate: (config: EnvConfig) => void;
  onComplete: () => void;
}

type ConfigKey = keyof Omit<EnvConfig, 'SELECTED_MODULES'>;

// 只显示用户需要配置的核心字段
const CONFIG_FIELDS: { key: ConfigKey; label: string; description: string }[] = [
  { key: 'PROJECT_NAME', label: '项目名称', description: '生成的 Android 项目名称' },
  { key: 'PACKAGE_NAME', label: '包名', description: 'Android 应用包名 (如 com.example.app)' },
  { key: 'APP_ID', label: 'AppID', description: 'DCloud AppID (如 __UNI__5067A0E)' },
  { key: 'PROJECT_PATH', label: 'UniApp项目', description: 'UniApp X 项目路径 (用于自动复制资源和检测模块)' },
];

// 这些字段是自动检测或固定的，不需要用户编辑
// SDK_PATH, PLUGINS_PATH - 自动从 resources 目录检测
// COMPILE_SDK, MIN_SDK, TARGET_SDK, BUILD_TOOLS - 使用固定推荐值
// KOTLIN_VERSION, AGP_VERSION, GRADLE_VERSION - 使用固定推荐值

export function ConfigEditor({ config, onUpdate, onComplete }: ConfigEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const { exit } = useApp();

  const currentField = CONFIG_FIELDS[selectedIndex];

  useInput((input, key) => {
    // 编辑模式
    if (editingIndex !== null) {
      if (key.return) {
        // 保存编辑
        const field = CONFIG_FIELDS[editingIndex];
        onUpdate({ ...config, [field.key]: editValue });
        setEditingIndex(null);
        setEditValue('');
      } else if (key.escape) {
        // 取消编辑
        setEditingIndex(null);
        setEditValue('');
      } else if (key.backspace || key.delete) {
        setEditValue(prev => prev.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setEditValue(prev => prev + input);
      }
      return;
    }

    // 导航模式
    if (input === 'j' || key.downArrow) {
      setSelectedIndex(i => Math.min(i + 1, CONFIG_FIELDS.length - 1));
    } else if (input === 'k' || key.upArrow) {
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (input === 'g') {
      setSelectedIndex(0);
    } else if (input === 'G') {
      setSelectedIndex(CONFIG_FIELDS.length - 1);
    } else if (key.return || input === 'e') {
      // 进入编辑模式
      const field = CONFIG_FIELDS[selectedIndex];
      setEditingIndex(selectedIndex);
      setEditValue(config[field.key] as string);
    } else if (input === 'n') {
      // 下一步
      onComplete();
    } else if (input === 'q') {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">📋 基本信息配置</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text dimColor>
          ↑/k 上移 · ↓/j 下移 · Enter/e 编辑 · n 下一步 · q 退出
        </Text>
      </Box>

      <Box flexDirection="column">
        {CONFIG_FIELDS.map((field, index) => {
          const isSelected = index === selectedIndex;
          const isEditing = index === editingIndex;
          const value = isEditing ? editValue : (config[field.key] as string);
          
          return (
            <Box key={field.key} marginY={0}>
              <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '❯ ' : '  '}
              </Text>
              <Box width={14}>
                <Text bold={isSelected}>{field.label}</Text>
              </Box>
              <Text dimColor>: </Text>
              <Box flexGrow={1}>
                {isEditing ? (
                  <Text backgroundColor="blue" color="white">
                    {value}
                    <Text color="yellow">▌</Text>
                  </Text>
                ) : (
                  <Text color={value ? 'green' : 'yellow'}>
                    {value || '(未设置)'}
                  </Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {editingIndex !== null && (
        <Box marginTop={1} borderStyle="single" borderColor="blue" padding={1}>
          <Text>
            <Text bold color="blue">编辑中: </Text>
            <Text>{CONFIG_FIELDS[editingIndex].description}</Text>
            <Text dimColor> · Enter 保存 · Esc 取消</Text>
          </Text>
        </Box>
      )}

      {editingIndex === null && currentField && (
        <Box marginTop={1}>
          <Text dimColor>💡 {currentField.description}</Text>
        </Box>
      )}
    </Box>
  );
}