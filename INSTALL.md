# Doomsday Extension Installation Guide

## Table of Contents

- [Quick Installation (Recommended)](#quick-installation-recommended)
- [Manual Installation](#manual-installation)
- [Installation from Source](#installation-from-source)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

---

## Quick Installation (Recommended)

The easiest way to install Doomsday extension.

### Prerequisites

- GNOME Shell 45, 46, or 47
- Extension Manager app (recommended)

### Steps

1. **Download the extension**

   Download `doomsday@devastator-x.github.io.shell-extension.zip` from:
   - [GitHub Releases](https://github.com/devastator-x/doomsday/releases/latest)

2. **Install via Extension Manager**

   ```bash
   # If you don't have Extension Manager installed:
   flatpak install flathub com.mattjakeman.ExtensionManager
   ```

   - Open Extension Manager
   - Click "Install from file..." button
   - Select the downloaded ZIP file
   - The extension will be installed automatically

3. **Enable the extension**

   - Toggle the switch in Extension Manager to enable Doomsday
   - Or use command line:

   ```bash
   gnome-extensions enable doomsday@devastator-x.github.io
   ```

4. **Restart GNOME Shell**

   - **X11**: Press `Alt+F2`, type `r`, press `Enter`
   - **Wayland**: Log out and log back in

---

## Manual Installation

Install using command line.

### Download and Install

```bash
# 1. Download the extension
wget https://github.com/devastator-x/doomsday/releases/latest/download/doomsday@devastator-x.github.io.shell-extension.zip

# 2. Create extension directory
mkdir -p ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# 3. Extract files
unzip doomsday@devastator-x.github.io.shell-extension.zip \
  -d ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# 4. Compile schema
glib-compile-schemas \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/

# 5. Enable extension
gnome-extensions enable doomsday@devastator-x.github.io

# 6. Restart GNOME Shell
# X11: Alt+F2, type 'r', press Enter
# Wayland: Log out and log back in
```

---

## Installation from Source

Install directly from GitHub repository.

### Clone Repository

```bash
git clone https://github.com/devastator-x/doomsday.git
cd doomsday
```

### Option 1: Using Installation Script

```bash
# Run the installation script
./install.sh
```

The script will:
- Copy files to the extension directory
- Compile the GSettings schema
- Enable the extension

### Option 2: Manual Installation from Source

```bash
# Copy files to extension directory
cp -r . ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Compile schema
glib-compile-schemas \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/

# Enable extension
gnome-extensions enable doomsday@devastator-x.github.io
```

### Restart GNOME Shell

- **X11**: `Alt+F2` → type `r` → `Enter`
- **Wayland**: Log out and log back in

---

## Troubleshooting

### Extension doesn't appear after installation

1. **Check if extension is enabled:**
   ```bash
   gnome-extensions list --enabled | grep doomsday
   ```

2. **Check for errors:**
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell | grep -i doomsday
   ```

3. **Restart GNOME Shell:**
   - X11: `Alt+F2` → `r` → `Enter`
   - Wayland: Log out and log back in

### Schema compilation errors

```bash
# Recompile schema manually
glib-compile-schemas \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/
```

### Permission issues

```bash
# Ensure correct ownership
chown -R $USER:$USER \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Set correct permissions
chmod -R 755 \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io
```

### Extension appears but doesn't work

1. **Check GNOME Shell version compatibility:**
   ```bash
   gnome-shell --version
   ```
   Should be 45, 46, or 47

2. **Reinstall the extension:**
   ```bash
   gnome-extensions uninstall doomsday@devastator-x.github.io
   # Then reinstall using one of the methods above
   ```

---

## Uninstallation

### Using Extension Manager

1. Open Extension Manager
2. Find "Doomsday" in the list
3. Click the uninstall button

### Using Command Line

```bash
# Disable and uninstall
gnome-extensions disable doomsday@devastator-x.github.io
gnome-extensions uninstall doomsday@devastator-x.github.io

# Remove settings (optional)
dconf reset -f /org/gnome/shell/extensions/doomsday/
```

### Manual Removal

```bash
# Remove extension directory
rm -rf ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Remove settings (optional)
dconf reset -f /org/gnome/shell/extensions/doomsday/

# Restart GNOME Shell
# X11: Alt+F2 → 'r' → Enter
# Wayland: Log out and log back in
```

---

## Updating the Extension

### From Extension Manager

Extension Manager will notify you when updates are available and handle updates automatically.

### Manual Update

```bash
# Download latest version
wget https://github.com/devastator-x/doomsday/releases/latest/download/doomsday@devastator-x.github.io.shell-extension.zip

# Remove old version
rm -rf ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Extract new version
mkdir -p ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io
unzip doomsday@devastator-x.github.io.shell-extension.zip \
  -d ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Compile schema
glib-compile-schemas \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/

# Restart GNOME Shell
```

---

## Getting Help

- **Issues**: https://github.com/devastator-x/doomsday/issues
- **Documentation**: https://github.com/devastator-x/doomsday
- **GNOME Extensions**: https://extensions.gnome.org

---

**Note**: After installation, you may need to restart GNOME Shell for the extension to appear. On Wayland, this requires logging out and logging back in.
