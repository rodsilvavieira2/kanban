# Maintainer: rodrigo
pkgname=kanban
pkgver=1.0.0
pkgrel=1
pkgdesc="TaskMaster — offline-first Kanban board with embedded MCP server"
arch=('x86_64')
license=('MIT')
# No system electron needed — Electron Forge bundles the runtime in the output
depends=('glibc' 'gcc-libs' 'libx11' 'nss' 'atk' 'gtk3' 'alsa-lib')
makedepends=('nodejs' 'yarn' 'python' 'gcc' 'make')
options=(!strip)

# No remote source — built directly from the project directory.
# Run: yarn make:arch  (or: makepkg -si) from the project root.

build() {
  cd "$startdir"

  export npm_config_build_from_source=true
  yarn install --immutable
  yarn package
}

package() {
  local _outdir="$startdir/out/$pkgname-linux-x64"

  # Install app files to /usr/lib/kanban
  install -dm755 "$pkgdir/usr/lib/$pkgname"
  cp -r "$_outdir/." "$pkgdir/usr/lib/$pkgname/"
  chmod 755 "$pkgdir/usr/lib/$pkgname/$pkgname"

  # Launcher script at /usr/bin/kanban
  install -dm755 "$pkgdir/usr/bin"
  cat > "$pkgdir/usr/bin/$pkgname" << LAUNCHER
#!/bin/sh
exec /usr/lib/$pkgname/$pkgname "\$@"
LAUNCHER
  chmod 755 "$pkgdir/usr/bin/$pkgname"

  # .desktop entry
  install -dm755 "$pkgdir/usr/share/applications"
  cat > "$pkgdir/usr/share/applications/$pkgname.desktop" << DESKTOP
[Desktop Entry]
Name=TaskMaster Kanban
Comment=Offline-first Kanban board with embedded MCP server
Exec=kanban %U
Icon=kanban
Terminal=false
Type=Application
Categories=Office;ProjectManagement;
Keywords=kanban;tasks;productivity;board;
DESKTOP

  # License
  if [[ -f "$startdir/LICENSE" ]]; then
    install -Dm644 "$startdir/LICENSE" "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
  fi
}
