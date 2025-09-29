# Git代理工具使用说明（TypeScript版）

## 概述

本工具提供了一个**基于TypeScript的现代化解决方案**，帮助您在执行涉及GitHub origin远程仓库的Git命令时自动设置代理，并在命令执行完毕后自动清除代理设置。

## 已创建的文件

1. **`src/index.ts`** - TypeScript源代码，实现Git代理自动管理功能
2. **`gitp.bat`** - 批处理文件，用于在命令提示符或PowerShell中快速调用编译后的JavaScript脚本
3. **`tsconfig.json`** - TypeScript编译配置文件
4. **`package.json`** - 项目配置和依赖管理文件

## 前提条件

- 已安装 [Node.js](https://nodejs.org/)（推荐v16.0或更高版本）
- 已安装Git
- 已配置代理设置（通过`.env`文件或用户主目录的`.git-proxy.env`文件）

## 快速开始

### 1. 安装依赖

```cmd
cd d:\gitp
npm install
```

### 2. 编译TypeScript代码

```cmd
npm run build
```

### 3. 直接使用（临时）

1. 打开命令提示符（cmd）或PowerShell
2. 导航到 `d:\gitp` 目录
3. 执行以下命令：

```cmd
# 显示帮助信息
gitp.bat --help

# 推送代码到origin（会自动使用代理）
gitp.bat push origin main

# 拉取代码（会自动使用代理）
gitp.bat pull origin dev

# 不涉及origin的命令（不会使用代理）
gitp.bat status
```

### 4. 添加到系统PATH（推荐）

为了在任何目录下都能使用 `gitp` 命令，您可以将 `d:\gitp` 目录添加到系统PATH环境变量中：

1. 复制 `d:\gitp` 目录的完整路径
2. 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」
3. 在「系统变量」中找到并选中「Path」变量，点击「编辑」
4. 点击「新建」，粘贴之前复制的目录路径
5. 点击「确定」保存所有更改
6. 重新打开命令提示符或PowerShell
7. 现在您可以在任何目录下使用 `gitp` 命令：

```cmd
# 显示帮助信息
gitp --help

# 推送代码到origin
gitp push origin main

# 拉取代码
gitp pull origin dev
```

## 在其他项目中使用

### 基本使用方法

1. **确保已添加到系统PATH**（参考快速开始部分）
2. **导航到您的项目目录**：
   ```cmd
   cd d:\your-project-directory
   ```
3. **直接使用gitp命令**代替git命令：
   ```cmd
   # 从origin拉取代码
   gitp pull origin main
   
   # 推送到origin
   gitp push origin feature-branch
   
   # 查看远程仓库信息
   gitp remote -v
   ```

### 为特定项目配置代理

您可以为不同项目配置不同的代理设置，而不会相互影响：

1. **项目特定配置**：在当前项目根目录下创建`.env`文件
2. **全局配置**：在用户主目录下创建`.git-proxy.env`文件

配置文件内容示例：

```env
# GitHub代理设置
GITHUB_PROXY=http://your-proxy-server:port
```

优先级顺序：项目特定配置 > 全局配置 > 默认配置（http://localhost:10808）

## 工作原理

1. **代理检测**：脚本会自动检测Git命令是否包含「origin」关键字
2. **代理配置**：如果命令涉及origin，脚本会按优先级读取代理配置
3. **临时设置**：临时设置 `HTTP_PROXY` 和 `HTTPS_PROXY` 环境变量（同时设置大小写，确保兼容性）
4. **执行命令**：执行用户指定的Git命令并实时显示输出
5. **自动恢复**：命令执行完毕后，自动恢复原始的代理设置

## 注意事项

1. 该工具与操作系统的命令行完全兼容，不依赖PowerShell版本
2. 对于不涉及origin的Git命令（如查看状态、提交等），不会使用代理
3. 命令执行完毕后，会自动恢复您之前的代理设置（如果有）
4. 修改TypeScript源代码后，需要重新运行 `npm run build` 来编译

## 故障排除

- **找不到Node.js**：请确保已安装Node.js并添加到系统PATH
- **代理未生效**：检查配置文件中的 `GITHUB_PROXY` 设置是否正确
- **命令执行错误**：检查Git命令本身是否正确，以及网络连接是否正常
- **找不到编译后的脚本**：确认已运行 `npm run build` 命令
- **无法在任何目录使用gitp**：确认已正确将 `d:\gitp` 目录添加到系统PATH

## TypeScript版本的优势

1. **类型安全**：TypeScript提供静态类型检查，减少运行时错误
2. **更好的IDE支持**：智能提示、代码导航等功能提升开发体验
3. **可维护性更高**：清晰的类型定义使代码更容易理解和维护
4. **现代化特性**：支持最新的JavaScript特性，代码更加简洁优雅
5. **配置更灵活**：支持项目特定配置和全局配置两种方式