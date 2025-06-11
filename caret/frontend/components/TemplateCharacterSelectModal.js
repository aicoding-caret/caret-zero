import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
export default function TemplateCharacterSelectModal({ characters, language, open, onSelect, onClose }) {
    if (!open)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                backgroundColor: 'var(--vscode-editor-background)',
                padding: '20px',
                borderRadius: '4px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto'
            }, children: [_jsx("h3", { children: "\uD15C\uD50C\uB9BF \uCE90\uB9AD\uD130 \uC120\uD0DD" }), _jsx("div", { style: { marginBottom: '20px' }, children: characters.map((character) => (_jsxs("div", { style: {
                            border: '1px solid var(--vscode-settings-headerBorder)',
                            margin: '10px 0',
                            padding: '10px',
                            borderRadius: '4px'
                        }, children: [_jsx("h4", { children: character.name }), _jsx("p", { children: character.description }), _jsx(VSCodeButton, { onClick: () => onSelect(character), appearance: "primary", children: "\uC120\uD0DD" })] }, character.id))) }), _jsx("div", { style: { textAlign: 'right' }, children: _jsx(VSCodeButton, { onClick: onClose, children: "\uB2EB\uAE30" }) })] }) }));
}
//# sourceMappingURL=TemplateCharacterSelectModal.js.map