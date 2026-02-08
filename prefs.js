import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class DoomsdayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create a preferences page
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        // Create a preferences group for panel settings
        const panelGroup = new Adw.PreferencesGroup({
            title: 'Panel Settings',
            description: 'Customize the extension appearance',
        });
        page.add(panelGroup);

        // Panel position selector
        const positionRow = new Adw.ComboRow({
            title: 'Panel Position',
            subtitle: 'Choose where the extension appears in the top panel',
        });

        const positionModel = new Gtk.StringList();
        positionModel.append('Left');
        positionModel.append('Center');
        positionModel.append('Right');
        positionRow.set_model(positionModel);

        // Set initial value
        const currentPosition = settings.get_string('panel-position');
        const positions = ['left', 'center', 'right'];
        positionRow.set_selected(positions.indexOf(currentPosition));

        // Connect to changes
        positionRow.connect('notify::selected', () => {
            const newPosition = positions[positionRow.get_selected()];
            settings.set_string('panel-position', newPosition);
        });

        panelGroup.add(positionRow);

        // Panel index selector
        const indexRow = new Adw.SpinRow({
            title: 'Panel Index',
            subtitle: 'Fine-tune position within the panel (0=leftmost, -1=rightmost)',
        });

        indexRow.set_adjustment(new Gtk.Adjustment({
            lower: -1,
            upper: 99,
            step_increment: 1,
            page_increment: 10,
        }));

        // Set initial value
        const currentIndex = settings.get_int('panel-index');
        indexRow.set_value(currentIndex);

        // Connect to changes
        indexRow.connect('changed', () => {
            settings.set_int('panel-index', indexRow.get_value());
        });

        panelGroup.add(indexRow);

        // Create a preferences group for D-Day list
        const group = new Adw.PreferencesGroup({
            title: 'D-Day Events',
            description: 'Manage your countdown events',
        });
        page.add(group);

        // Create ListBox for events
        const listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            css_classes: ['boxed-list'],
        });
        group.add(listBox);

        let radioGroup = null;

        // Local function: create event row
        const createEventRow = (event, isSelected) => {
            const row = new Adw.ActionRow({
                title: event.name,
                subtitle: event.date,
            });

            // Add radio button for selection
            const radioButton = new Gtk.CheckButton({
                active: isSelected,
                valign: Gtk.Align.CENTER,
            });
            radioButton.connect('toggled', () => {
                if (radioButton.get_active()) {
                    settings.set_string('selected-event-id', event.id);
                }
            });
            row.add_prefix(radioButton);

            // Make all radio buttons part of same group
            if (!radioGroup) {
                radioGroup = radioButton;
            } else {
                radioButton.set_group(radioGroup);
            }

            // Add edit button
            const editButton = new Gtk.Button({
                icon_name: 'document-edit-symbolic',
                label: 'Edit',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat'],
                tooltip_text: 'Edit this event',
            });
            editButton.connect('clicked', () => showEventDialog(window, event));
            row.add_suffix(editButton);

            // Add delete button
            const deleteButton = new Gtk.Button({
                icon_name: 'user-trash-symbolic',
                label: 'Delete',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat', 'destructive-action'],
                tooltip_text: 'Delete this event',
            });
            deleteButton.connect('clicked', () => deleteEvent(event.id));
            row.add_suffix(deleteButton);

            return row;
        };

        // Local function: load events
        const loadEvents = () => {
            // Clear existing rows
            let child = listBox.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                listBox.remove(child);
                child = next;
            }

            // Reset radio group
            radioGroup = null;

            // Load events from settings
            const eventsJson = settings.get_string('dday-events');
            const selectedId = settings.get_string('selected-event-id');

            try {
                const events = JSON.parse(eventsJson);

                events.forEach(event => {
                    const row = createEventRow(event, event.id === selectedId);
                    listBox.append(row);
                });

                // Show placeholder if no events
                if (events.length === 0) {
                    const row = new Adw.ActionRow({
                        title: 'No D-Day events yet',
                        subtitle: 'Click "Add D-Day Event" to create your first countdown',
                    });
                    listBox.append(row);
                }

            } catch (e) {
                console.error('Doomsday: Failed to load events:', e);
            }
        };

        // Local function: save event
        const saveEvent = (eventId, name, date) => {
            const eventsJson = settings.get_string('dday-events');
            let events = [];

            try {
                events = JSON.parse(eventsJson);
            } catch (e) {
                console.error('Doomsday: Failed to parse events:', e);
            }

            if (eventId) {
                // Update existing event
                const index = events.findIndex(e => e.id === eventId);
                if (index !== -1) {
                    events[index] = { id: eventId, name, date };
                }
            } else {
                // Create new event with UUID
                const newId = GLib.uuid_string_random();
                events.push({ id: newId, name, date });

                // Auto-select if it's the first event
                if (events.length === 1) {
                    settings.set_string('selected-event-id', newId);
                }
            }

            // Save back to settings
            settings.set_string('dday-events', JSON.stringify(events));
        };

        // Local function: delete event
        const deleteEvent = (eventId) => {
            const eventsJson = settings.get_string('dday-events');
            let events = [];

            try {
                events = JSON.parse(eventsJson);
            } catch (e) {
                console.error('Doomsday: Failed to parse events:', e);
                return;
            }

            // Remove event
            events = events.filter(e => e.id !== eventId);

            // If deleted event was selected, clear selection or select first
            const selectedId = settings.get_string('selected-event-id');
            if (selectedId === eventId) {
                const newSelectedId = events.length > 0 ? events[0].id : '';
                settings.set_string('selected-event-id', newSelectedId);
            }

            // Save back to settings
            settings.set_string('dday-events', JSON.stringify(events));
        };

        // Local function: show event dialog
        const showEventDialog = (parentWindow, existingEvent) => {
            const dialog = new Adw.MessageDialog({
                transient_for: parentWindow,
                modal: true,
                heading: existingEvent ? 'Edit D-Day Event' : 'New D-Day Event',
            });

            // Create form content
            const box = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 12,
                margin_top: 12,
                margin_bottom: 12,
                margin_start: 12,
                margin_end: 12,
            });

            // Event name entry
            const nameEntry = new Adw.EntryRow({
                title: 'Event Name',
            });
            if (existingEvent) {
                nameEntry.set_text(existingEvent.name);
            }
            box.append(nameEntry);

            // Date picker (using entry for simplicity)
            const dateEntry = new Adw.EntryRow({
                title: 'Date (YYYY-MM-DD)',
            });
            if (existingEvent) {
                dateEntry.set_text(existingEvent.date);
            } else {
                // Default to today
                const today = new Date();
                const dateStr = today.toISOString().split('T')[0];
                dateEntry.set_text(dateStr);
            }
            box.append(dateEntry);

            dialog.set_extra_child(box);

            // Add buttons
            dialog.add_response('cancel', 'Cancel');
            dialog.add_response('save', 'Save');
            dialog.set_response_appearance('save', Adw.ResponseAppearance.SUGGESTED);

            dialog.connect('response', (dlg, response) => {
                if (response === 'save') {
                    const name = nameEntry.get_text().trim();
                    const date = dateEntry.get_text().trim();

                    // Validate inputs
                    if (!name || !date) {
                        console.error('Doomsday: Name and date are required');
                        return;
                    }

                    // Validate date format
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                        console.error('Doomsday: Invalid date format');
                        return;
                    }

                    // Save event
                    saveEvent(existingEvent?.id, name, date);
                }
                dlg.close();
            });

            dialog.present();
        };

        // Load and display events
        loadEvents();

        // Add button to create new event
        const addButton = new Gtk.Button({
            label: 'Add D-Day Event',
            css_classes: ['suggested-action'],
            margin_top: 12,
        });
        addButton.connect('clicked', () => showEventDialog(window, null));
        group.add(addButton);

        // Listen for settings changes
        const settingsChangedId = settings.connect('changed::dday-events',
            () => loadEvents());

        // Clean up settings signal on window close
        window.connect('close-request', () => {
            settings.disconnect(settingsChangedId);
        });

        // Create About page
        this._addAboutPage(window);
    }

    _addAboutPage(window) {
        // Create About page
        const aboutPage = new Adw.PreferencesPage({
            title: 'About',
            icon_name: 'help-about-symbolic',
        });
        window.add(aboutPage);

        // Extension info group
        const infoGroup = new Adw.PreferencesGroup({
            title: 'Doomsday Extension',
            description: 'D-Day countdown for GNOME Shell',
        });
        aboutPage.add(infoGroup);

        // Version row
        const versionRow = new Adw.ActionRow({
            title: 'Version',
            subtitle: '1.0',
        });
        infoGroup.add(versionRow);

        // Links group
        const linksGroup = new Adw.PreferencesGroup({
            title: 'Links',
        });
        aboutPage.add(linksGroup);

        // GitHub button
        const githubRow = new Adw.ActionRow({
            title: 'Doomsday on GitHub',
            subtitle: 'Visit the project repository',
            activatable: true,
        });
        const githubIcon = new Gtk.Image({
            icon_name: 'web-browser-symbolic',
        });
        githubRow.add_prefix(githubIcon);
        githubRow.connect('activated', () => {
            Gtk.show_uri(window, 'https://github.com/devastator-x/doomsday', 0);
        });
        linksGroup.add(githubRow);

        // Report Issue button
        const issueRow = new Adw.ActionRow({
            title: 'Report an Issue',
            subtitle: 'Help improve this extension',
            activatable: true,
        });
        const issueIcon = new Gtk.Image({
            icon_name: 'dialog-warning-symbolic',
        });
        issueRow.add_prefix(issueIcon);
        issueRow.connect('activated', () => {
            Gtk.show_uri(window, 'https://github.com/devastator-x/doomsday/issues', 0);
        });
        linksGroup.add(issueRow);

        // Donate button
        const donateRow = new Adw.ActionRow({
            title: 'Donate',
            subtitle: 'Support this project via GitHub Sponsors',
            activatable: true,
        });
        const donateIcon = new Gtk.Image({
            icon_name: 'emblem-favorite-symbolic',
        });
        donateRow.add_prefix(donateIcon);
        donateRow.connect('activated', () => {
            Gtk.show_uri(window, 'https://github.com/sponsors/devastator-x', 0);
        });
        linksGroup.add(donateRow);

        // Legal group
        const legalGroup = new Adw.PreferencesGroup({
            title: 'Legal',
        });
        aboutPage.add(legalGroup);

        // License button
        const licenseRow = new Adw.ActionRow({
            title: 'License',
            subtitle: 'GPL-3.0',
            activatable: true,
        });
        const licenseIcon = new Gtk.Image({
            icon_name: 'text-x-generic-symbolic',
        });
        licenseRow.add_prefix(licenseIcon);
        licenseRow.connect('activated', () => {
            this._showLicenseDialog(window);
        });
        legalGroup.add(licenseRow);

        // Author row
        const authorRow = new Adw.ActionRow({
            title: 'Author',
            subtitle: 'devastator-x',
        });
        const authorIcon = new Gtk.Image({
            icon_name: 'avatar-default-symbolic',
        });
        authorRow.add_prefix(authorIcon);
        legalGroup.add(authorRow);
    }

    _showLicenseDialog(window) {
        const dialog = new Adw.MessageDialog({
            transient_for: window,
            modal: true,
            heading: 'License Information',
            body: 'This extension is licensed under GPL-3.0.\n\n' +
                  'This program is free software: you can redistribute it and/or modify ' +
                  'it under the terms of the GNU General Public License as published by ' +
                  'the Free Software Foundation, either version 3 of the License, or ' +
                  '(at your option) any later version.\n\n' +
                  'This program is distributed in the hope that it will be useful, ' +
                  'but WITHOUT ANY WARRANTY; without even the implied warranty of ' +
                  'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the ' +
                  'GNU General Public License for more details.',
        });

        dialog.add_response('close', 'Close');
        dialog.set_response_appearance('close', Adw.ResponseAppearance.SUGGESTED);
        dialog.connect('response', () => dialog.close());
        dialog.present();
    }
}
