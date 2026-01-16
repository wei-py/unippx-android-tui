/**
 * UniApp X SDK 模块配置
 * @typedef {Object} SdkModule
 * @property {string} name - 模块标识名
 * @property {string} displayName - 显示名称
 * @property {string} description - 模块描述
 * @property {string[]} files - 关联的 aar 文件列表
 */

/**
 * @type {SdkModule}
 */
export const SdkModule = {};

/**
 * 基础必需模块 - 这些 aar 文件是必须包含的
 * 根据 https://doc.dcloud.net.cn/uni-app-x/native/use/android.html
 * 必需的19个核心 AAR 文件
 * @type {string[]}
 */
export const BASE_MODULES = [
  'uts-runtime-release.aar',
  'android-gif-drawable-1.2.28.aar',
  'app-common-release.aar',
  'app-runtime-release.aar',
  'breakpad-build-release.aar',
  'dcloud-layout-release.aar',
  'framework-release.aar',
  'uni-exit-release.aar',
  'uni-getAccessibilityInfo-release.aar',
  'uni-getAppAuthorizeSetting-release.aar',
  'uni-getAppBaseInfo-release.aar',
  'uni-getSystemSetting-release.aar',
  'uni-openAppAuthorizeSetting-release.aar',
  'uni-prompt-release.aar',
  'uni-storage-release.aar',
  'uni-getDeviceInfo-release.aar',
  'uni-getSystemInfo-release.aar',
  'uni-rpx2px-release.aar',
  'uni-theme-release.aar',
];

/**
 * 可选功能模块
 * @type {SdkModule[]}
 */
export const OPTIONAL_MODULES = [
  {
    name: 'storage',
    displayName: 'Storage',
    description: '本地数据存储 (getStorage/setStorage)',
    files: ['uni-storage-release.aar'],
  },
  {
    name: 'network',
    displayName: 'Network',
    description: '网络请求 (request/uploadFile/downloadFile)',
    files: ['uni-network-release.aar'],
  },
  {
    name: 'media-image',
    displayName: 'Image',
    description: '图片处理 (chooseImage/previewImage/getImageInfo)',
    files: ['uni-media-release.aar'],
  },
  {
    name: 'media-video',
    displayName: 'Video',
    description: '视频处理 (chooseVideo/createVideoContext)',
    files: ['uni-video-release.aar'],
  },
  {
    name: 'file',
    displayName: 'File',
    description: '文件系统 (getFileSystemManager)',
    files: ['uni-file-release.aar'],
  },
  {
    name: 'location',
    displayName: 'Location',
    description: '位置服务 (getLocation/openLocation)',
    files: ['uni-location-release.aar'],
  },
  {
    name: 'map',
    displayName: 'Map',
    description: '地图组件',
    files: ['uni-map-release.aar'],
  },
  {
    name: 'push',
    displayName: 'Push',
    description: '消息推送',
    files: ['uni-push-release.aar'],
  },
  {
    name: 'share',
    displayName: 'Share',
    description: '分享功能',
    files: ['uni-share-release.aar'],
  },
  {
    name: 'payment',
    displayName: 'Payment',
    description: '支付功能 (微信/支付宝)',
    files: ['uni-payment-release.aar'],
  },
  {
    name: 'oauth',
    displayName: 'OAuth',
    description: '第三方登录',
    files: ['uni-oauth-release.aar'],
  },
  {
    name: 'bluetooth',
    displayName: 'Bluetooth',
    description: '蓝牙功能',
    files: ['uni-bluetooth-release.aar'],
  },
  {
    name: 'scanner',
    displayName: 'Scanner',
    description: '扫码功能 (scanCode)',
    files: ['uni-scanCode-release.aar'],
  },
  {
    name: 'clipboard',
    displayName: 'Clipboard',
    description: '剪贴板 (getClipboardData/setClipboardData)',
    files: ['uni-clipboard-release.aar'],
  },
  {
    name: 'vibrate',
    displayName: 'Vibrate',
    description: '振动反馈',
    files: ['uni-vibrate-release.aar'],
  },
  {
    name: 'brightness',
    displayName: 'Brightness',
    description: '屏幕亮度控制',
    files: ['uni-brightness-release.aar'],
  },
  {
    name: 'keyboard',
    displayName: 'Keyboard',
    description: '键盘控制',
    files: ['uni-keyboard-release.aar'],
  },
  {
    name: 'navigation',
    displayName: 'Navigation',
    description: '页面导航 (navigateTo/redirectTo/switchTab)',
    files: ['uni-navigationBar-release.aar', 'uni-navigator-release.aar'],
  },
  {
    name: 'tabbar',
    displayName: 'TabBar',
    description: 'TabBar 操作',
    files: ['uni-tabBar-release.aar'],
  },
  {
    name: 'animation',
    displayName: 'Animation',
    description: '动画 API (createAnimation)',
    files: ['uni-animation-release.aar'],
  },
  {
    name: 'canvas',
    displayName: 'Canvas',
    description: 'Canvas 画布',
    files: ['uni-canvas-release.aar'],
  },
  {
    name: 'webview',
    displayName: 'WebView',
    description: 'WebView 组件',
    files: ['uni-webview-release.aar'],
  },
  {
    name: 'sqlite',
    displayName: 'SQLite',
    description: 'SQLite 数据库',
    files: ['uni-sqlite-release.aar'],
  },
  {
    name: 'audio',
    displayName: 'Audio',
    description: '音频播放 (createInnerAudioContext)',
    files: ['uni-audio-release.aar'],
  },
  {
    name: 'record',
    displayName: 'Record',
    description: '录音功能',
    files: ['uni-record-release.aar'],
  },
  // 广告 SDK
  {
    name: 'ad-uniad',
    displayName: 'uni-ad',
    description: 'DCloud uni-ad 广告联盟',
    files: ['uni-ad-release.aar'],
  },
  {
    name: 'ad-gdt',
    displayName: '腾讯优量汇',
    description: '腾讯优量汇广告 (国内)',
    files: ['uni-ad-gdt-release.aar'],
  },
  {
    name: 'ad-csj',
    displayName: '穿山甲',
    description: '穿山甲 (字节跳动) 广告 (国内)',
    files: ['uni-ad-csj-release.aar'],
  },
  {
    name: 'ad-ks',
    displayName: '快手广告',
    description: '快手广告联盟 (国内)',
    files: ['uni-ad-ks-release.aar'],
  },
  {
    name: 'ad-bd',
    displayName: '百度广告',
    description: '百度百青藤广告联盟 (国内)',
    files: ['uni-ad-bd-release.aar'],
  },
  {
    name: 'ad-hw',
    displayName: '华为广告',
    description: '华为广告联盟 (国内)',
    files: ['uni-ad-hw-release.aar'],
  },
  {
    name: 'ad-sigmob',
    displayName: 'Sigmob',
    description: 'Sigmob 广告联盟 (国内)',
    files: ['uni-ad-sigmob-release.aar'],
  },
  {
    name: 'ad-admob',
    displayName: 'Google AdMob',
    description: 'Google AdMob 广告 (海外)',
    files: ['uni-ad-admob-release.aar'],
  },
  {
    name: 'ad-pangle',
    displayName: 'Pangle',
    description: 'Pangle (海外穿山甲) 广告',
    files: ['uni-ad-pangle-release.aar'],
  },
  {
    name: 'ad-unity',
    displayName: 'Unity Ads',
    description: 'Unity 广告 (海外)',
    files: ['uni-ad-unity-release.aar'],
  },
  {
    name: 'ad-mintegral',
    displayName: 'Mintegral',
    description: 'Mintegral 广告 (海外)',
    files: ['uni-ad-mintegral-release.aar'],
  },
  {
    name: 'ad-applovin',
    displayName: 'AppLovin',
    description: 'AppLovin 广告 (海外)',
    files: ['uni-ad-applovin-release.aar'],
  },
];

/**
 * 根据选中的模块获取所有需要的 aar 文件
 * @param {string[]} selectedModuleNames - 选中的模块名称列表
 * @returns {string[]} - 需要的 aar 文件列表
 */
export function getModuleFiles(selectedModuleNames) {
  const files = [...BASE_MODULES];

  for (const moduleName of selectedModuleNames) {
    const module = OPTIONAL_MODULES.find(m => m.name === moduleName);
    if (module) {
      files.push(...module.files);
    }
  }

  return [...new Set(files)]; // 去重
}

/**
 * manifest.json 模块名称到 SDK 模块名称的映射
 * manifest.json 中 app-android.distribute.modules 的键名 -> OPTIONAL_MODULES 的 name
 */
export const MANIFEST_MODULE_MAPPING = {
  // 媒体相关
  'Camera': ['media-image', 'scanner'],
  'VideoPlayer': ['media-video'],
  'LivePusher': ['media-video'],

  // 位置相关
  'Geolocation': ['location'],
  'Maps': ['map'],

  // 支付相关
  'Payment': ['payment'],
  'OAuth': ['oauth'],

  // 分享相关
  'Share': ['share'],

  // 推送相关
  'Push': ['push'],

  // 蓝牙相关
  'Bluetooth': ['bluetooth'],

  // 通用 API
  'Storage': ['storage'],
  'Network': ['network'],
  'File': ['file'],
  'Clipboard': ['clipboard'],
  'Vibrate': ['vibrate'],
  'Brightness': ['brightness'],
  'Audio': ['audio'],
  'Record': ['record'],
  'SQLite': ['sqlite'],
  'Canvas': ['canvas'],
  'WebView': ['webview'],
  'Keyboard': ['keyboard'],
  'TabBar': ['tabbar'],
  'Navigation': ['navigation'],
  'Animation': ['animation'],
  'Scanner': ['scanner'],

  // 广告 SDK
  'Ad': ['ad-uniad'],
  'uni-ad': ['ad-uniad'],
  'GDT': ['ad-gdt'],
  '腾讯优量汇': ['ad-gdt'],
  'CSJ': ['ad-csj'],
  '穿山甲': ['ad-csj'],
  'GroMore': ['ad-csj'],
  'KS': ['ad-ks'],
  '快手': ['ad-ks'],
  'BD': ['ad-bd'],
  '百度': ['ad-bd'],
  '百青藤': ['ad-bd'],
  'HW': ['ad-hw'],
  '华为': ['ad-hw'],
  'Sigmob': ['ad-sigmob'],
  'AdMob': ['ad-admob'],
  'Google AdMob': ['ad-admob'],
  'Pangle': ['ad-pangle'],
  'Unity': ['ad-unity'],
  'Mintegral': ['ad-mintegral'],
  'AppLovin': ['ad-applovin'],
};

/**
 * 根据 manifest.json 配置自动识别需要的模块
 * @param {Object} manifest - 解析后的 manifest.json 对象
 * @returns {string[]} - 需要的 SDK 模块名称列表
 */
export function getModulesFromManifest(manifest) {
  const modules = new Set();

  // 从 app-android.distribute.modules 读取模块配置
  const androidModules = manifest?.['app-android']?.distribute?.modules;

  if (androidModules && typeof androidModules === 'object') {
    for (const moduleName of Object.keys(androidModules)) {
      const mappedModules = MANIFEST_MODULE_MAPPING[moduleName];
      if (mappedModules) {
        mappedModules.forEach(m => modules.add(m));
      }
    }
  }

  // 基于权限推断需要的模块
  const permissions = manifest?.['app-android']?.distribute?.permissions;
  if (permissions && Array.isArray(permissions)) {
    const permissionStr = permissions.join(' ');

    if (permissionStr.includes('CAMERA')) {
      modules.add('media-image');
    }
    if (permissionStr.includes('LOCATION') || permissionStr.includes('GPS')) {
      modules.add('location');
    }
    if (permissionStr.includes('BLUETOOTH')) {
      modules.add('bluetooth');
    }
    if (permissionStr.includes('RECORD_AUDIO')) {
      modules.add('record');
    }
    if (permissionStr.includes('VIBRATE')) {
      modules.add('vibrate');
    }
  }

  // 默认添加常用模块
  modules.add('storage');
  modules.add('network');

  return [...modules];
}