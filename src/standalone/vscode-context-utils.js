import * as fs from "fs";
export class SecretStore {
    data;
    _onDidChange = new EventEmitter();
    constructor(filepath) {
        this.data = new JsonKeyValueStore(filepath);
    }
    onDidChange = this._onDidChange.event;
    get(key) {
        return Promise.resolve(this.data.get(key));
    }
    store(key, value) {
        this.data.put(key, value);
        this._onDidChange.fire({ key });
        return Promise.resolve();
    }
    delete(key) {
        this.data.delete(key);
        this._onDidChange.fire({ key });
        return Promise.resolve();
    }
}
// Create a class that implements Memento interface with the required setKeysForSync method
export class MementoStore {
    data;
    constructor(filepath) {
        this.data = new JsonKeyValueStore(filepath);
    }
    keys() {
        return Array.from(this.data.keys());
    }
    get(key) {
        return this.data.get(key);
    }
    update(key, value) {
        this.data.put(key, value);
        return Promise.resolve();
    }
    setKeysForSync(_keys) {
        throw new Error("Method not implemented.");
    }
}
export class EventEmitter {
    listeners = [];
    event = (listener) => {
        this.listeners.push(listener);
        return {
            dispose: () => {
                const index = this.listeners.indexOf(listener);
                if (index !== -1) {
                    this.listeners.splice(index, 1);
                }
            },
        };
    };
    fire(data) {
        this.listeners.forEach((listener) => listener(data));
    }
}
/** A simple key-value store for secrets backed by a JSON file. This is not secure, and it is not thread-safe. */
export class JsonKeyValueStore {
    data = new Map();
    filePath;
    constructor(filePath) {
        this.filePath = filePath;
        this.load();
    }
    get(key) {
        return this.data.get(key);
    }
    put(key, value) {
        this.data.set(key, value);
        this.save();
    }
    delete(key) {
        this.data.delete(key);
        this.save();
    }
    keys() {
        return this.data.keys();
    }
    load() {
        if (fs.existsSync(this.filePath)) {
            const data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
            Object.entries(data).forEach(([k, v]) => {
                this.data.set(k, v);
            });
        }
    }
    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(Object.fromEntries(this.data), null, 2));
    }
}
/** This is not used in cline, none of the methods are implemented. */
export class EnvironmentVariableCollection {
    persistent = false;
    description = undefined;
    replace(_variable, _value, _options) {
        throw new Error("Method not implemented.");
    }
    append(_variable, _value, _options) {
        throw new Error("Method not implemented.");
    }
    prepend(_variable, _value, _options) {
        throw new Error("Method not implemented.");
    }
    get(_variable) {
        throw new Error("Method not implemented.");
    }
    forEach(_callback, _thisArg) {
        throw new Error("Method not implemented.");
    }
    delete(_variable) {
        throw new Error("Method not implemented.");
    }
    clear() {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator]() {
        throw new Error("Method not implemented.");
    }
    getScoped(_scope) {
        throw new Error("Method not implemented.");
    }
}
export function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
//# sourceMappingURL=vscode-context-utils.js.map