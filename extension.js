import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

// Custom menu item with edit and delete buttons
const DoomsdayMenuItem = GObject.registerClass(
class DoomsdayMenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(indicator, event, displayText, isSelected) {
        super._init();

        this._indicator = indicator;
        this._event = event;

        // Create horizontal box layout
        const box = new St.BoxLayout({
            vertical: false,
            x_expand: true,
            style_class: 'doomsday-menu-item-box',
        });

        // Event label
        this._label = new St.Label({
            text: displayText,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        box.add_child(this._label);

        // Mark selected item with a dot
        if (isSelected) {
            this.setOrnament(PopupMenu.Ornament.DOT);
        }

        // Edit button
        const editButton = new St.Button({
            style_class: 'doomsday-edit-button',
            child: new St.Icon({
                icon_name: 'document-edit-symbolic',
                icon_size: 16,
            }),
            x_align: Clutter.ActorAlign.END,
        });
        editButton.connect('clicked', () => {
            this._indicator._showEditDialog(this._event);
            return Clutter.EVENT_STOP;
        });
        box.add_child(editButton);

        // Delete button
        const deleteButton = new St.Button({
            style_class: 'doomsday-delete-button',
            child: new St.Icon({
                icon_name: 'user-trash-symbolic',
                icon_size: 16,
            }),
            x_align: Clutter.ActorAlign.END,
        });
        deleteButton.connect('clicked', () => {
            this._indicator._showDeleteDialog(this._event);
            return Clutter.EVENT_STOP;
        });
        box.add_child(deleteButton);

        this.add_child(box);

        // Click on the item itself to select it
        this.connect('activate', () => {
            this._indicator._settings.set_string('selected-event-id', this._event.id);
        });
    }
});

const DoomsdayIndicator = GObject.registerClass(
class DoomsdayIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Doomsday Indicator', false);

        this._extension = extension;
        this._settings = extension.getSettings();

        // Create label for panel
        this._label = new St.Label({
            text: 'D-Day',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'doomsday-label'
        });
        this.add_child(this._label);

        // Build popup menu
        this._buildMenu();

        // Connect to settings changes
        this._settingsChangedId = this._settings.connect('changed',
            this._onSettingsChanged.bind(this));

        // Initial update
        this._updateDisplay();

        // Setup daily timer
        this._setupTimer();
    }

    _buildMenu() {
        // Add "Open Preferences" menu item at the bottom
        // Menu items for D-Days will be added dynamically in _updateMenuItems
    }

    _updateDisplay() {
        // Get selected event from settings
        const selectedId = this._settings.get_string('selected-event-id');
        const eventsJson = this._settings.get_string('dday-events');

        try {
            const events = JSON.parse(eventsJson);
            const selectedEvent = events.find(e => e.id === selectedId);

            if (selectedEvent) {
                const displayText = this._calculateDDay(
                    selectedEvent.name,
                    selectedEvent.date
                );
                this._label.set_text(displayText);
            } else {
                this._label.set_text('No D-Day');
            }

            // Update menu items
            this._updateMenuItems(events, selectedId);

        } catch (e) {
            console.error('Doomsday: Failed to parse D-Day events:', e);
            this._label.set_text('Error');
        }
    }

    _calculateDDay(name, targetDateStr) {
        // Parse target date (YYYY-MM-DD format)
        const [year, month, day] = targetDateStr.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day);

        // Get today at midnight (ignore time component)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate difference in days
        const diffTime = targetDate - today;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Format according to requirements
        if (diffDays === 0) {
            return `${name} D-Day`;
        } else if (diffDays > 0) {
            return `${name} D-${diffDays}`;
        } else {
            return `${name} D+${Math.abs(diffDays)}`;
        }
    }

    _setupTimer() {
        // Calculate seconds until next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const secondsUntilMidnight = Math.floor((tomorrow - now) / 1000);

        // Set up initial timeout to midnight
        this._midnightTimeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            secondsUntilMidnight,
            () => {
                this._updateDisplay();
                // After first midnight, update every 24 hours
                this._dailyTimeoutId = GLib.timeout_add_seconds(
                    GLib.PRIORITY_DEFAULT,
                    86400, // 24 hours
                    () => {
                        this._updateDisplay();
                        return GLib.SOURCE_CONTINUE;
                    }
                );
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _onSettingsChanged() {
        this._updateDisplay();
    }

    _updateMenuItems(events, selectedId) {
        // Clear existing menu items
        this.menu.removeAll();

        // Add custom menu items for each D-Day event with edit/delete buttons
        events.forEach(event => {
            const displayText = this._calculateDDay(event.name, event.date);
            const item = new DoomsdayMenuItem(
                this,
                event,
                displayText,
                event.id === selectedId
            );
            this.menu.addMenuItem(item);
        });

        // Add separator
        if (events.length > 0) {
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        }

        // Add "Add D-Day" menu item
        const addItem = new PopupMenu.PopupMenuItem('➕ Add D-Day');
        addItem.connect('activate', () => {
            this._showAddDialog();
        });
        this.menu.addMenuItem(addItem);

        // Add "Manage Events" menu item that opens preferences
        const manageItem = new PopupMenu.PopupMenuItem('⚙️ Manage Events');
        manageItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(manageItem);
    }

    _showAddDialog() {
        const dialog = new ModalDialog.ModalDialog();

        // Title
        const title = new St.Label({
            text: 'Add D-Day Event',
            style_class: 'doomsday-dialog-title',
            x_align: Clutter.ActorAlign.CENTER,
        });
        dialog.contentLayout.add_child(title);

        // Name entry
        const nameBox = new St.BoxLayout({
            vertical: false,
            style_class: 'doomsday-dialog-row',
        });
        const nameLabel = new St.Label({
            text: 'Name: ',
            style_class: 'doomsday-dialog-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        const nameEntry = new St.Entry({
            hint_text: 'Event name',
            style_class: 'doomsday-dialog-entry',
            can_focus: true,
            x_expand: true,
        });
        nameBox.add_child(nameLabel);
        nameBox.add_child(nameEntry);
        dialog.contentLayout.add_child(nameBox);

        // Date entry
        const dateBox = new St.BoxLayout({
            vertical: false,
            style_class: 'doomsday-dialog-row',
        });
        const dateLabel = new St.Label({
            text: 'Date: ',
            style_class: 'doomsday-dialog-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const dateEntry = new St.Entry({
            text: dateStr,
            hint_text: 'YYYY-MM-DD',
            style_class: 'doomsday-dialog-entry',
            can_focus: true,
            x_expand: true,
        });
        dateBox.add_child(dateLabel);
        dateBox.add_child(dateEntry);
        dialog.contentLayout.add_child(dateBox);

        // Buttons
        dialog.addButton({
            label: 'Cancel',
            action: () => dialog.close(),
            key: Clutter.KEY_Escape,
        });

        dialog.addButton({
            label: 'Add',
            action: () => {
                const newName = nameEntry.get_text().trim();
                const newDate = dateEntry.get_text().trim();

                // Validate inputs
                if (!newName || !newDate) {
                    return;
                }

                if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                    return;
                }

                // Add new event
                this._addEvent(newName, newDate);
                dialog.close();
            },
            default: true,
        });

        dialog.open();
    }

    _showEditDialog(event) {
        const dialog = new ModalDialog.ModalDialog();

        // Title
        const title = new St.Label({
            text: 'Edit D-Day Event',
            style_class: 'doomsday-dialog-title',
            x_align: Clutter.ActorAlign.CENTER,
        });
        dialog.contentLayout.add_child(title);

        // Name entry
        const nameBox = new St.BoxLayout({
            vertical: false,
            style_class: 'doomsday-dialog-row',
        });
        const nameLabel = new St.Label({
            text: 'Name: ',
            style_class: 'doomsday-dialog-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        const nameEntry = new St.Entry({
            text: event.name,
            style_class: 'doomsday-dialog-entry',
            can_focus: true,
            x_expand: true,
        });
        nameBox.add_child(nameLabel);
        nameBox.add_child(nameEntry);
        dialog.contentLayout.add_child(nameBox);

        // Date entry
        const dateBox = new St.BoxLayout({
            vertical: false,
            style_class: 'doomsday-dialog-row',
        });
        const dateLabel = new St.Label({
            text: 'Date: ',
            style_class: 'doomsday-dialog-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        const dateEntry = new St.Entry({
            text: event.date,
            hint_text: 'YYYY-MM-DD',
            style_class: 'doomsday-dialog-entry',
            can_focus: true,
            x_expand: true,
        });
        dateBox.add_child(dateLabel);
        dateBox.add_child(dateEntry);
        dialog.contentLayout.add_child(dateBox);

        // Buttons
        dialog.addButton({
            label: 'Cancel',
            action: () => dialog.close(),
            key: Clutter.KEY_Escape,
        });

        dialog.addButton({
            label: 'Save',
            action: () => {
                const newName = nameEntry.get_text().trim();
                const newDate = dateEntry.get_text().trim();

                // Validate inputs
                if (!newName || !newDate) {
                    return;
                }

                if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                    return;
                }

                // Update event
                this._updateEvent(event.id, newName, newDate);
                dialog.close();
            },
            default: true,
        });

        dialog.open();
    }

    _showDeleteDialog(event) {
        const dialog = new ModalDialog.ModalDialog();

        // Message
        const message = new St.Label({
            text: `Delete "${event.name}"?\nThis action cannot be undone.`,
            style_class: 'doomsday-dialog-message',
            x_align: Clutter.ActorAlign.CENTER,
        });
        dialog.contentLayout.add_child(message);

        // Buttons
        dialog.addButton({
            label: 'Cancel',
            action: () => dialog.close(),
            key: Clutter.KEY_Escape,
        });

        dialog.addButton({
            label: 'Delete',
            action: () => {
                this._deleteEvent(event.id);
                dialog.close();
            },
        });

        dialog.open();
    }

    _addEvent(name, date) {
        const eventsJson = this._settings.get_string('dday-events');
        let events = [];

        try {
            events = JSON.parse(eventsJson);
        } catch (e) {
            console.error('Doomsday: Failed to parse events:', e);
            events = [];
        }

        // Create new event with UUID
        const newId = GLib.uuid_string_random();
        events.push({ id: newId, name, date });

        // Auto-select if it's the first event
        if (events.length === 1) {
            this._settings.set_string('selected-event-id', newId);
        }

        // Save
        this._settings.set_string('dday-events', JSON.stringify(events));
    }

    _updateEvent(eventId, newName, newDate) {
        const eventsJson = this._settings.get_string('dday-events');
        let events = [];

        try {
            events = JSON.parse(eventsJson);
        } catch (e) {
            console.error('Doomsday: Failed to parse events:', e);
            return;
        }

        // Update event
        const index = events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            events[index] = { id: eventId, name: newName, date: newDate };
            this._settings.set_string('dday-events', JSON.stringify(events));
        }
    }

    _deleteEvent(eventId) {
        const eventsJson = this._settings.get_string('dday-events');
        let events = [];

        try {
            events = JSON.parse(eventsJson);
        } catch (e) {
            console.error('Doomsday: Failed to parse events:', e);
            return;
        }

        // Remove event
        events = events.filter(e => e.id !== eventId);

        // If deleted event was selected, select first or clear
        const selectedId = this._settings.get_string('selected-event-id');
        if (selectedId === eventId) {
            const newSelectedId = events.length > 0 ? events[0].id : '';
            this._settings.set_string('selected-event-id', newSelectedId);
        }

        // Save
        this._settings.set_string('dday-events', JSON.stringify(events));
    }

    destroy() {
        // Clean up timers
        if (this._midnightTimeoutId) {
            GLib.Source.remove(this._midnightTimeoutId);
            this._midnightTimeoutId = null;
        }
        if (this._dailyTimeoutId) {
            GLib.Source.remove(this._dailyTimeoutId);
            this._dailyTimeoutId = null;
        }

        // Disconnect settings
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        super.destroy();
    }
});

export default class DoomsdayExtension extends Extension {
    enable() {
        console.debug(`enabling ${this.metadata.name}`);

        this._settings = this.getSettings();
        this._indicator = new DoomsdayIndicator(this);
        this._addIndicatorToPanel();

        // Watch for panel position changes
        this._positionChangedId = this._settings.connect('changed::panel-position', () => {
            this._repositionIndicator();
        });

        // Watch for panel index changes
        this._indexChangedId = this._settings.connect('changed::panel-index', () => {
            this._repositionIndicator();
        });
    }

    disable() {
        console.debug(`disabling ${this.metadata.name}`);

        if (this._positionChangedId) {
            this._settings.disconnect(this._positionChangedId);
            this._positionChangedId = null;
        }

        if (this._indexChangedId) {
            this._settings.disconnect(this._indexChangedId);
            this._indexChangedId = null;
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._settings = null;
    }

    _addIndicatorToPanel() {
        const position = this._settings.get_string('panel-position');
        const index = this._settings.get_int('panel-index');
        const box = position === 'left' ? 'left' : position === 'center' ? 'center' : 'right';

        Main.panel.addToStatusArea(this.uuid, this._indicator, index, box);
    }

    _repositionIndicator() {
        if (this._indicator) {
            // Destroy and recreate the indicator
            this._indicator.destroy();
            this._indicator = new DoomsdayIndicator(this);
            this._addIndicatorToPanel();
        }
    }
}
