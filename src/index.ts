#!/usr/bin/env node

/**
 * Git代理管理工具（TypeScript版）
 * 功能：根据是否涉及origin远程仓库自动设置或清除代理
 */

import { exec, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// 读取代理配置
function readProxyConfig(): string {
    // 尝试从用户主目录读取全局.env文件
    const userHomeDir = process.env.HOME || process.env.USERPROFILE || '';
    const globalEnvPath = path.join(userHomeDir, '.git-proxy.env');
    const defaultProxy = 'http://localhost:10808';
    
    try {
        // 优先从当前工作目录读取.env文件
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf8');
            const proxyMatch = /GITHUB_PROXY\s*=\s*(.+)/.exec(envContent);
            if (proxyMatch && proxyMatch[1]) {
                return proxyMatch[1].trim();
            }
        }
        
        // 然后尝试读取全局配置文件
        if (userHomeDir && fs.existsSync(globalEnvPath)) {
            const envContent = fs.readFileSync(globalEnvPath, 'utf8');
            const proxyMatch = /GITHUB_PROXY\s*=\s*(.+)/.exec(envContent);
            if (proxyMatch && proxyMatch[1]) {
                return proxyMatch[1].trim();
            }
        }
        
        // 最后使用默认代理
        console.log(`警告: 未找到代理配置，将使用默认代理: ${defaultProxy}`);
        return defaultProxy;
    } catch (error) {
        console.error(`读取代理配置时出错: ${error instanceof Error ? error.message : String(error)}`);
        return defaultProxy;
    }
}

// 执行带代理的Git命令
function executeGitWithProxy(): void {
    // 获取命令行参数（跳过node和脚本路径）
    const gitArgs = process.argv.slice(2);
    const fullGitCommand = `git ${gitArgs.join(' ')}`;
    
    // 保存原始代理设置
    const originalHttpProxy = process.env.HTTP_PROXY;
    const originalHttpsProxy = process.env.HTTPS_PROXY;
    const originalHttpProxyLower = process.env.http_proxy;
    const originalHttpsProxyLower = process.env.https_proxy;
    
    let needProxy = false;
    let proxyServer = '';
    
    try {
        // 检查命令是否涉及origin
        const hasOrigin = gitArgs.some(arg => 
            typeof arg === 'string' && arg.toLowerCase() === 'origin'
        ) || fullGitCommand.toLowerCase().includes('origin');
        
        if (hasOrigin) {
            needProxy = true;
            proxyServer = readProxyConfig();
            console.log('检测到涉及origin的Git命令，临时设置代理...');
            
            // 设置临时代理（同时设置大小写，确保兼容性）
            process.env.HTTP_PROXY = proxyServer;
            process.env.HTTPS_PROXY = proxyServer;
            process.env.http_proxy = proxyServer;
            process.env.https_proxy = proxyServer;
            console.log(`已设置代理: HTTP_PROXY=${proxyServer}, HTTPS_PROXY=${proxyServer}`);
        } else {
            console.log('执行不涉及origin的Git命令，不设置代理...');
        }
        
        console.log(`执行命令: ${fullGitCommand}`);
        
        // 执行Git命令并实时输出
        const childProcess: ChildProcess = exec(fullGitCommand, (error, stdout, stderr) => {
            if (stderr) {
                console.error(stderr);
            }
            if (error) {
                console.error(`Git命令执行失败: ${error.message}`);
                process.exit(error.code || 1);
            }
        });
        
        // 实时输出stdout和stderr
        if (childProcess.stdout) {
            childProcess.stdout.pipe(process.stdout);
        }
        if (childProcess.stderr) {
            childProcess.stderr.pipe(process.stderr);
        }
        
        // 监听子进程退出
        childProcess.on('exit', (code) => {
            console.log(`Git命令退出代码: ${code}`);
            
            // 无论如何都要恢复代理设置
            restoreProxySettings(
                originalHttpProxy,
                originalHttpsProxy,
                originalHttpProxyLower,
                originalHttpsProxyLower,
                needProxy
            );
            
            // 传递退出代码
            process.exit(code || 0);
        });
        
    } catch (error) {
        console.error(`执行Git命令时出错: ${error instanceof Error ? error.message : String(error)}`);
        
        // 出错时也要恢复代理设置
        restoreProxySettings(
            originalHttpProxy,
            originalHttpsProxy,
            originalHttpProxyLower,
            originalHttpsProxyLower,
            needProxy
        );
        
        process.exit(1);
    }
}

// 恢复原始代理设置
function restoreProxySettings(
    originalHttpProxy: string | undefined,
    originalHttpsProxy: string | undefined,
    originalHttpProxyLower: string | undefined,
    originalHttpsProxyLower: string | undefined,
    needProxy: boolean
): void {
    if (needProxy) {
        console.log('命令执行完毕，恢复原始代理设置...');
        
        // 恢复原始代理设置（如果原来没有设置，则删除这些环境变量）
        if (originalHttpProxy === undefined) {
            delete process.env.HTTP_PROXY;
        } else {
            process.env.HTTP_PROXY = originalHttpProxy;
        }
        
        if (originalHttpsProxy === undefined) {
            delete process.env.HTTPS_PROXY;
        } else {
            process.env.HTTPS_PROXY = originalHttpsProxy;
        }
        
        if (originalHttpProxyLower === undefined) {
            delete process.env.http_proxy;
        } else {
            process.env.http_proxy = originalHttpProxyLower;
        }
        
        if (originalHttpsProxyLower === undefined) {
            delete process.env.https_proxy;
        } else {
            process.env.https_proxy = originalHttpsProxyLower;
        }
        
        console.log('已恢复原始代理设置');
    }
}

// 显示帮助信息
function showHelp(): void {
    console.log('');
    console.log('Git代理管理工具（TypeScript版）');
    console.log('=========================');
    console.log('');
    console.log('用法:');
    console.log('  gitp <git命令> [参数...]');
    console.log('');
    console.log('示例:');
    console.log('  gitp push origin main    # 使用代理推送代码到GitHub');
    console.log('  gitp pull origin dev     # 使用代理从GitHub拉取代码');
    console.log('  gitp fetch origin feature-branch  # 使用代理获取分支');
    console.log('  gitp status              # 不涉及origin，不使用代理');
    console.log('');
    console.log('说明:');
    console.log('  - 自动检测命令是否涉及"origin"远程仓库');
    console.log('  - 如涉及origin，则自动从.env文件或用户主目录的.git-proxy.env读取GITHUB_PROXY设置代理');
    console.log('  - 命令执行完毕后自动恢复原始代理设置');
    console.log('  - 纯Node.js实现，不依赖PowerShell');
    console.log('');
}

// 检查是否需要显示帮助
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
} else {
    // 执行Git命令
    executeGitWithProxy();
}