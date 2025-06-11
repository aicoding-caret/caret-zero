import * as vscode from "vscode";
import { DEFAULT_CHAT_SETTINGS } from "@shared/ChatSettings";
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings";
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings";
/*
    Storage
    https://dev.to/kompotkot/how-to-use-secretstorage-in-your-vscode-extensions-2hco
    https://www.eliostruyf.com/devhack-code-extension-storage-options/
    */
// global
export async function updateGlobalState(context, key, value) {
    await context.globalState.update(key, value);
}
export async function getGlobalState(context, key) {
    return await context.globalState.get(key);
}
// secrets
export async function storeSecret(context, key, value) {
    if (value) {
        await context.secrets.store(key, value);
    }
    else {
        await context.secrets.delete(key);
    }
}
export async function getSecret(context, key) {
    return await context.secrets.get(key);
}
// workspace
export async function updateWorkspaceState(context, key, value) {
    await context.workspaceState.update(key, value);
}
export async function getWorkspaceState(context, key) {
    return await context.workspaceState.get(key);
}
export async function migratePlanActGlobalToWorkspaceStorage(context) {
    // Keys that were migrated from global storage to workspace storage
    const keysToMigrate = [
        // Core settings
        "apiProvider",
        "apiModelId",
        "thinkingBudgetTokens",
        "reasoningEffort",
        "chatSettings",
        "vsCodeLmModelSelector",
        // Provider-specific model keys
        "awsBedrockCustomSelected",
        "awsBedrockCustomModelBaseId",
        "openRouterModelId",
        "openRouterModelInfo",
        "openAiModelId",
        "openAiModelInfo",
        "ollamaModelId",
        "lmStudioModelId",
        "liteLlmModelId",
        "liteLlmModelInfo",
        "requestyModelId",
        "requestyModelInfo",
        "togetherModelId",
        "fireworksModelId",
        // Previous mode settings
        "previousModeApiProvider",
        "previousModeModelId",
        "previousModeModelInfo",
        "previousModeVsCodeLmModelSelector",
        "previousModeThinkingBudgetTokens",
        "previousModeReasoningEffort",
        "previousModeAwsBedrockCustomSelected",
        "previousModeAwsBedrockCustomModelBaseId",
    ];
    for (const key of keysToMigrate) {
        const globalValue = await getGlobalState(context, key);
        if (globalValue !== undefined) {
            const workspaceValue = await getWorkspaceState(context, key);
            if (workspaceValue === undefined) {
                await updateWorkspaceState(context, key, globalValue);
            }
            // Delete from global storage regardless of whether we copied it
            await updateGlobalState(context, key, undefined);
        }
    }
}
async function migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw) {
    const config = vscode.workspace.getConfiguration("cline");
    const mcpMarketplaceEnabled = config.get("mcpMarketplace.enabled");
    if (mcpMarketplaceEnabled !== undefined) {
        // Remove from VSCode configuration
        await config.update("mcpMarketplace.enabled", undefined, true);
        return !mcpMarketplaceEnabled;
    }
    return mcpMarketplaceEnabledRaw ?? true;
}
async function migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw) {
    const config = vscode.workspace.getConfiguration("cline");
    const enableCheckpoints = config.get("enableCheckpoints");
    if (enableCheckpoints !== undefined) {
        // Remove from VSCode configuration
        await config.update("enableCheckpoints", undefined, true);
        return enableCheckpoints;
    }
    return enableCheckpointsSettingRaw ?? true;
}
export async function getAllExtensionState(context) {
    const [isNewUser, apiKey, openRouterApiKey, clineApiKey, awsAccessKey, awsSecretKey, awsSessionToken, awsRegion, awsUseCrossRegionInference, awsBedrockUsePromptCache, awsBedrockEndpoint, awsProfile, awsUseProfile, vertexProjectId, vertexRegion, openAiBaseUrl, openAiApiKey, openAiHeaders, ollamaBaseUrl, ollamaApiOptionsCtxNum, lmStudioBaseUrl, anthropicBaseUrl, geminiApiKey, geminiBaseUrl, openAiNativeApiKey, deepSeekApiKey, requestyApiKey, togetherApiKey, qwenApiKey, doubaoApiKey, mistralApiKey, azureApiVersion, openRouterProviderSorting, lastShownAnnouncementId, customInstructions, taskHistory, autoApprovalSettings, browserSettings, liteLlmBaseUrl, liteLlmUsePromptCache, fireworksApiKey, fireworksModelMaxCompletionTokens, fireworksModelMaxTokens, userInfo, qwenApiLine, liteLlmApiKey, telemetrySetting, asksageApiKey, asksageApiUrl, xaiApiKey, sambanovaApiKey, cerebrasApiKey, nebiusApiKey, planActSeparateModelsSettingRaw, favoritedModelIds, globalClineRulesToggles, requestTimeoutMs, shellIntegrationTimeout, enableCheckpointsSettingRaw, mcpMarketplaceEnabledRaw, mcpResponsesCollapsedRaw, globalWorkflowToggles, terminalReuseEnabled,] = await Promise.all([
        getGlobalState(context, "isNewUser"),
        getSecret(context, "apiKey"),
        getSecret(context, "openRouterApiKey"),
        getSecret(context, "clineApiKey"),
        getSecret(context, "awsAccessKey"),
        getSecret(context, "awsSecretKey"),
        getSecret(context, "awsSessionToken"),
        getGlobalState(context, "awsRegion"),
        getGlobalState(context, "awsUseCrossRegionInference"),
        getGlobalState(context, "awsBedrockUsePromptCache"),
        getGlobalState(context, "awsBedrockEndpoint"),
        getGlobalState(context, "awsProfile"),
        getGlobalState(context, "awsUseProfile"),
        getGlobalState(context, "vertexProjectId"),
        getGlobalState(context, "vertexRegion"),
        getGlobalState(context, "openAiBaseUrl"),
        getSecret(context, "openAiApiKey"),
        getGlobalState(context, "openAiHeaders"),
        getGlobalState(context, "ollamaBaseUrl"),
        getGlobalState(context, "ollamaApiOptionsCtxNum"),
        getGlobalState(context, "lmStudioBaseUrl"),
        getGlobalState(context, "anthropicBaseUrl"),
        getSecret(context, "geminiApiKey"),
        getGlobalState(context, "geminiBaseUrl"),
        getSecret(context, "openAiNativeApiKey"),
        getSecret(context, "deepSeekApiKey"),
        getSecret(context, "requestyApiKey"),
        getSecret(context, "togetherApiKey"),
        getSecret(context, "qwenApiKey"),
        getSecret(context, "doubaoApiKey"),
        getSecret(context, "mistralApiKey"),
        getGlobalState(context, "azureApiVersion"),
        getGlobalState(context, "openRouterProviderSorting"),
        getGlobalState(context, "lastShownAnnouncementId"),
        getGlobalState(context, "customInstructions"),
        getGlobalState(context, "taskHistory"),
        getGlobalState(context, "autoApprovalSettings"),
        getGlobalState(context, "browserSettings"),
        getGlobalState(context, "liteLlmBaseUrl"),
        getGlobalState(context, "liteLlmUsePromptCache"),
        getSecret(context, "fireworksApiKey"),
        getGlobalState(context, "fireworksModelMaxCompletionTokens"),
        getGlobalState(context, "fireworksModelMaxTokens"),
        getGlobalState(context, "userInfo"),
        getGlobalState(context, "qwenApiLine"),
        getSecret(context, "liteLlmApiKey"),
        getGlobalState(context, "telemetrySetting"),
        getSecret(context, "asksageApiKey"),
        getGlobalState(context, "asksageApiUrl"),
        getSecret(context, "xaiApiKey"),
        getSecret(context, "sambanovaApiKey"),
        getSecret(context, "cerebrasApiKey"),
        getSecret(context, "nebiusApiKey"),
        getGlobalState(context, "planActSeparateModelsSetting"),
        getGlobalState(context, "favoritedModelIds"),
        getGlobalState(context, "globalClineRulesToggles"),
        getGlobalState(context, "requestTimeoutMs"),
        getGlobalState(context, "shellIntegrationTimeout"),
        getGlobalState(context, "enableCheckpointsSetting"),
        getGlobalState(context, "mcpMarketplaceEnabled"),
        getGlobalState(context, "mcpResponsesCollapsed"),
        getGlobalState(context, "globalWorkflowToggles"),
        getGlobalState(context, "terminalReuseEnabled"),
    ]);
    const localClineRulesToggles = (await getWorkspaceState(context, "localClineRulesToggles"));
    const [chatSettings, storedApiProvider, apiModelId, thinkingBudgetTokens, reasoningEffort, vsCodeLmModelSelector, awsBedrockCustomSelected, awsBedrockCustomModelBaseId, openRouterModelId, openRouterModelInfo, openAiModelId, openAiModelInfo, ollamaModelId, lmStudioModelId, liteLlmModelId, liteLlmModelInfo, requestyModelId, requestyModelInfo, togetherModelId, fireworksModelId, previousModeApiProvider, previousModeModelId, previousModeModelInfo, previousModeVsCodeLmModelSelector, previousModeThinkingBudgetTokens, previousModeReasoningEffort, previousModeAwsBedrockCustomSelected, previousModeAwsBedrockCustomModelBaseId,] = await Promise.all([
        getWorkspaceState(context, "chatSettings"),
        getWorkspaceState(context, "apiProvider"),
        getWorkspaceState(context, "apiModelId"),
        getWorkspaceState(context, "thinkingBudgetTokens"),
        getWorkspaceState(context, "reasoningEffort"),
        getWorkspaceState(context, "vsCodeLmModelSelector"),
        getWorkspaceState(context, "awsBedrockCustomSelected"),
        getWorkspaceState(context, "awsBedrockCustomModelBaseId"),
        getWorkspaceState(context, "openRouterModelId"),
        getWorkspaceState(context, "openRouterModelInfo"),
        getWorkspaceState(context, "openAiModelId"),
        getWorkspaceState(context, "openAiModelInfo"),
        getWorkspaceState(context, "ollamaModelId"),
        getWorkspaceState(context, "lmStudioModelId"),
        getWorkspaceState(context, "liteLlmModelId"),
        getWorkspaceState(context, "liteLlmModelInfo"),
        getWorkspaceState(context, "requestyModelId"),
        getWorkspaceState(context, "requestyModelInfo"),
        getWorkspaceState(context, "togetherModelId"),
        getWorkspaceState(context, "fireworksModelId"),
        getWorkspaceState(context, "previousModeApiProvider"),
        getWorkspaceState(context, "previousModeModelId"),
        getWorkspaceState(context, "previousModeModelInfo"),
        getWorkspaceState(context, "previousModeVsCodeLmModelSelector"),
        getWorkspaceState(context, "previousModeThinkingBudgetTokens"),
        getWorkspaceState(context, "previousModeReasoningEffort"),
        getWorkspaceState(context, "previousModeAwsBedrockCustomSelected"),
        getWorkspaceState(context, "previousModeAwsBedrockCustomModelBaseId"),
    ]);
    let apiProvider;
    if (storedApiProvider) {
        apiProvider = storedApiProvider;
    }
    else {
        // Either new user or legacy user that doesn't have the apiProvider stored in state
        // (If they're using OpenRouter or Bedrock, then apiProvider state will exist)
        if (apiKey) {
            apiProvider = "anthropic";
        }
        else {
            // New users should default to openrouter, since they've opted to use an API key instead of signing in
            apiProvider = "openrouter";
        }
    }
    const mcpMarketplaceEnabled = await migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw);
    const enableCheckpointsSetting = await migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw);
    const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false;
    // Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
    // On win11 state sometimes initializes as empty string instead of undefined
    let planActSeparateModelsSetting = undefined;
    if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
        planActSeparateModelsSetting = planActSeparateModelsSettingRaw;
    }
    else {
        // default to true for existing users
        if (storedApiProvider) {
            planActSeparateModelsSetting = true;
        }
        else {
            // default to false for new users
            planActSeparateModelsSetting = false;
        }
        // this is a special case where it's a new state, but we want it to default to different values for existing and new users.
        // persist so next time state is retrieved it's set to the correct value.
        await updateGlobalState(context, "planActSeparateModelsSetting", planActSeparateModelsSetting);
    }
    return {
        apiConfiguration: {
            apiProvider,
            apiModelId,
            apiKey,
            openRouterApiKey,
            clineApiKey,
            awsAccessKey,
            awsSecretKey,
            awsSessionToken,
            awsRegion,
            awsUseCrossRegionInference,
            awsBedrockUsePromptCache,
            awsBedrockEndpoint,
            awsProfile,
            awsUseProfile,
            awsBedrockCustomSelected,
            awsBedrockCustomModelBaseId,
            vertexProjectId,
            vertexRegion,
            openAiBaseUrl,
            openAiApiKey,
            openAiModelId,
            openAiModelInfo,
            openAiHeaders: openAiHeaders || {},
            ollamaModelId,
            ollamaBaseUrl,
            ollamaApiOptionsCtxNum,
            lmStudioModelId,
            lmStudioBaseUrl,
            anthropicBaseUrl,
            geminiApiKey,
            geminiBaseUrl,
            openAiNativeApiKey,
            deepSeekApiKey,
            requestyApiKey,
            requestyModelId,
            requestyModelInfo,
            togetherApiKey,
            togetherModelId,
            qwenApiKey,
            qwenApiLine,
            doubaoApiKey,
            mistralApiKey,
            azureApiVersion,
            openRouterModelId,
            openRouterModelInfo,
            openRouterProviderSorting,
            vsCodeLmModelSelector,
            thinkingBudgetTokens,
            reasoningEffort,
            liteLlmBaseUrl,
            liteLlmModelId,
            liteLlmModelInfo,
            liteLlmApiKey,
            liteLlmUsePromptCache,
            fireworksApiKey,
            fireworksModelId,
            fireworksModelMaxCompletionTokens,
            fireworksModelMaxTokens,
            asksageApiKey,
            asksageApiUrl,
            xaiApiKey,
            sambanovaApiKey,
            cerebrasApiKey,
            nebiusApiKey,
            favoritedModelIds,
            requestTimeoutMs,
        },
        isNewUser: isNewUser ?? true,
        lastShownAnnouncementId,
        customInstructions,
        taskHistory,
        autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS, // default value can be 0 or empty string
        globalClineRulesToggles: globalClineRulesToggles || {},
        localClineRulesToggles: localClineRulesToggles || {},
        browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings }, // this will ensure that older versions of browserSettings (e.g. before remoteBrowserEnabled was added) are merged with the default values (false for remoteBrowserEnabled)
        chatSettings: {
            ...DEFAULT_CHAT_SETTINGS, // Apply defaults first
            ...(chatSettings || {}), // Spread fetched chatSettings, which includes preferredLanguage, and openAIReasoningEffort
        },
        userInfo,
        previousModeApiProvider,
        previousModeModelId,
        previousModeModelInfo,
        previousModeVsCodeLmModelSelector,
        previousModeThinkingBudgetTokens,
        previousModeReasoningEffort,
        previousModeAwsBedrockCustomSelected,
        previousModeAwsBedrockCustomModelBaseId,
        mcpMarketplaceEnabled: mcpMarketplaceEnabled,
        mcpResponsesCollapsed: mcpResponsesCollapsed,
        telemetrySetting: telemetrySetting || "unset",
        planActSeparateModelsSetting,
        enableCheckpointsSetting: enableCheckpointsSetting,
        shellIntegrationTimeout: shellIntegrationTimeout || 4000,
        terminalReuseEnabled: terminalReuseEnabled ?? true,
        globalWorkflowToggles: globalWorkflowToggles || {},
    };
}
export async function updateApiConfiguration(context, apiConfiguration) {
    const { apiProvider, apiModelId, apiKey, openRouterApiKey, awsAccessKey, awsSecretKey, awsSessionToken, awsRegion, awsUseCrossRegionInference, awsBedrockUsePromptCache, awsBedrockEndpoint, awsProfile, awsUseProfile, awsBedrockCustomSelected, awsBedrockCustomModelBaseId, vertexProjectId, vertexRegion, openAiBaseUrl, openAiApiKey, openAiModelId, openAiModelInfo, openAiHeaders, ollamaModelId, ollamaBaseUrl, ollamaApiOptionsCtxNum, lmStudioModelId, lmStudioBaseUrl, anthropicBaseUrl, geminiApiKey, geminiBaseUrl, openAiNativeApiKey, deepSeekApiKey, requestyApiKey, requestyModelId, requestyModelInfo, togetherApiKey, togetherModelId, qwenApiKey, doubaoApiKey, mistralApiKey, azureApiVersion, openRouterModelId, openRouterModelInfo, openRouterProviderSorting, vsCodeLmModelSelector, liteLlmBaseUrl, liteLlmModelId, liteLlmModelInfo, liteLlmApiKey, liteLlmUsePromptCache, qwenApiLine, asksageApiKey, asksageApiUrl, xaiApiKey, thinkingBudgetTokens, reasoningEffort, clineApiKey, sambanovaApiKey, cerebrasApiKey, nebiusApiKey, favoritedModelIds, fireworksApiKey, fireworksModelId, fireworksModelMaxCompletionTokens, fireworksModelMaxTokens, } = apiConfiguration;
    // Workspace state updates
    await updateWorkspaceState(context, "apiProvider", apiProvider);
    await updateWorkspaceState(context, "apiModelId", apiModelId);
    await updateWorkspaceState(context, "thinkingBudgetTokens", thinkingBudgetTokens);
    await updateWorkspaceState(context, "reasoningEffort", reasoningEffort);
    await updateWorkspaceState(context, "vsCodeLmModelSelector", vsCodeLmModelSelector);
    await updateWorkspaceState(context, "awsBedrockCustomSelected", awsBedrockCustomSelected);
    await updateWorkspaceState(context, "awsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId);
    await updateWorkspaceState(context, "openRouterModelId", openRouterModelId);
    await updateWorkspaceState(context, "openRouterModelInfo", openRouterModelInfo);
    await updateWorkspaceState(context, "openAiModelId", openAiModelId);
    await updateWorkspaceState(context, "openAiModelInfo", openAiModelInfo);
    await updateWorkspaceState(context, "ollamaModelId", ollamaModelId);
    await updateWorkspaceState(context, "lmStudioModelId", lmStudioModelId);
    await updateWorkspaceState(context, "liteLlmModelId", liteLlmModelId);
    await updateWorkspaceState(context, "liteLlmModelInfo", liteLlmModelInfo);
    await updateWorkspaceState(context, "requestyModelId", requestyModelId);
    await updateWorkspaceState(context, "requestyModelInfo", requestyModelInfo);
    await updateWorkspaceState(context, "togetherModelId", togetherModelId);
    await updateWorkspaceState(context, "fireworksModelId", fireworksModelId);
    // Global state updates
    await updateGlobalState(context, "awsRegion", awsRegion);
    await updateGlobalState(context, "awsUseCrossRegionInference", awsUseCrossRegionInference);
    await updateGlobalState(context, "awsBedrockUsePromptCache", awsBedrockUsePromptCache);
    await updateGlobalState(context, "awsBedrockEndpoint", awsBedrockEndpoint);
    await updateGlobalState(context, "awsProfile", awsProfile);
    await updateGlobalState(context, "awsUseProfile", awsUseProfile);
    await updateGlobalState(context, "vertexProjectId", vertexProjectId);
    await updateGlobalState(context, "vertexRegion", vertexRegion);
    await updateGlobalState(context, "openAiBaseUrl", openAiBaseUrl);
    await updateGlobalState(context, "openAiHeaders", openAiHeaders || {});
    await updateGlobalState(context, "ollamaBaseUrl", ollamaBaseUrl);
    await updateGlobalState(context, "ollamaApiOptionsCtxNum", ollamaApiOptionsCtxNum);
    await updateGlobalState(context, "lmStudioBaseUrl", lmStudioBaseUrl);
    await updateGlobalState(context, "anthropicBaseUrl", anthropicBaseUrl);
    await updateGlobalState(context, "geminiBaseUrl", geminiBaseUrl);
    await updateGlobalState(context, "azureApiVersion", azureApiVersion);
    await updateGlobalState(context, "openRouterProviderSorting", openRouterProviderSorting);
    await updateGlobalState(context, "liteLlmBaseUrl", liteLlmBaseUrl);
    await updateGlobalState(context, "liteLlmUsePromptCache", liteLlmUsePromptCache);
    await updateGlobalState(context, "qwenApiLine", qwenApiLine);
    await updateGlobalState(context, "asksageApiUrl", asksageApiUrl);
    await updateGlobalState(context, "favoritedModelIds", favoritedModelIds);
    await updateGlobalState(context, "requestTimeoutMs", apiConfiguration.requestTimeoutMs);
    await updateGlobalState(context, "fireworksModelMaxCompletionTokens", fireworksModelMaxCompletionTokens);
    await updateGlobalState(context, "fireworksModelMaxTokens", fireworksModelMaxTokens);
    // Secret updates
    await storeSecret(context, "apiKey", apiKey);
    await storeSecret(context, "openRouterApiKey", openRouterApiKey);
    await storeSecret(context, "clineApiKey", clineApiKey);
    await storeSecret(context, "awsAccessKey", awsAccessKey);
    await storeSecret(context, "awsSecretKey", awsSecretKey);
    await storeSecret(context, "awsSessionToken", awsSessionToken);
    await storeSecret(context, "openAiApiKey", openAiApiKey);
    await storeSecret(context, "geminiApiKey", geminiApiKey);
    await storeSecret(context, "openAiNativeApiKey", openAiNativeApiKey);
    await storeSecret(context, "deepSeekApiKey", deepSeekApiKey);
    await storeSecret(context, "requestyApiKey", requestyApiKey);
    await storeSecret(context, "togetherApiKey", togetherApiKey);
    await storeSecret(context, "qwenApiKey", qwenApiKey);
    await storeSecret(context, "doubaoApiKey", doubaoApiKey);
    await storeSecret(context, "mistralApiKey", mistralApiKey);
    await storeSecret(context, "liteLlmApiKey", liteLlmApiKey);
    await storeSecret(context, "fireworksApiKey", fireworksApiKey);
    await storeSecret(context, "asksageApiKey", asksageApiKey);
    await storeSecret(context, "xaiApiKey", xaiApiKey);
    await storeSecret(context, "sambanovaApiKey", sambanovaApiKey);
    await storeSecret(context, "cerebrasApiKey", cerebrasApiKey);
    await storeSecret(context, "nebiusApiKey", nebiusApiKey);
}
export async function resetExtensionState(context) {
    for (const key of context.globalState.keys()) {
        await context.globalState.update(key, undefined);
    }
    const secretKeys = [
        "apiKey",
        "openRouterApiKey",
        "awsAccessKey",
        "awsSecretKey",
        "awsSessionToken",
        "openAiApiKey",
        "geminiApiKey",
        "openAiNativeApiKey",
        "deepSeekApiKey",
        "requestyApiKey",
        "togetherApiKey",
        "qwenApiKey",
        "doubaoApiKey",
        "mistralApiKey",
        "clineApiKey",
        "liteLlmApiKey",
        "fireworksApiKey",
        "asksageApiKey",
        "xaiApiKey",
        "sambanovaApiKey",
        "cerebrasApiKey",
        "nebiusApiKey",
    ];
    for (const key of secretKeys) {
        await storeSecret(context, key, undefined);
    }
}
//# sourceMappingURL=state.js.map