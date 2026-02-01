================================================================================
  Doomsday - GNOME Extension
  D-Day Countdown Extension for GNOME Shell
================================================================================

GNOME Version: 45, 46, 47
License: GPL-3.0

--------------------------------------------------------------------------------
Features
--------------------------------------------------------------------------------

✓ D-Day Display in GNOME Panel
  - Real-time countdown to important events on your panel

✓ Multiple D-Day Management
  - Unlimited events with easy add, edit, and delete

✓ Quick Add/Edit/Delete
  - Manage D-Days directly from extension menu without opening preferences

✓ Event Selection
  - Switch between events with a single click

✓ Panel Position Customization
  - Choose left, center, or right panel position

✓ Automatic Updates
  - Daily countdown refresh at midnight

--------------------------------------------------------------------------------
Installation
--------------------------------------------------------------------------------

[Method 1] Extension Manager (Recommended)

1. Open Extension Manager app
2. Click "Install from file..."
3. Select doomsday@devastator-x.github.io.shell-extension.zip
4. Enable the extension

[Method 2] Manual Installation

# Clone repository
git clone https://github.com/devastator-x/doomsday.git
cd doomsday

# Run installation script
./install.sh

# Restart GNOME Shell (Alt+F2, type 'r', press Enter)

[Method 3] Install from ZIP

# Extract to extension directory
mkdir -p ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io
unzip doomsday@devastator-x.github.io.shell-extension.zip \
  -d ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io

# Compile schema
glib-compile-schemas \
  ~/.local/share/gnome-shell/extensions/doomsday@devastator-x.github.io/schemas/

# Enable extension
gnome-extensions enable doomsday@devastator-x.github.io

# Restart GNOME Shell (Alt+F2, type 'r', press Enter)

--------------------------------------------------------------------------------
Usage
--------------------------------------------------------------------------------

[Adding D-Day]

1. Click D-Day on panel
2. Select "➕ Add D-Day"
3. Enter event name and date (YYYY-MM-DD format)
4. Click "Add"

[Editing/Deleting D-Day]

• From Menu: Click ✏️ (edit) or 🗑️ (delete) button next to each event
• From Settings: Click "⚙️ Manage Events" → Use Edit/Delete buttons

[Selecting D-Day to Display]

• Click on any D-Day in the menu (selected item marked with •)

[Changing Panel Position]

1. Click "⚙️ Manage Events"
2. Adjust position and index in "Panel Settings"

--------------------------------------------------------------------------------
Development
--------------------------------------------------------------------------------

# Install in development mode
git clone https://github.com/devastator-x/doomsday.git
cd doomsday
./install.sh

# View logs
journalctl -f -o cat /usr/bin/gnome-shell

# Restart extension (Alt+F2, type 'r', press Enter)

--------------------------------------------------------------------------------
File Structure
--------------------------------------------------------------------------------

doomsday@devastator-x.github.io/
├── extension.js                 # Main extension logic
├── prefs.js                     # Preferences UI
├── metadata.json                # Extension metadata
├── stylesheet.css               # Styles
├── schemas/                     # GSettings schema
│   └── org.gnome.shell.extensions.doomsday.gschema.xml
├── install.sh                   # Installation script
└── README.txt                   # This file

--------------------------------------------------------------------------------
License
--------------------------------------------------------------------------------

GPL-3.0 License
See LICENSE file for details.

--------------------------------------------------------------------------------
Contributing
--------------------------------------------------------------------------------

Bug reports and feature requests welcome!
https://github.com/devastator-x/doomsday/issues

--------------------------------------------------------------------------------

Made with ❤️ by devastator-x
https://github.com/devastator-x

================================================================================
