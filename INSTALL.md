# Doomsday Extension 설치 방법

## 자동 설치 (권장)

1. [Releases](https://github.com/devastator-x/doomsday/releases)에서 최신 버전의 ZIP 파일 다운로드
2. Extension Manager 실행
3. "Install from file..." 선택
4. 다운로드한 ZIP 파일 선택
5. Extension 활성화

## 수동 설치

```bash
# 1. ZIP 파일 다운로드
wget https://github.com/devastator-x/doomsday/releases/latest/download/doomsday@devastator-x.github.io.shell-extension.zip

# 2. Extension 디렉토리에 압축 해제
mkdir -p ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io
unzip doomsday@devastator-x.github.io.shell-extension.zip -d ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# 3. 스키마 컴파일
glib-compile-schemas ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/

# 4. Extension 활성화
gnome-extensions enable doomsday@devastator-x.github.io

# 5. GNOME Shell 재시작 (Alt+F2, 'r', Enter)
```

## Git에서 직접 설치 (개발자용)

```bash
# 1. 저장소 클론
git clone https://github.com/devastator-x/doomsday.git
cd doomsday

# 2. 설치 스크립트 실행
./install.sh
```
