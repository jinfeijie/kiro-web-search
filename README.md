# Kiro Web Search MCP Server

为 Kiro IDE 提供 Web 搜索能力的 MCP 插件。

## 安装方式

### 方式 1：Clone 仓库

```bash
git clone https://github.com/jinfeijie/kiro-web-search.git
cd kiro-web-search
npm install
```

MCP 配置：
```json
{
  "mcpServers": {
    "kiro-web-search": {
      "command": "node",
      "args": ["/你的路径/kiro-web-search/dist/index.js"]
    }
  }
}
```

### 方式 2：npx + GitHub

无需 clone，直接运行：
```json
{
  "mcpServers": {
    "kiro-web-search": {
      "command": "npx",
      "args": ["-y", "github:jinfeijie/kiro-web-search"]
    }
  }
}
```

## 前置条件

需要已登录 Kiro IDE，登录后会自动生成认证 token。

默认 token 路径：`~/.aws/sso/cache/kiro-auth-token.json`

### 自定义 Token 路径

如果 token 文件在其他位置，可以通过环境变量指定：

```json
{
  "mcpServers": {
    "kiro-web-search": {
      "command": "node",
      "args": ["/你的路径/kiro-web-search/dist/index.js"],
      "env": {
        "KIRO_AUTH_TOKEN_PATH": "/自定义路径/kiro-auth-token.json"
      }
    }
  }
}
```

### 其他环境变量

| 变量名 | 说明 |
|--------|------|
| `KIRO_AUTH_TOKEN_PATH` | 自定义 token 文件路径 |
| `KIRO_ACCESS_TOKEN` | 直接提供 access token（跳过文件读取） |
| `KIRO_REGION` | 指定 AWS 区域（默认 us-east-1） |
| `KIRO_AUTO_REFRESH` | 设为 `false` 禁用自动刷新 token |

## 提供的工具

| 工具 | 说明 |
|------|------|
| `web_search` | 单个搜索查询 |
| `remote_web_search` | 单个搜索查询（别名） |
| `batch_search` | 批量并发搜索（最多 10 个并发） |
| `web_fetch` | 抓取网页内容 |
| `batch_fetch` | 批量抓取网页内容 |

## 平台支持

| 平台 | 架构 | 状态 |
|------|------|------|
| macOS | ARM64 (Apple Silicon) | ✅ |
| Linux | x64 | ✅ |
| Windows | x64 | ✅ |

## 构建说明

本仓库只包含编译后的产物，源码位于私有仓库。

每次私有仓库推送到 main 分支时，GitHub Actions 会自动：
1. 在多个平台上编译 native 模块
2. 将编译产物推送到本仓库

## License

MIT
