// template storage

var TemplateStorage = {
    set: function (data, callback) {
        chrome.storage.local.set(data, callback);
    },
    get: function (k, callback) {
        chrome.storage.local.get(k, callback);
    },
    remove: function (k, callback) {
        chrome.storage.local.remove(k, callback);
    },
    clear: function (callback) {
        chrome.storage.local.clear(callback);
    }
};

// Settings
var _localStorageSettings = {
    get: function (key, def, callback) {
        if (key in window.localStorage && window.localStorage[key] !== '') {
            return callback(JSON.parse(window.localStorage[key]));
        } else {
            if (!def) { // return the default in the Settings
                return callback(Settings.defaults[key]);
            } else {
                // return the supplied default
                return callback(def);
            }
        }
    },
    set: function (key, value, callback) {
        if (_.isEqual(value, Settings.defaults[key])) {
            return callback(this.clear(key));
        } else {
            window.localStorage[key] = JSON.stringify(value);
            return callback(window.localStorage[key]);
        }
    },
    clear: function (key) {
        return delete window.localStorage[key];
    }
};

var _chromeStorageSettings = {
    get: function (key, def, callback) {
        chrome.storage.sync.get(key, function (data) {
            if (chrome.runtime.lastError || _.isEmpty(data)) {
                if (!def) {
                    return callback(Settings.defaults[key]);
                } else {
                    return callback(def);
                }
            } else {
                return callback(data[key]);
            }
        });
    },
    set: function (key, value, callback) {
        var data = {};
        data[key] = value;

        chrome.storage.sync.set(data, function () {
            chrome.storage.sync.get(key, function (data) {
                return callback(data);
            });
        });
    }
};

var Settings = {
    get: function (key, def, callback) {
        if (chrome && chrome.storage) {
            return _chromeStorageSettings.get(key, def, callback);
        } else {
            return _localStorageSettings.get(key, def, callback);
        }
    },
    set: function (key, value, callback) {
        if (chrome && chrome.storage) {
            return _chromeStorageSettings.set(key, value, callback);
        } else {
            return _localStorageSettings.set(key, value, callback);
        }
    },
    defaults: {
        baseURL: "https://gorgias.io/",
        //baseURL: "http://localhost:5000/",
        apiBaseURL: "https://gorgias.io/api/1/",
        //apiBaseURL: "http://localhost:5000/api/1/",

        settings: { // settings for the settings view
            dialog: {
                enabled: true,
                shortcut: 'ctrl+space', // shortcut that triggers the complete dialog
                auto: false, //trigger automatically while typing - should be disabled cause it's annoying sometimes
                delay: 1000, // if we want to trigger it automatically
                limit: 100 // how many templates are shown in the dialog
            },
            qaBtn: {
                enabled: true,
                shownPostInstall: false,
                caseSensitiveSearch: false,
                fuzzySearch: true
            },
            keyboard: {
                enabled: true,
                shortcut: 'tab'
            },
            stats: {
                enabled: true  // send anonymous statistics
            },
            blacklist: [],
            fields: {
                tags: false,
                subject: true
            },
            editor: {
                enabled: true // new editor - enable for new users
            },
            sidebar: { // this sidebar to the right
                enabled: true,
                url: ""
            },
            suggestions: { // automatic suggestions from the server
                enabled: true
            }
        },
        // refactor this into 'local' and 'remote'
        isLoggedIn: false,
        syncEnabled: false,
        words: 0,
        syncedWords: 0,
        lastStatsSync: null,
        lastSync: null,
        hints: {
            postInstall: true,
            subscribeHint: true
        }
    }
};
