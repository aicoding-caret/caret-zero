ncaught TypeError: Cannot read properties of null (reading 'classList')
    at index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:52:122
(anonymous) @ index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:52
The FetchEvent for "http://localhost:8097/" resulted in a network error response: the promise was rejected.
Promise.then
(anonymous) @ service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3
service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3 
        
        
       Uncaught (in promise) TypeError: Failed to fetch
    at d (service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3:5010)
d @ service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3
Promise.then
processLocalhostRequest @ service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3
await in processLocalhostRequest
(anonymous) @ service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3
index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1060 
        
        
       GET http://localhost:8097/ net::ERR_FAILED
(anonymous) @ index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1060
setTimeout
onFrameLoaded @ index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1058
(anonymous) @ index.html?id=c221c17f-9c68-4e65-9913-e91eceed5b65&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1089
index.html:1 [Deprecation] Custom state pseudo classes have been changed from ":--visual-viewport-height" to ":state(visual-viewport-height)". See more here: https://github.com/w3c/csswg-drafts/issues/4805
service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3 Unknown message
ExtensionStateContext.tsx:412 [Webview Context Test Revert] Sending webviewDidLaunch from separate useEffect.
chunk-RO7O33BN.js?v=c9f2dda1:16718 Uncaught TypeError: state.subscribeToStateUpdates is not a function
    at ExtensionStateContext.tsx:421:30
    at commitHookEffectListMount (chunk-RO7O33BN.js?v=c9f2dda1:16963:34)
    at commitPassiveMountOnFiber (chunk-RO7O33BN.js?v=c9f2dda1:18206:19)
    at commitPassiveMountEffects_complete (chunk-RO7O33BN.js?v=c9f2dda1:18179:17)
    at commitPassiveMountEffects_begin (chunk-RO7O33BN.js?v=c9f2dda1:18169:15)
    at commitPassiveMountEffects (chunk-RO7O33BN.js?v=c9f2dda1:18159:11)
    at flushPassiveEffectsImpl (chunk-RO7O33BN.js?v=c9f2dda1:19543:11)
    at flushPassiveEffects (chunk-RO7O33BN.js?v=c9f2dda1:19500:22)
    at chunk-RO7O33BN.js?v=c9f2dda1:19381:17
    at workLoop (chunk-RO7O33BN.js?v=c9f2dda1:197:42)
(anonymous) @ ExtensionStateContext.tsx:421
commitHookEffectListMount @ chunk-RO7O33BN.js?v=c9f2dda1:16963
commitPassiveMountOnFiber @ chunk-RO7O33BN.js?v=c9f2dda1:18206
commitPassiveMountEffects_complete @ chunk-RO7O33BN.js?v=c9f2dda1:18179
commitPassiveMountEffects_begin @ chunk-RO7O33BN.js?v=c9f2dda1:18169
commitPassiveMountEffects @ chunk-RO7O33BN.js?v=c9f2dda1:18159
flushPassiveEffectsImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19543
flushPassiveEffects @ chunk-RO7O33BN.js?v=c9f2dda1:19500
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:19381
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ExtensionStateContext.tsx:412 [Webview Context Test Revert] Sending webviewDidLaunch from separate useEffect.
chunk-RO7O33BN.js?v=c9f2dda1:16718 Uncaught TypeError: state.subscribeToStateUpdates is not a function
    at ExtensionStateContext.tsx:421:30
    at commitHookEffectListMount (chunk-RO7O33BN.js?v=c9f2dda1:16963:34)
    at invokePassiveEffectMountInDEV (chunk-RO7O33BN.js?v=c9f2dda1:18374:19)
    at invokeEffectsInDev (chunk-RO7O33BN.js?v=c9f2dda1:19754:19)
    at commitDoubleInvokeEffectsInDEV (chunk-RO7O33BN.js?v=c9f2dda1:19739:15)
    at flushPassiveEffectsImpl (chunk-RO7O33BN.js?v=c9f2dda1:19556:13)
    at flushPassiveEffects (chunk-RO7O33BN.js?v=c9f2dda1:19500:22)
    at chunk-RO7O33BN.js?v=c9f2dda1:19381:17
    at workLoop (chunk-RO7O33BN.js?v=c9f2dda1:197:42)
    at flushWork (chunk-RO7O33BN.js?v=c9f2dda1:176:22)
(anonymous) @ ExtensionStateContext.tsx:421
commitHookEffectListMount @ chunk-RO7O33BN.js?v=c9f2dda1:16963
invokePassiveEffectMountInDEV @ chunk-RO7O33BN.js?v=c9f2dda1:18374
invokeEffectsInDev @ chunk-RO7O33BN.js?v=c9f2dda1:19754
commitDoubleInvokeEffectsInDEV @ chunk-RO7O33BN.js?v=c9f2dda1:19739
flushPassiveEffectsImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19556
flushPassiveEffects @ chunk-RO7O33BN.js?v=c9f2dda1:19500
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:19381
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
2chunk-RO7O33BN.js?v=c9f2dda1:14080 The above error occurred in the <ExtensionStateContextProvider> component:

    at ExtensionStateContextProvider (http://localhost:25463/src/context/ExtensionStateContext.tsx:41:49)
    at App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ chunk-RO7O33BN.js?v=c9f2dda1:14080
update.callback @ chunk-RO7O33BN.js?v=c9f2dda1:14100
callCallback @ chunk-RO7O33BN.js?v=c9f2dda1:11296
commitUpdateQueue @ chunk-RO7O33BN.js?v=c9f2dda1:11313
commitLayoutEffectOnFiber @ chunk-RO7O33BN.js?v=c9f2dda1:17141
commitLayoutMountEffects_complete @ chunk-RO7O33BN.js?v=c9f2dda1:18030
commitLayoutEffects_begin @ chunk-RO7O33BN.js?v=c9f2dda1:18019
commitLayoutEffects @ chunk-RO7O33BN.js?v=c9f2dda1:17970
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19406
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18948
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
flushPassiveEffectsImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19559
flushPassiveEffects @ chunk-RO7O33BN.js?v=c9f2dda1:19500
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:19381
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
chunk-RO7O33BN.js?v=c9f2dda1:9176 Uncaught TypeError: state.subscribeToStateUpdates is not a function
    at ExtensionStateContext.tsx:421:30
    at commitHookEffectListMount (chunk-RO7O33BN.js?v=c9f2dda1:16963:34)
    at commitPassiveMountOnFiber (chunk-RO7O33BN.js?v=c9f2dda1:18206:19)
    at commitPassiveMountEffects_complete (chunk-RO7O33BN.js?v=c9f2dda1:18179:17)
    at commitPassiveMountEffects_begin (chunk-RO7O33BN.js?v=c9f2dda1:18169:15)
    at commitPassiveMountEffects (chunk-RO7O33BN.js?v=c9f2dda1:18159:11)
    at flushPassiveEffectsImpl (chunk-RO7O33BN.js?v=c9f2dda1:19543:11)
    at flushPassiveEffects (chunk-RO7O33BN.js?v=c9f2dda1:19500:22)
    at chunk-RO7O33BN.js?v=c9f2dda1:19381:17
    at workLoop (chunk-RO7O33BN.js?v=c9f2dda1:197:42)
(anonymous) @ ExtensionStateContext.tsx:421
commitHookEffectListMount @ chunk-RO7O33BN.js?v=c9f2dda1:16963
commitPassiveMountOnFiber @ chunk-RO7O33BN.js?v=c9f2dda1:18206
commitPassiveMountEffects_complete @ chunk-RO7O33BN.js?v=c9f2dda1:18179
commitPassiveMountEffects_begin @ chunk-RO7O33BN.js?v=c9f2dda1:18169
commitPassiveMountEffects @ chunk-RO7O33BN.js?v=c9f2dda1:18159
flushPassiveEffectsImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19543
flushPassiveEffects @ chunk-RO7O33BN.js?v=c9f2dda1:19500
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:19381
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3 Unknown message