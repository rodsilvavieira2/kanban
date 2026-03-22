# Maintainer: Rodrigo Silva <rodsilvavieira2@gmail.com>
pkgname=taskmaster-kanban
_appname=kanban
pkgver=1.0.4
pkgrel=1
pkgdesc="Offline-first Kanban board with embedded MCP server"
arch=('x86_64')
url="https://github.com/rodsilvavieira2/kanban"
license=('MIT')
# Electron runtime is bundled by electron-forge — no system electron dep needed
depends=('glibc' 'gcc-libs' 'libx11' 'nss' 'atk' 'gtk3' 'alsa-lib')
makedepends=('nodejs' 'yarn' 'python' 'gcc' 'make')
provides=("$_appname")
conflicts=("$_appname")
options=(!strip)
source=("$_appname-$pkgver.tar.gz::$url/archive/v$pkgver.tar.gz")
sha256sums=('fe957abd471be14e0318cc92ce41739e2f31945d0afbdd3a0024f8b8413af667')

build() {
  cd "$srcdir/$_appname-$pkgver"

  export npm_config_build_from_source=true
  yarn install --immutable
  yarn package
}

package() {
  local _outdir="$srcdir/$_appname-$pkgver/out/$_appname-linux-x64"

  # Install app files to /usr/lib/kanban
  install -dm755 "$pkgdir/usr/lib/$_appname"
  cp -r "$_outdir/." "$pkgdir/usr/lib/$_appname/"
  chmod 755 "$pkgdir/usr/lib/$_appname/$_appname"

  # Launcher script at /usr/bin/kanban
  install -dm755 "$pkgdir/usr/bin"
  cat > "$pkgdir/usr/bin/$_appname" << 'LAUNCHER'
#!/bin/sh
exec /usr/lib/kanban/kanban "$@"
LAUNCHER
  chmod 755 "$pkgdir/usr/bin/$_appname"

  # .desktop entry
  install -dm755 "$pkgdir/usr/share/applications"
  cat > "$pkgdir/usr/share/applications/$_appname.desktop" << 'DESKTOP'
[Desktop Entry]
Name=TaskMaster Kanban
Comment=Offline-first Kanban board with embedded MCP server
Exec=kanban %U
Icon=kanban
Terminal=false
Type=Application
Categories=Office;ProjectManagement;
Keywords=kanban;tasks;productivity;board;mcp;
DESKTOP

  # License
  install -Dm644 "$srcdir/$_appname-$pkgver/LICENSE" \
    "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
}
