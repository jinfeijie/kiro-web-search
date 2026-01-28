// Native 加载器 - 支持多平台
const { existsSync } = require('fs');
const { join } = require('path');

let nativeBinding = null;

// 平台映射表：Node.js 的 platform-arch 到 napi-rs 文件名
const platformMap = {
    'darwin-arm64': 'kiro-native.darwin-arm64.node',
    'darwin-x64': 'kiro-native.darwin-x64.node',
    'linux-x64': 'kiro-native.linux-x64-gnu.node',
    'win32-x64': 'kiro-native.win32-x64-msvc.node',
};

const key = `${process.platform}-${process.arch}`;
const fileName = platformMap[key];

if (!fileName) {
    throw new Error(`Unsupported platform: ${key}. Supported: ${Object.keys(platformMap).join(', ')}`);
}

const localFile = join(__dirname, fileName);

if (existsSync(localFile)) {
    nativeBinding = require(localFile);
} else {
    throw new Error(`Native binding not found: ${localFile}`);
}

module.exports.kiroSearch = nativeBinding.kiroSearch;
module.exports.kiroBatchSearch = nativeBinding.kiroBatchSearch;
