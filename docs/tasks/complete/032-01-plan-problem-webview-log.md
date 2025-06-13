index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:52 Uncaught TypeError: Cannot read properties of null (reading 'classList')
    at index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:52:122
(anonymous) @ index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:52
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
index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1060 
        
        
       GET http://localhost:8097/ net::ERR_FAILED
(anonymous) @ index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1060
setTimeout
onFrameLoaded @ index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1058
(anonymous) @ index.html?id=83d2003b-2371-49f8-b59a-ab3f1fb09928&origin=bd5b9e9d-469b-421a-bde4-859c661589bb&swVersion=4&extensionId=caret.caret-dev&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView:1089
index.html:1 [Deprecation] Custom state pseudo classes have been changed from ":--visual-viewport-height" to ":state(visual-viewport-height)". See more here: https://github.com/w3c/csswg-drafts/issues/4805
service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3 Unknown message
ExtensionStateContext.tsx:412 [Webview Context Test Revert] Sending webviewDidLaunch from separate useEffect.
ExtensionStateContext.tsx:412 [Webview Context Test Revert] Sending webviewDidLaunch from separate useEffect.
ExtensionStateContext.tsx:172 [Webview Context Test Revert] Received direct 'state' message, updating state.
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14974
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14974
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-ejwLJJ" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14974
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:15024
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:15024
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-ivlMFI" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:15024
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
AutoApproveBar.tsx:87 Warning: Each child in a list should have a unique "key" prop.

Check the render method of `AutoApproveBar`. See https://reactjs.org/link/warning-keys for more information.
    at AutoApproveMenuItem (http://localhost:25463/src/components/chat/auto-approve-menu/AutoApproveMenuItem.tsx:78:32)
    at AutoApproveBar (http://localhost:25463/src/components/chat/auto-approve-menu/AutoApproveBar.tsx:30:27)
    at div
    at ChatView (http://localhost:25463/src/components/chat/ChatView.tsx:205:21)
    at AppContent (http://localhost:25463/src/App.tsx:44:159)
    at FirebaseAuthProvider (http://localhost:25463/src/context/FirebaseAuthContext.tsx:37:40)
    at ExtensionStateContextProvider (http://localhost:25463/src/context/ExtensionStateContext.tsx:41:49)
    at App
printWarning @ react_jsx-dev-runtime.js?v=c9f2dda1:64
error @ react_jsx-dev-runtime.js?v=c9f2dda1:48
validateExplicitKey @ react_jsx-dev-runtime.js?v=c9f2dda1:724
validateChildKeys @ react_jsx-dev-runtime.js?v=c9f2dda1:737
jsxWithValidation @ react_jsx-dev-runtime.js?v=c9f2dda1:846
AutoApproveBar @ AutoApproveBar.tsx:87
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
mountIndeterminateComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14974
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15962
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
styled-components.js?v=c9f2dda1:1257 styled-components: it looks like an unknown prop "isFavorited" is being sent through to the DOM, which will likely trigger a React console error. If you would like automatic filtering of unknown props, you can opt-into that behavior via `<StyleSheetManager shouldForwardProp={...}>` (connect an API like `@emotion/is-prop-valid`) or consider using transient props (`$` prefix for automatic filtering.)
(anonymous) @ styled-components.js?v=c9f2dda1:1257
O2 @ styled-components.js?v=c9f2dda1:1265
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateForwardRef @ chunk-RO7O33BN.js?v=c9f2dda1:14373
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15994
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
chunk-RO7O33BN.js?v=c9f2dda1:521 Warning: React does not recognize the `isFavorited` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `isfavorited` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
    at div
    at O2 (http://localhost:25463/node_modules/.vite/deps/styled-components.js?v=c9f2dda1:1265:6)
    at http://localhost:25463/node_modules/.vite/deps/@heroui_react.js?v=c9f2dda1:38891:7
    at HeroTooltip (http://localhost:25463/src/components/common/HeroTooltip.tsx:26:28)
    at div
    at O2 (http://localhost:25463/node_modules/.vite/deps/styled-components.js?v=c9f2dda1:1265:6)
    at AutoApproveMenuItem (http://localhost:25463/src/components/chat/auto-approve-menu/AutoApproveMenuItem.tsx:78:32)
    at div
    at div
    at div
    at AutoApproveBar (http://localhost:25463/src/components/chat/auto-approve-menu/AutoApproveBar.tsx:30:27)
    at div
    at ChatView (http://localhost:25463/src/components/chat/ChatView.tsx:205:21)
    at AppContent (http://localhost:25463/src/App.tsx:44:159)
    at FirebaseAuthProvider (http://localhost:25463/src/context/FirebaseAuthContext.tsx:37:40)
    at ExtensionStateContextProvider (http://localhost:25463/src/context/ExtensionStateContext.tsx:41:49)
    at App
printWarning @ chunk-RO7O33BN.js?v=c9f2dda1:521
error @ chunk-RO7O33BN.js?v=c9f2dda1:505
validateProperty$1 @ chunk-RO7O33BN.js?v=c9f2dda1:3433
warnUnknownProperties @ chunk-RO7O33BN.js?v=c9f2dda1:3465
validateProperties$2 @ chunk-RO7O33BN.js?v=c9f2dda1:3484
validatePropertiesInDevelopment @ chunk-RO7O33BN.js?v=c9f2dda1:7378
setInitialProperties @ chunk-RO7O33BN.js?v=c9f2dda1:7567
finalizeInitialChildren @ chunk-RO7O33BN.js?v=c9f2dda1:8392
completeWork @ chunk-RO7O33BN.js?v=c9f2dda1:16341
completeUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19277
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19259
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
styled-components.js?v=c9f2dda1:1257 styled-components: it looks like an unknown prop "isActive" is being sent through to the DOM, which will likely trigger a React console error. If you would like automatic filtering of unknown props, you can opt-into that behavior via `<StyleSheetManager shouldForwardProp={...}>` (connect an API like `@emotion/is-prop-valid`) or consider using transient props (`$` prefix for automatic filtering.)
(anonymous) @ styled-components.js?v=c9f2dda1:1257
O2 @ styled-components.js?v=c9f2dda1:1265
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateForwardRef @ chunk-RO7O33BN.js?v=c9f2dda1:14373
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15994
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
chunk-RO7O33BN.js?v=c9f2dda1:521 Warning: React does not recognize the `isActive` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `isactive` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
    at div
    at O2 (http://localhost:25463/node_modules/.vite/deps/styled-components.js?v=c9f2dda1:1265:6)
    at div
    at O2 (http://localhost:25463/node_modules/.vite/deps/styled-components.js?v=c9f2dda1:1265:6)
    at div
    at Tooltip (http://localhost:25463/src/components/common/Tooltip.tsx:49:20)
    at div
    at O2 (http://localhost:25463/node_modules/.vite/deps/styled-components.js?v=c9f2dda1:1265:6)
    at div
    at http://localhost:25463/src/components/chat/ChatTextArea.tsx:279:63
    at div
    at ChatView (http://localhost:25463/src/components/chat/ChatView.tsx:205:21)
    at AppContent (http://localhost:25463/src/App.tsx:44:159)
    at FirebaseAuthProvider (http://localhost:25463/src/context/FirebaseAuthContext.tsx:37:40)
    at ExtensionStateContextProvider (http://localhost:25463/src/context/ExtensionStateContext.tsx:41:49)
    at App
printWarning @ chunk-RO7O33BN.js?v=c9f2dda1:521
error @ chunk-RO7O33BN.js?v=c9f2dda1:505
validateProperty$1 @ chunk-RO7O33BN.js?v=c9f2dda1:3433
warnUnknownProperties @ chunk-RO7O33BN.js?v=c9f2dda1:3465
validateProperties$2 @ chunk-RO7O33BN.js?v=c9f2dda1:3484
validatePropertiesInDevelopment @ chunk-RO7O33BN.js?v=c9f2dda1:7378
setInitialProperties @ chunk-RO7O33BN.js?v=c9f2dda1:7567
finalizeInitialChildren @ chunk-RO7O33BN.js?v=c9f2dda1:8392
completeWork @ chunk-RO7O33BN.js?v=c9f2dda1:16341
completeUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19277
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19259
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
App.tsx:120 Extension state hydrated {alphaAvatarUri: 'https://file%2B.vscode-resource.vscode-cdn.net/d%3…ev/caret-zero/assets/agent_profile.png?d=20250612'}
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-ExNgL" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-eQmOcK" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
commitRootImpl @ chunk-RO7O33BN.js?v=c9f2dda1:19485
commitRoot @ chunk-RO7O33BN.js?v=c9f2dda1:19330
finishConcurrentRender @ chunk-RO7O33BN.js?v=c9f2dda1:18858
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18768
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
vscode-webview://0m44bme2o0fmnm6tc4ternrq85ib4rbihdq9pd9u7gq6rlnbt0dq/@fs/D:/dev/caret-zero/node_modules/@vscode/codicons/dist/codicon.ttf?38dcd33a732ebca5a557e04831e9e235:1 
        
        
       GET vscode-webview://0m44bme2o0fmnm6tc4ternrq85ib4rbihdq9pd9u7gq6rlnbt0dq/@fs/D:/dev/caret-zero/node_modules/@vscode/codicons/dist/codicon.ttf?38dcd33a732ebca5a557e04831e9e235 net::ERR_ACCESS_DENIED
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-eItdIZ" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-iUieEY" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ExtensionStateContext.tsx:172 [Webview Context Test Revert] Received direct 'state' message, updating state.
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-bdufgb" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
ChatView.tsx:946 The component Styled(Component) with the id of "sc-fpjgca" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performConcurrentWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18728
workLoop @ chunk-RO7O33BN.js?v=c9f2dda1:197
flushWork @ chunk-RO7O33BN.js?v=c9f2dda1:176
performWorkUntilDeadline @ chunk-RO7O33BN.js?v=c9f2dda1:384
service-worker.js?v=4&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&remoteAuthority=:3 Unknown message
FirebaseAuthContext.tsx:40 onAuthStateChanged user null
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-ewpYVB" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-iIeZRA" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-mFUby" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-cqNein" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-edLonQ" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.

P @ styled-components.js?v=c9f2dda1:754
it @ styled-components.js?v=c9f2dda1:1277
s2 @ styled-components.js?v=c9f2dda1:1306
ChatView @ ChatView.tsx:946
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14630
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2037
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:383 `useCustomCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.
useCustomCompareEffect @ react-use.js?v=c9f2dda1:1963
useDeepCompareEffect @ react-use.js?v=c9f2dda1:2040
ChatView @ ChatView.tsx:383
renderWithHooks @ chunk-RO7O33BN.js?v=c9f2dda1:11596
updateFunctionComponent @ chunk-RO7O33BN.js?v=c9f2dda1:14635
beginWork @ chunk-RO7O33BN.js?v=c9f2dda1:15972
beginWork$1 @ chunk-RO7O33BN.js?v=c9f2dda1:19806
performUnitOfWork @ chunk-RO7O33BN.js?v=c9f2dda1:19251
workLoopSync @ chunk-RO7O33BN.js?v=c9f2dda1:19190
renderRootSync @ chunk-RO7O33BN.js?v=c9f2dda1:19169
performSyncWorkOnRoot @ chunk-RO7O33BN.js?v=c9f2dda1:18927
flushSyncCallbacks @ chunk-RO7O33BN.js?v=c9f2dda1:9166
(anonymous) @ chunk-RO7O33BN.js?v=c9f2dda1:18677
ChatView.tsx:946 The component Styled(Component) with the id of "sc-ghSyuF" has been created dynamically.
You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.
See https://styled-components.com/docs/basics#define-styled-components-outside-of-the-render-method for more info.