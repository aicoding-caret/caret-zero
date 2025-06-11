import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { vscode } from "../utils/vscode";
import styled from "styled-components";
const PersonaSection = styled.div `
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--vscode-settings-headerBorder);
`;
const PolicyNotice = styled.div `
  background: var(--vscode-editorWidget-background);
  color: var(--vscode-descriptionForeground);
  font-size: 13px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  text-align: center;
`;
export default function PersonaSettingsView() {
    const [templateCharacters, setTemplateCharacters] = useState([]);
    useEffect(() => {
        // 템플릿 캐릭터 요청
        vscode.postMessage({ type: "requestTemplateCharacters" });
        const handler = (event) => {
            const { data } = event;
            console.log("[PersonaSettingsView] Received message:", data);
            if (data.type === "templateCharactersLoaded") {
                console.log("[PersonaSettingsView] templateCharactersLoaded message received", data);
                if (Array.isArray(data.characters)) {
                    console.log("[PersonaSettingsView] Setting template characters:", data.characters);
                    setTemplateCharacters(data.characters);
                }
                else if (data.text) {
                    try {
                        const parsedCharacters = JSON.parse(data.text);
                        console.log("[PersonaSettingsView] Parsed characters from text:", parsedCharacters);
                        if (Array.isArray(parsedCharacters)) {
                            setTemplateCharacters(parsedCharacters);
                        }
                    }
                    catch (err) {
                        console.error("[PersonaSettingsView] Failed to parse template characters:", err);
                    }
                }
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);
    return (_jsxs(PersonaSection, { children: [_jsx("h3", { children: "\uD37C\uC18C\uB098 \uAD00\uB9AC" }), _jsx(PolicyNotice, { children: "Caret \uD398\uB974\uC18C\uB098 \uAD00\uB9AC \uC2DC\uC2A4\uD15C (\uAC1C\uBC1C \uC911)" }), _jsxs("div", { children: [_jsxs("p", { children: ["\uD15C\uD50C\uB9BF \uCE90\uB9AD\uD130 \uC218: ", templateCharacters.length] }), _jsx(VSCodeButton, { onClick: () => {
                            console.log("페르소나 로드 요청");
                            vscode.postMessage({ type: "loadPersona" });
                        }, children: "\uD398\uB974\uC18C\uB098 \uB85C\uB4DC" }), _jsx(VSCodeButton, { onClick: () => {
                            console.log("템플릿 캐릭터 요청");
                            vscode.postMessage({ type: "requestTemplateCharacters" });
                        }, children: "\uD15C\uD50C\uB9BF \uCE90\uB9AD\uD130 \uC0C8\uB85C\uACE0\uCE68" })] })] }));
}
//# sourceMappingURL=PersonaSettingsView.js.map