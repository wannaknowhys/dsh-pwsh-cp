[English](README.md) | 简体中文

# dsh-pwsh-cp

适用于 Windows 的 DeepSeek Harness bundle。当 PowerShell 控制台以旧版 OEM 代码页
启动时（例如简体中文系统的 936），它让每次 `pwsh` 工具调用都以：

```powershell
chcp 65001 *> $null; $env:PYTHONUTF8='1'; $env:PYTHONIOENCODING='utf-8';
```

开头。

## 为什么

- harness 按 UTF-8 解码命令输出。
- 新启动的 PowerShell 进程可能仍以 936 作为控制台代码页。随附 preamble 里的
  `[Console]::OutputEncoding = UTF8` 并不会改变控制台代码页，于是原生工具继续写
  GBK 字节，进入 UTF-8 解码器后非 ASCII 文本丢失。
- 把控制台固定到 65001 后，`dir`、CMD 内建命令以及能感知控制台代码页的 CLI 工具
  都会输出 UTF-8；CMD 内建命令会改用英文，而不是系统的本地化语言。
- 管道里的 Python 会按区域代码页（GBK）写输出，与控制台无关；`PYTHONUTF8=1`
  让它写 UTF-8。

## 不做什么

- 不替换、不关闭 `pwsh-sandbox`，沙箱约束保持不变。
- 不影响内嵌终端和其他 profile。
- 不保留那些忽略控制台代码页的旧工具的本地化措辞；需要时请用能强制源代码页的
  包装器。

## 要求

- Windows + PowerShell 7（`pwsh`）。
- 提供 `shell` 服务与 `pwsh` 工具的 DeepSeek Harness。

## 安装 / 移除

```sh
# 从 npm
dsh plugin --profile desktop add dsh-pwsh-cp

# 从源码
dsh plugin --profile desktop add github:wannaknowhys/dsh-pwsh-cp

# 移除
dsh plugin --profile desktop remove dsh-pwsh-cp
```

插件管理器接受同样的目标：`install_bundle target = dsh-pwsh-cp` 或本目录路径。
