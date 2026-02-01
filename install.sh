#!/bin/bash

# Doomsday Extension 설치 스크립트

EXTENSION_UUID="doomsday@devastator-x.github.io"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"

echo "Doomsday Extension 설치 중..."

# Extension 디렉토리 생성
mkdir -p "$EXTENSION_DIR"

# 파일 복사
cp extension.js "$EXTENSION_DIR/"
cp prefs.js "$EXTENSION_DIR/"
cp metadata.json "$EXTENSION_DIR/"
cp stylesheet.css "$EXTENSION_DIR/"
cp -r schemas "$EXTENSION_DIR/"

# 스키마 컴파일
echo "스키마 컴파일 중..."
glib-compile-schemas "$EXTENSION_DIR/schemas/"

# Extension 활성화
echo "Extension 활성화 중..."
gnome-extensions enable "$EXTENSION_UUID"

echo "설치 완료!"
echo "GNOME Shell을 재시작하려면: Alt+F2를 누르고 'r'을 입력하세요"
echo "(Wayland 사용 시: 로그아웃 후 재로그인)"
