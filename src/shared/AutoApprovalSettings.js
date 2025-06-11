export const DEFAULT_AUTO_APPROVAL_SETTINGS = {
    version: 1,
    enabled: true,
    actions: {
        readFiles: true,
        readFilesExternally: false,
        editFiles: false,
        editFilesExternally: false,
        executeSafeCommands: true,
        executeAllCommands: false,
        useBrowser: false,
        useMcp: false,
    },
    maxRequests: 20,
    enableNotifications: false,
    favorites: ["enableAutoApprove", "readFiles", "editFiles"],
};
//# sourceMappingURL=AutoApprovalSettings.js.map