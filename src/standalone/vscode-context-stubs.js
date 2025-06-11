import { log } from "./utils";
const outputChannel = {
    append: (text) => process.stdout.write(text),
    appendLine: (line) => console.log(`OUTPUT_CHANNEL: ${line}`),
    clear: () => { },
    show: () => { },
    hide: () => { },
    dispose: () => { },
    name: "",
    replace: function (value) { },
};
function postMessage(message) {
    log("postMessage stub called:", JSON.stringify(message).slice(0, 200));
    return Promise.resolve(true);
}
export { outputChannel, postMessage };
//# sourceMappingURL=vscode-context-stubs.js.map