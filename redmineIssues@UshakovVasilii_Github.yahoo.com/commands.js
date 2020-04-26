const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const System = imports.ui.status.system;

const Gettext = imports.gettext.domain('redmine-issues');
const _ = Gettext.gettext;

const Commands = class {
    constructor(){
        this.commandMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});

        this.refreshButton = this._createButton('view-refresh-symbolic');
        this._addButton(this.refreshButton);

        this.markAllReadButton = this._createButton('list-remove-all-symbolic');
        this._addButton(this.markAllReadButton);

        this.preferencesButton = this._createButton('preferences-system-symbolic');
        this._addButton(this.preferencesButton);

        this._makeVisible();
    }

    sync(){
        this._makeVisible();
    }

    _makeVisible(){
        this.refreshButton.visible = true;
        this.markAllReadButton.visible = true;
        this.preferencesButton.visible = true;
    }

    setMinWidth(width){
        this.commandMenuItem.actor.style = 'min-width:' + width + 'px';
    }
    
    _addButton(button){
        this.commandMenuItem.actor.add(button, { expand: true, x_fill: false });
    }

    _createButton(icon_name){
        return new St.Button({
            child: new St.Icon({icon_name: icon_name}),
            style_class: 'system-menu-action'
        });
    }

    destroy(){
        this.commandMenuItem.destroy();
    }

};
