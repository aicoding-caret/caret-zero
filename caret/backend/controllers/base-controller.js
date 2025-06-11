export class CaretController {
    context;
    postMessage;
    constructor(context, postMessage) {
        this.context = context;
        this.postMessage = postMessage;
    }
    log(message) {
        console.log(`[${this.constructor.name}] ${message}`);
    }
    error(message, error) {
        console.error(`[${this.constructor.name}] ${message}`, error);
    }
}
//# sourceMappingURL=base-controller.js.map