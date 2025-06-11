/**
 * Converts VS Code native model format to protobuf format
 */
export function convertVsCodeNativeModelsToProtoModels(models) {
    return (models || []).map((model) => ({
        vendor: model.vendor || "",
        family: model.family || "",
        version: model.version || "",
        id: model.id || "",
    }));
}
//# sourceMappingURL=vscode-lm-models-conversion.js.map