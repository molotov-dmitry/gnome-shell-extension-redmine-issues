const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const Gettext = imports.gettext.domain('redmine-issues');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Сonstants = Me.imports.constants;

const IssueItem = class {

    constructor(issue, sortKey){
        this._settings = ExtensionUtils.getSettings();

        this.menuItem = new PopupMenu.PopupBaseMenuItem();
        this.issueId = issue.id;
        this.sortKey = sortKey;

        this._statusLabels = {};
        this._label = new St.Label({text: '#' + issue.id + ' - ' + issue.subject});
        this.setMaxWidth(this._settings.get_int('max-subject-width'));
        let unread = issue.unread_fields.length > 0;
        if(unread)
            this._label.add_style_class_name('ri-issue-label-unread');

        this.menuItem.actor.add(this._label,{x_fill: true, expand: true});

        this._statusLabelBox = new St.BoxLayout({style_class: 'ri-popup-menu-item-status-labels'});
        this.menuItem.actor.add(this._statusLabelBox);
        this._addStatusLabels(issue);
        this._buttonBox = new St.BoxLayout();
        this.menuItem.actor.add(this._buttonBox);
        this.markReadButton = new St.Button({
            child: new St.Icon({icon_name: 'object-select-symbolic', style_class: 'ri-issue-icon'})
        });

        if(unread)
          this._showMarkReadButton();

        this.bookmarkButton = new St.Button({
            child: new St.Icon({icon_name: (issue.ri_bookmark ? 'user-bookmarks-symbolic' : 'bookmark-new-symbolic'),
                                style_class: 'ri-issue-icon'})
        });
        this._buttonBox.add(this.bookmarkButton);
    }

    refreshBookmarkButton(ri_bookmark){
        this.bookmarkButton.child.icon_name = ri_bookmark ? 'user-bookmarks-symbolic' : 'bookmark-new-symbolic';
    }

    setMaxWidth(width){
        this._label.style = 'max-width:' + width + 'px';
    }

    _showMarkReadButton(){
        if(this.isMarkReadButtonShown)
            return;
        this._buttonBox.insert_child_at_index(this.markReadButton, 0);
        this.isMarkReadButtonShown = true;
    }

    _addStatusLabel(key, text, styleClass){
        let label = new St.Label({text: text, style_class: styleClass});
        this._statusLabels[key] = label;
        this._statusLabelBox.add(label);
    }

    _addStatusLabels(issue){
        Сonstants.LABEL_KEYS.forEach(Lang.bind(this, function(key){
            if(!this._settings.get_boolean('show-status-item-' + key.replace('_','-')))
                return;
            let styleClass = issue.unread_fields.indexOf(key) >= 0 ? 'ri-popup-status-menu-item-new' : 'popup-status-menu-item';
            if(key == 'done_ratio' && (issue.done_ratio || issue.done_ratio==0)) {
                this._addStatusLabel('done_ratio', issue.done_ratio + '%', styleClass);
            } else if(issue[key]) {
                this._addStatusLabel(key, issue[key].name, styleClass);
            }
        }));
    }

    reloadStatusLabels(issue){
        for(let labelKey in this._statusLabels){
            this._statusLabels[labelKey].destroy();
        }
        this._statusLabels = {};
        this._addStatusLabels(issue);
    }

    _makeLabelNew(key, text){
        let label = this._statusLabels[key];
        if(label) {
            label.style_class = 'ri-popup-status-menu-item-new';
            label.set_text(text);
        } else {
            this._addStatusLabel(key, text, 'ri-popup-status-menu-item-new');
        }
    }

    makeRead(){
        Сonstants.LABEL_KEYS.forEach(Lang.bind(this, function(key){
            let label = this._statusLabels[key];
            if(label)
                label.style_class = 'popup-status-menu-item';
        }));
        this._label.remove_style_class_name('ri-issue-label-unread');
        if(this.isMarkReadButtonShown) {
            this._buttonBox.remove_child(this.markReadButton);
            this.isMarkReadButtonShown = false;
        }
    }

    makeUnread(issue){
        this._label.add_style_class_name('ri-issue-label-unread');
        this._showMarkReadButton();
        Сonstants.LABEL_KEYS.forEach(Lang.bind(this, function(key){
            if(issue.unread_fields.indexOf(key) >= 0){
                if(this._settings.get_boolean('show-status-item-' + key.replace('_','-')))
                    this._makeLabelNew(key, key == 'done_ratio' ? issue.done_ratio + '%' : issue[key].name);
            }
        }));
        if(issue.unread_fields.indexOf('subject') >= 0){
            this._label.text = '#' + issue.id + ' - ' + issue.subject;
        }
    }

};
