@echo off
rem ======================================================
rem  可视化网页编辑器 - 一键启动脚本
rem  功能：检测 Node.js -> 首次运行自动安装依赖
rem        -> 启动开发服务器并自动打开浏览器
rem  用法：双击本文件即可
rem ======================================================

title 可视化网页编辑器 - 一键启动
pushd "%~dp0"

echo.
echo  ==========================================
echo    ? 可视化网页编辑器 - 一键启动
echo  ==========================================
echo.

rem ---- 1. 检测 Node.js ----
where node >nul 2>nul
if errorlevel 1 (
    echo  [错误] 未检测到 Node.js！
    echo         请先安装 Node.js 18 或更高版本，然后重新运行本脚本。
    echo         下载地址: https://nodejs.org/
    echo.
    pause
    popd
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo  [OK] Node.js 版本: %%v

rem ---- 2. 首次运行自动安装依赖 ----
if not exist "node_modules" (
    echo  [提示] 检测到首次运行，正在安装依赖，请稍候...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [错误] 依赖安装失败，请检查网络连接后重试。
        echo.
        pause
        popd
        exit /b 1
    )
    echo  [OK] 依赖安装完成。
)

rem ---- 3. 启动开发服务器（自动打开浏览器） ----
echo  [启动] 正在启动开发服务器，浏览器将自动打开...
echo         页面地址通常为 http://localhost:5173
echo         按 Ctrl+C 可停止服务
echo.
call npm run dev -- --open

echo.
echo  ==========================================
echo    开发服务器已停止，窗口 3 秒后自动关闭...
echo  ==========================================
timeout /t 3 /nobreak >nul
popd
exit /b 0
