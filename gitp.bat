@echo off

REM Git代理管理工具批处理文件（TypeScript版）
REM 用于在Windows命令提示符或PowerShell中快速调用编译后的JavaScript脚本

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js。请先安装Node.js，然后重试。
    echo 可以从 https://nodejs.org 下载安装。
    pause
    exit /b 1
)

REM 获取当前批处理文件所在目录
set SCRIPT_DIR=%~dp0

REM 检查编译后的JavaScript脚本是否存在
if not exist "%SCRIPT_DIR%dist\index.js" (
    echo 错误: 未找到编译后的脚本文件。
    echo 请先运行 `npm run build` 来编译TypeScript代码。
    pause
    exit /b 1
)

REM 执行编译后的Node.js脚本，并传递所有参数
node "%SCRIPT_DIR%dist\index.js" %*

REM 获取Node.js脚本的退出代码
set EXIT_CODE=%errorlevel%

REM 返回相同的退出代码
exit /b %EXIT_CODE%