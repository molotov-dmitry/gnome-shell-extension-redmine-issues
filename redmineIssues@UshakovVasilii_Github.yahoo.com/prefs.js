const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

function init() {
    ExtensionUtils.initTranslations();
}

var RedmineIssuesPrefsWidget = new GObject.registerClass(class RedmineIssuses_RedmineIssuesPrefsWidget extends Gtk.Notebook {

    _init(params) {
        // this.parent(params);
        super._init(params);

        this._settings = ExtensionUtils.getSettings();

        // General tab
        let generalTab = new Gtk.Grid({row_spacing:10,column_spacing:10, margin:10});
        this.append_page(generalTab,  new Gtk.Label({label: _('General')}));

        let apiAccessKeyHelp = _('More information about authentication:') +
            ' <a href="http://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication">Authentication</a>';
        generalTab.attach(new Gtk.Label({label : apiAccessKeyHelp, use_markup : true, halign : Gtk.Align.START}), 0, 0, 2, 1);

        generalTab.attach(new Gtk.Label({ label: _('Redmine URL'), halign : Gtk.Align.END}), 0, 1, 1, 1);
        let redmineURL = new Gtk.Entry({ hexpand: true });
        generalTab.attach(redmineURL, 1, 1, 1, 1);
        this._settings.bind('redmine-url', redmineURL, 'text', Gio.SettingsBindFlags.DEFAULT);
        redmineURL.connect('changed', Lang.bind(this, this._refreshCurlHelp));

        generalTab.attach(new Gtk.Label({ label: _('API access key'), halign : Gtk.Align.END}), 0, 2, 1, 1);
        let apiAccessKey = new Gtk.Entry({ hexpand: true });
        generalTab.attach(apiAccessKey, 1, 2, 1, 1);
        this._settings.bind('api-access-key', apiAccessKey, 'text', Gio.SettingsBindFlags.DEFAULT);
        apiAccessKey.connect('changed', Lang.bind(this, this._refreshCurlHelp));

        generalTab.attach(new Gtk.Label({ label: _('Auto refresh (min)'), halign : Gtk.Align.END}), 0, 3, 1, 1);
        let autoRefresh = Gtk.SpinButton.new_with_range (0, 60, 1);
        generalTab.attach(autoRefresh, 1, 3, 1, 1);
        this._settings.bind('auto-refresh', autoRefresh, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Display tab
        let displayTab = new Gtk.Grid({row_spacing:10,column_spacing:10, margin:10});
        this.append_page(displayTab,  new Gtk.Label({label: _('Display')}));
        let i = 0;

        // Group By ComboBox

        this._addComboBox({
            tab: displayTab,
            items : {
                project: _('Project'),
                category: _('Category'),
                fixed_version: _('Target version'),
                tracker: _('Tracker'),
                priority: _('Priority'),
                status: _('Status'),
                assigned_to: _('Assigned To'),
                author: _('Author')},
            key: 'group-by', y : i++, x : 0,
            label: _('Group By')
        });


        // Switches
        this._addSwitch({tab : displayTab, key : 'desc-order', label : _('Descending Order'), y : i++, x : 0});
        this._addSwitch({tab : displayTab, key : 'show-status-item-status', label : _('Show Status'), y : i++, x : 0});
        this._addSwitch({tab : displayTab, key : 'show-status-item-assigned-to', label : _('Show Assigned To'), y : i++, x : 0});
        this._addSwitch({tab : displayTab, key : 'show-status-item-tracker', label : _('Show Tracker'), y : i++, x : 0});
        this._addSwitch({tab : displayTab, key : 'show-status-item-priority', label : _('Show Priority'), y : i++, x : 0});
        i=0;

        this._addComboBox({
            tab: displayTab,
            items : {
                id: _('ID'),
		subject : _('Subject'),
                updated_on: _('Updated on'),
                done_ratio: _('Done Ratio'),
                project: _('Project'),
                category: _('Category'),
                fixed_version: _('Target version'),
                tracker: _('Tracker'),
                priority: _('Priority'),
                status: _('Status'),
                assigned_to: _('Assigned To'),
                author: _('Author')},
            key: 'order-by', y : i++, x : 2,
            label: _('Order By')
        });

        this._addSwitch({tab : displayTab, key : 'show-status-item-done-ratio', label : _('Show Done Ratio'), y : i++, x : 2});
        this._addSwitch({tab : displayTab, key : 'show-status-item-author', label : _('Show Author'), y : i++, x : 2});
        this._addSwitch({tab : displayTab, key : 'show-status-item-project', label : _('Show Project'), y : i++, x : 2});
        this._addSwitch({tab : displayTab, key : 'show-status-item-fixed-version', label : _('Show Target Version'), y : i++, x : 2});
        this._addSwitch({tab : displayTab, key : 'show-status-item-category', label : _('Show Category'), y : i++, x : 2});

        displayTab.attach(new Gtk.Label({ label: _('Maximum width of Subject (px)'), halign : Gtk.Align.END}), 0, i, 3, 1);
        let maxSubjectWidth = Gtk.SpinButton.new_with_range (300, 1000, 10);
        displayTab.attach(maxSubjectWidth, 3, i++, 1, 1);
        this._settings.bind('max-subject-width', maxSubjectWidth, 'value', Gio.SettingsBindFlags.DEFAULT);

        displayTab.attach(new Gtk.Label({ label: _('Minimum width of Menu Item (px)'), halign : Gtk.Align.END}), 0, i, 3, 1);
        let minMenuItemWidth = Gtk.SpinButton.new_with_range (400, 1100, 10);
        displayTab.attach(minMenuItemWidth, 3, i++, 1, 1);
        this._settings.bind('min-menu-item-width', minMenuItemWidth, 'value', Gio.SettingsBindFlags.DEFAULT);

        // Filters tab
        let filtersTab = new Gtk.Grid({row_spacing:10,column_spacing:10, margin:10});
        this.append_page(filtersTab,  new Gtk.Label({label: _('Filters')}));

        let filterHelp = _('Examples:') + '\n<i>status_id=1&amp;project_id=my-project</i>\n' +
            '<i>assigned_to_id=me&amp;status_id=open // You can add comments</i>\n' +
            _('More information:') + ' <a href="http://www.redmine.org/projects/redmine/wiki/Rest_Issues">Rest Issue</a>';
        filtersTab.attach(new Gtk.Label({label : filterHelp, use_markup : true, halign : Gtk.Align.START}), 0, 0, 1, 1);

        let filtersData = this._settings.get_strv('filters');
        this._filtersBuffer = new Gtk.TextBuffer({ text: filtersData.join('\n')});
        let filtersScroll = new Gtk.ScrolledWindow({expand : true, shadow_type: Gtk.ShadowType.ETCHED_IN});
        filtersScroll.add_with_viewport(new Gtk.TextView({buffer :  this._filtersBuffer}));
        this._filtersBuffer.connect('changed', Lang.bind(this, this._filtersChanged));
        filtersTab.attach(filtersScroll, 0, 1, 1, 1);

        filtersTab.attach(new Gtk.Label({ label: _('For check filter use:'), halign : Gtk.Align.START}), 0, 2, 1, 1);
        this._curlHelp = new Gtk.Entry({ hexpand: true, editable: false});
        filtersTab.attach(this._curlHelp, 0, 3, 1, 1);
        this._refreshCurlHelp();
    }

    _refreshCurlHelp(){
        let url = this._settings.get_string('redmine-url');
        let key = this._settings.get_string('api-access-key');
        if(url && url.slice(-1) != '/')
            url += '/';
        if(url && key) {
            this._curlHelp.text = 'curl -H "X-Redmine-API-Key: ' + key + '" ' + url +'issues.json?{Filter}';
        } else
            this._curlHelp.text = '';
    }

    _filtersChanged(){
         let text = this._filtersBuffer.text;
         let filtersData = [];
         if(text)
             filtersData = text.split('\n');
         this._settings.set_strv('filters', filtersData);
    }

    _addSwitch(params){
        params.tab.attach(new Gtk.Label({ label: params.label, halign : Gtk.Align.END}), params.x, params.y, 1, 1);
        let sw = new Gtk.Switch({halign : Gtk.Align.END, valign : Gtk.Align.CENTER});
        params.tab.attach(sw, params.x + 1, params.y, 1, 1);
        this._settings.bind(params.key, sw, 'active', Gio.SettingsBindFlags.DEFAULT);
    }

    _addComboBox(params){
        let model = new Gtk.ListStore();
        model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING]);

        let combobox = new Gtk.ComboBox({model: model});
        let renderer = new Gtk.CellRendererText();
        combobox.pack_start(renderer, true);
        combobox.add_attribute(renderer, 'text', 1);

        for(let k in params.items){
            model.set(model.append(), [0, 1], [k, params.items[k]]);
        }

        combobox.set_active(Object.keys(params.items).indexOf(this._settings.get_string(params.key)));

        combobox.connect('changed', Lang.bind(this, function(entry) {
            let [success, iter] = combobox.get_active_iter();
            if (!success)
                return;
            this._settings.set_string(params.key, model.get_value(iter, 0))
        }));

        params.tab.attach(new Gtk.Label({ label: params.label, halign : Gtk.Align.END}), params.x, params.y, 1, 1);
        params.tab.attach(combobox, params.x + 1, params.y, 1, 1);
    }

});

function buildPrefsWidget() {
    let w = new RedmineIssuesPrefsWidget();
    w.show_all();
    return w;
}
