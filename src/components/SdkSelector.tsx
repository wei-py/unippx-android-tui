import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { OPTIONAL_MODULES, type SdkModule } from '../data/sdk-modules.js';

interface SdkSelectorProps {
  selectedModules: string[];
  onUpdate: (modules: string[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function SdkSelector({ selectedModules, onUpdate, onComplete, onBack }: SdkSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { exit } = useApp();

  const VISIBLE_ROWS = 15;
  const modules = OPTIONAL_MODULES;

  // 确保选中项在可见范围内
  const adjustScroll = (newIndex: number) => {
    if (newIndex < scrollOffset) {
      setScrollOffset(newIndex);
    } else if (newIndex >= scrollOffset + VISIBLE_ROWS) {
      setScrollOffset(newIndex - VISIBLE_ROWS + 1);
    }
  };

  useInput((input, key) => {
    if (input === 'j' || key.downArrow) {
      const newIndex = Math.min(selectedIndex + 1, modules.length - 1);
      setSelectedIndex(newIndex);
      adjustScroll(newIndex);
    } else if (input === 'k' || key.upArrow) {
      const newIndex = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(newIndex);
      adjustScroll(newIndex);
    } else if (input === 'g') {
      setSelectedIndex(0);
      setScrollOffset(0);
    } else if (input === 'G') {
      const newIndex = modules.length - 1;
      setSelectedIndex(newIndex);
      adjustScroll(newIndex);
    } else if (input === ' ') {
      // 空格切换选中状态
      const module = modules[selectedIndex];
      if (selectedModules.includes(module.name)) {
        onUpdate(selectedModules.filter(m => m !== module.name));
      } else {
        onUpdate([...selectedModules, module.name]);
      }
    } else if (input === 'a') {
      // 全选
      onUpdate(modules.map(m => m.name));
    } else if (input === 'c') {
      // 清空选择
      onUpdate([]);
    } else if (key.return || input === 'n') {
      // 下一步
      onComplete();
    } else if (key.escape || input === 'b') {
      // 返回上一步
      onBack();
    } else if (input === 'q') {
      exit();
    }
  });

  const visibleModules = modules.slice(scrollOffset, scrollOffset + VISIBLE_ROWS);
  const currentModule = modules[selectedIndex];

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">📦 选择 SDK 模块</Text>
        <Text dimColor> ({selectedModules.length}/{modules.length} 已选)</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>
          ↑/k 上移 · ↓/j 下移 · 空格 选择/取消 · a 全选 · c 清空 · n 下一步 · b 返回
        </Text>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
        {scrollOffset > 0 && (
          <Text dimColor>  ↑ 还有 {scrollOffset} 项...</Text>
        )}
        
        {visibleModules.map((module, visibleIndex) => {
          const actualIndex = scrollOffset + visibleIndex;
          const isSelected = actualIndex === selectedIndex;
          const isChecked = selectedModules.includes(module.name);

          return (
            <Box key={module.name}>
              <Text color={isSelected ? 'cyan' : undefined}>
                {isSelected ? '❯ ' : '  '}
              </Text>
              <Text color={isChecked ? 'green' : 'gray'}>
                {isChecked ? '[✓]' : '[ ]'}
              </Text>
              <Text> </Text>
              <Box width={18}>
                <Text bold={isSelected} color={isChecked ? 'green' : undefined}>
                  {module.displayName}
                </Text>
              </Box>
              <Text dimColor>{module.description}</Text>
            </Box>
          );
        })}

        {scrollOffset + VISIBLE_ROWS < modules.length && (
          <Text dimColor>  ↓ 还有 {modules.length - scrollOffset - VISIBLE_ROWS} 项...</Text>
        )}
      </Box>

      {currentModule && (
        <Box marginTop={1} flexDirection="column">
          <Text bold color="blue">选中模块详情:</Text>
          <Text>
            <Text bold>{currentModule.displayName}</Text>
            <Text dimColor> - {currentModule.description}</Text>
          </Text>
          <Text dimColor>
            文件: {currentModule.files.join(', ')}
          </Text>
        </Box>
      )}
    </Box>
  );
}