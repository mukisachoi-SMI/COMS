@echo off
echo 기본 favicon.ico를 테마별로 업데이트 중...

REM 현재 디렉토리 확인
if not exist "public\coms_b.ico" (
    echo 오류: coms_b.ico 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

REM 백업 생성
if exist "public\favicon.ico" (
    copy "public\favicon.ico" "public\favicon.ico.backup" >nul
    echo 기존 favicon.ico 백업 생성됨
)

REM 라이트 모드를 기본값으로 설정
copy "public\coms_b.ico" "public\favicon.ico" >nul
echo favicon.ico가 라이트 모드 아이콘으로 교체됨

echo.
echo 완료! 이제 브라우저 캐시를 클리어하고 다시 테스트해주세요.
echo Ctrl+Shift+R (강제 새로고침)
pause