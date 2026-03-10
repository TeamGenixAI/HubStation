@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   HTML 통합 빌드 시작
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] HTML 파일 통합 중...
python merge_html.py
if %errorlevel% neq 0 (
    echo.
    echo [오류] HTML 통합 실패!
    pause
    exit /b 1
)

echo.
echo [2/2] JavaScript 통합 중...
python merge_js.py
if %errorlevel% neq 0 (
    echo.
    echo [오류] JavaScript 통합 실패!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   완료! New-merged.html 생성됨
echo ========================================
echo.
pause
