/**
 * UniApp X Android SDK 模块定义
 * 基于官方文档和实际 SDK 文件结构
 * @see https://doc.dcloud.net.cn/uni-app-x/native/use/android.html
 */

/**
 * @typedef {Object} SdkModule
 * @property {string} name - 模块标识符
 * @property {string} displayName - 显示名称
 * @property {string} description - 模块描述
 * @property {string[]} files - 相关文件列表
 * @property {'core'|'feature'|'extension'|'ad'|'security'} category - 模块分类
 */

// 基础核心模块（必须包含）
export const BASE_MODULES = [
  'uts-runtime',
  'android-gif-drawable',
  'app-common',
  'app-runtime',
  'breakpad-build',
  'dcloud-layout',
  'framework',
  'uni-exit',
  'uni-getAccessibilityInfo',
  'uni-getAppAuthorizeSetting',
  'uni-getAppBaseInfo',
  'uni-getSystemSetting',
  'uni-openAppAuthorizeSetting',
  'uni-prompt',
  'uni-storage',
  'uni-getDeviceInfo',
  'uni-getSystemInfo',
  'uni-rpx2px',
  'uni-theme'
];

// 可选功能模块
/** @type {SdkModule[]} */
export const OPTIONAL_MODULES = [
  // 推送相关
  {
    name: 'push',
    displayName: '消息推送',
    description: '集成UniPush消息推送服务',
    files: ['uni-push-release.aar'],
    category: 'feature'
  },
  
  // 广告相关
  {
    name: 'ad',
    displayName: '广告SDK',
    description: '集成穿山甲、广点通等广告平台',
    files: [
      'uni-ad-release.aar',
      'uni-ad-splash-release.aar',
      'uniad-gdt-release.aar',
      'uniad-ks-release.aar',
      'uniad-hw-release.aar',
      'open_ad_sdk.aar',
      'GDTSDK.unionNormal.aar'
    ],
    category: 'ad'
  },
  
  // 支付相关
  {
    name: 'payment',
    displayName: '支付功能',
    description: '集成微信支付、支付宝等支付渠道',
    files: [
      'uni-payment-release.aar',
      'uni-payment-wxpay-release.aar',
      'uni-payment-alipay-release.aar'
    ],
    category: 'feature'
  },
  
  // 定位相关
  {
    name: 'location',
    displayName: '定位服务',
    description: '获取设备地理位置信息',
    files: [
      'uni-location-release.aar',
      'uni-location-system-release.aar',
      'uni-location-tencent-release.aar'
    ],
    category: 'feature'
  },
  
  // 地图相关
  {
    name: 'map',
    displayName: '地图服务',
    description: '腾讯地图集成',
    files: ['uni-map-tencent-release.aar'],
    category: 'feature'
  },
  
  // 相机相关
  {
    name: 'camera',
    displayName: '相机功能',
    description: '调用设备摄像头进行拍照/录像',
    files: ['uni-camera-release.aar'],
    category: 'feature'
  },
  
  // 媒体相关
  {
    name: 'media',
    displayName: '媒体播放',
    description: '音频视频播放功能',
    files: [
      'uni-media-release.aar',
      'uni-createInnerAudioContext-release.aar',
      'uni-getBackgroundAudioManager-release.aar',
      'uni-video-release.aar',
      'ijkplayer.aar',
      'videoplayer.aar'
    ],
    category: 'feature'
  },
  
  // 直播相关
  {
    name: 'live',
    displayName: '直播推拉流',
    description: '直播推流和播放功能',
    files: [
      'uni-live-player-release.aar',
      'uni-live-pusher-release.aar',
      'pldroid-media-streaming-3.1.6.jar'
    ],
    category: 'feature'
  },
  
  // 文件系统
  {
    name: 'filesystem',
    displayName: '文件系统',
    description: '文件读写操作',
    files: ['uni-fileSystemManager-release.aar'],
    category: 'feature'
  },
  
  // 网络相关
  {
    name: 'network',
    displayName: '网络请求',
    description: 'HTTP网络请求功能',
    files: ['uni-network-release.aar'],
    category: 'feature'
  },
  
  // 存储相关
  {
    name: 'storage',
    displayName: '数据存储',
    description: '本地数据存储',
    files: ['uni-storage-release.aar'],
    category: 'feature'
  },
  
  // 分享相关
  {
    name: 'share',
    displayName: '系统分享',
    description: '调用系统分享功能',
    files: ['uni-shareWithSystem-release.aar'],
    category: 'feature'
  },
  
  // 扫码相关
  {
    name: 'barcode',
    displayName: '条码扫描',
    description: '二维码/条形码扫描识别',
    files: ['uni-scanCode-release.aar', 'uni-barcode-scanning-release.aar'],
    category: 'feature'
  },
  
  // 生物识别
  {
    name: 'biometric',
    displayName: '生物识别',
    description: '指纹、人脸等生物识别',
    files: [
      'uni-facialVerify-release.aar',
      'facialRecognitionVerify-support-release.aar',
      'Aliyun_FaceGuard-10049.aar'
    ],
    category: 'security'
  },
  
  // 安全相关
  {
    name: 'security',
    displayName: '安全防护',
    description: '应用安全加固和防护',
    files: ['APSecuritySDK-deepSec-7.0.1.20240415.jiagu.aar'],
    category: 'security'
  },
  
  // 云服务
  {
    name: 'cloud',
    displayName: '云端服务',
    description: 'uniCloud客户端功能',
    files: ['uni-cloud-client-release.aar'],
    category: 'feature'
  },
  
  // WebView相关
  {
    name: 'webview',
    displayName: 'WebView控制',
    description: 'WebView相关API',
    files: ['uni-createWebviewContext-release.aar'],
    category: 'feature'
  },
  
  // WebSocket
  {
    name: 'websocket',
    displayName: 'WebSocket',
    description: 'WebSocket实时通信',
    files: ['uni-websocket-release.aar'],
    category: 'feature'
  }
];


export const DEFAULT_MODULES = [
  'push',
  'share',
  'payment',
  'location'
];

/**
 * 根据选中的模块获取所需的所有文件
 * @param {string[]} selectedModules - 选中的模块名称数组
 * @returns {string[]} 所需文件列表
 */
export function getModuleFiles(selectedModules) {
  const allFiles = new Set();
  
  // 添加基础核心模块文件
  BASE_MODULES.forEach(moduleName => {
    // 基础模块文件名格式: moduleName-release.aar
    const fileName = `${moduleName}-release.aar`;
    allFiles.add(fileName);
  });
  
  // 特殊处理 android-gif-drawable 版本号
  allFiles.delete('android-gif-drawable-release.aar');
  allFiles.add('android-gif-drawable-1.2.29.aar');
  
  // 添加选中的可选模块文件
  selectedModules.forEach(moduleName => {
    const module = OPTIONAL_MODULES.find(m => m.name === moduleName);
    if (module && module.files) {
      module.files.forEach(file => allFiles.add(file));
    }
  });
  
  return Array.from(allFiles);
}