#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// 获取自定义输出目录（来自环境变量或默认当前目录）
const outputDir = process.env.OUTPUT_DIR || process.cwd();

// 渲染 TUI 应用，传入输出目录
render(<App outputDir={outputDir} />);
