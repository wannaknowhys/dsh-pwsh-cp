[English](README.md) | [简体中文](README.zh-CN.md)

# dsh-pwsh-cp

A DeepSeek Harness bundle for Windows hosts whose PowerShell console starts on
a legacy OEM code page (936 on zh-CN, for example). It decorates the shell
executor so every `pwsh` tool call begins with:

```powershell
chcp 65001 *> $null; $env:PYTHONUTF8='1'; $env:PYTHONIOENCODING='utf-8';
```

## Why

- The harness decodes command output as UTF-8.
- A fresh PowerShell process can still start on console code page 936. The
  shipped preamble sets `[Console]::OutputEncoding = UTF8`, but that does not
  move the console code page, so native tools keep writing GBK bytes into a
  UTF-8 decoder and non-ASCII text is lost.
- Pinning the console to 65001 makes `dir`, CMD built-ins, and
  code-page-aware CLI tools emit UTF-8. CMD built-ins then answer in English
  instead of the system's localized language.
- Piped Python writes the locale code page (GBK) regardless of the console;
  `PYTHONUTF8=1` makes it write UTF-8.

## What it does not do

- It does not replace or disable `pwsh-sandbox`; confinement is unchanged.
- It does not affect the embedded terminal or other profiles.
- It does not preserve localized wording from legacy tools that ignore the
  console code page. Use a wrapper that can force the source code page when
  that matters.

## Requirements

- Windows with PowerShell 7 (`pwsh`).
- A DeepSeek Harness build that provides the `shell` service and the `pwsh`
  tool.

## Install / remove

```powershell
# install: point the plugin manager at this directory
plugin_manager install_bundle target = <path to this directory>

# or from the CLI
dsh plugin --profile <profile> add link:<path to this directory>

# remove
dsh plugin --profile <profile> remove dsh-pwsh-cp
```
