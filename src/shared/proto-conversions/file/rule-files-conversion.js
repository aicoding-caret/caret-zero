import { RuleFileRequest } from "../../proto/file";
// Helper for creating delete requests
export const DeleteRuleFileRequest = {
    create: (params) => {
        return RuleFileRequest.create({
            rulePath: params.rulePath,
            isGlobal: params.isGlobal,
            metadata: params.metadata,
            type: params.type,
        });
    },
};
// Helper for creating create requests
export const CreateRuleFileRequest = {
    create: (params) => {
        return RuleFileRequest.create({
            filename: params.filename,
            isGlobal: params.isGlobal,
            metadata: params.metadata,
            type: params.type,
        });
    },
};
//# sourceMappingURL=rule-files-conversion.js.map