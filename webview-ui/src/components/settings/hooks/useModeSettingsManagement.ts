import { useState, useEffect, useCallback, useRef } from "react";
import { vscode } from "../../../utils/vscode";
import { WebviewMessage } from "../../../../../src/shared/WebviewMessage";
import { ModeSettingsData } from "../mode_settings_ui/ModeTabContent"; // Import shared type
import { useExtensionState } from "../../../context/ExtensionStateContext"; // To get availableModes for sync

// Define the structure for the entire modes configuration
interface ModesConfig {
  modes: Array<{
    id: string;
    name: string;
    description: string;
    rules: string[];
  }>;
}

// Type for the state managed by this hook
type ModeSettingsState = { [key: string]: ModeSettingsData };

// 기본 모드 설정 (초기 로딩 시 사용)
const defaultModeSettings: ModeSettingsState = {
  arch: {
    name: "Arch",
    description: "Caret Architect: Technical strategy & design",
    rules: [
      "Act as a Caret architect.",
      "Discuss Caret technical strategy & system design.",
      "Analyze requirements for Caret architecture.",
      "Evaluate external tech integration for Caret.",
      "Consider upstream (Caret) architectural implications.",
    ],
  },
  dev: {
    name: "Dev",
    description: "Caret Developer: Implementation & debugging",
    rules: [
      "Act as a Caret developer.",
      "Focus on implementation details and code quality.",
      "Debug issues and suggest practical solutions.",
      "Consider performance and maintainability.",
      "Provide code examples and implementation guidance.",
    ],
  },
  rule: {
    name: "Rule",
    description: "AI 시스템 규칙 최적화 및 프롬프트 엔지니어링 모드",
    rules: [
      "AI 시스템 규칙 최적화에 집중합니다.",
      "프롬프트 엔지니어링 관점에서 조언합니다.",
      "규칙 설계와 최적화 방법을 제안합니다.",
      "AI 동작 원리와 규칙 간의 관계를 설명합니다.",
    ],
  },
  talk: {
    name: "Talk",
    description: "Casual conversation mode",
    rules: [
      "Engage in casual conversation.",
      "Be friendly and conversational.",
      "Respond in a natural, human-like manner.",
      "Feel free to share opinions and preferences.",
    ],
  },
  custom: {
    name: "Custom",
    description: "Custom mode with user-defined behavior",
    rules: [
      "This is a custom mode you can configure.",
      "Add your own rules and behaviors here.",
      "Customize this mode for your specific needs.",
    ],
  },
};

export const useModeSettingsManagement = () => {
  const { availableModes } = useExtensionState(); // Get availableModes for syncing

  // 초기 상태를 defaultModeSettings로 설정하여 로딩 중에도 UI가 표시되도록 함
  const [modeSettings, setModeSettings] = useState<ModeSettingsState>(defaultModeSettings);
  const [initialModeSettings, setInitialModeSettings] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // 초기 로딩 상태를 false로 설정

  // 중복 호출 방지용 ref
  const hasRequestedConfig = useRef(false);
  // 메시지 수신 처리를 위한 ref
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  // 전역 메시지 핸들러 추가
  useEffect(() => {
    const handleGlobalMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("[useModeSettingsManagement:Global] Received message:", message?.type);
      
      if (message?.type === "modesConfigLoaded" && message.text) {
        console.log("[useModeSettingsManagement:Global] Processing modesConfigLoaded");
        try {
          const modesData: ModesConfig = JSON.parse(message.text);
          if (modesData?.modes && Array.isArray(modesData.modes)) {
            const loadedSettings: ModeSettingsState = {};
            modesData.modes.forEach((mode) => {
              if (mode.id) {
                loadedSettings[mode.id] = {
                  name: mode.name || mode.id,
                  description: mode.description || "",
                  rules: Array.isArray(mode.rules) ? mode.rules : [],
                };
              }
            });
            console.log("[useModeSettingsManagement:Global] Parsed settings:", Object.keys(loadedSettings));
            
            // 기존 defaultModeSettings와 로드된 설정을 병합
            const mergedSettings = { ...defaultModeSettings, ...loadedSettings };
            setModeSettings(mergedSettings);
            setInitialModeSettings(JSON.stringify(mergedSettings));
            setIsLoading(false);
            console.log("[useModeSettingsManagement:Global] Settings loaded and applied");
          }
        } catch (error) {
          console.error("[useModeSettingsManagement:Global] Error parsing settings:", error);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener("message", handleGlobalMessage);
    return () => {
      window.removeEventListener("message", handleGlobalMessage);
    };
  }, []);

  // Effect for loading initial settings from modes.json
  useEffect(() => {
    if (hasRequestedConfig.current) {
      return;
    }
    hasRequestedConfig.current = true;
    setIsLoading(true);
    console.log("[useModeSettingsManagement] Initial load effect triggered. Requesting modes config...");
    const loadConfigMessage: WebviewMessage = { type: "loadModesConfig" };
    vscode.postMessage(loadConfigMessage);

    // 메시지 수신 핸들러 정의
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log("[useModeSettingsManagement] Received message:", message.type);
      
      if (message.type === "modesConfigLoaded" && message.text) {
        console.log("[useModeSettingsManagement] Received modesConfigLoaded:", message.text.substring(0, 100) + "...");
        try {
          const modesData: ModesConfig = JSON.parse(message.text);
          if (modesData?.modes && Array.isArray(modesData.modes)) {
            const loadedSettings: ModeSettingsState = {};
            modesData.modes.forEach((mode) => {
              if (mode.id) {
                loadedSettings[mode.id] = {
                  name: mode.name || mode.id,
                  description: mode.description || "",
                  rules: Array.isArray(mode.rules) ? mode.rules : [],
                };
              }
            });
            console.log("[useModeSettingsManagement] Parsed settings:", loadedSettings);
            
            // 기존 defaultModeSettings와 로드된 설정을 병합
            const mergedSettings = { ...defaultModeSettings, ...loadedSettings };
            setModeSettings(mergedSettings);
            setInitialModeSettings(JSON.stringify(mergedSettings)); // Store initial state after loading
            console.log("[useModeSettingsManagement] Initial settings loaded and stored.");
          }
        } catch (error) {
          console.error("[useModeSettingsManagement] Error loading/parsing mode settings:", error);
          // Handle error state if necessary
        } finally {
           setIsLoading(false); // Set loading to false after processing
        }
      }
    };

    // 메시지 리스너 등록
    messageHandlerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);
    
    // 컴포넌트 언마운트 시에만 cleanup
    return () => {
      console.log("[useModeSettingsManagement] Cleaning up message listener.");
      if (messageHandlerRef.current) {
        window.removeEventListener("message", messageHandlerRef.current);
        messageHandlerRef.current = null;
      }
    };
  }, []); // Run only once on mount

  // Effect for syncing with availableModes from ExtensionState (e.g., if modes are added/removed externally)
  // This might need adjustment based on how availableModes is intended to interact with modes.json
  useEffect(() => {
    console.log("[useModeSettingsManagement] availableModes changed:", availableModes);
    if (Array.isArray(availableModes) && availableModes.length > 0 && !isLoading) { // Only sync if not currently loading initial data
        // Example sync logic: Ensure all availableModes exist in modeSettings, add if missing
        // This assumes modes.json is the primary source, and availableModes reflects the *currently active* set
        setModeSettings(prevSettings => {
            const newSettings = { ...prevSettings };
            let changed = false;
            availableModes.forEach((modeInfo: any) => {
                if (!newSettings[modeInfo.id]) {
                    console.log(`[useModeSettingsManagement] Sync: Adding new mode ${modeInfo.id} from availableModes`);
                    newSettings[modeInfo.id] = {
                        name: modeInfo.label || modeInfo.id,
                        description: modeInfo.description || "",
                        rules: Array.isArray(modeInfo.rules) ? modeInfo.rules : [], // Get rules if available
                    };
                    changed = true;
                }
                // Optionally update name/description if they differ? Decide on source of truth.
            });
             // Optionally remove modes from settings that are no longer in availableModes?
            // Object.keys(newSettings).forEach(modeId => {
            //     if (!availableModes.some(am => am.id === modeId)) {
            //         console.log(`[useModeSettingsManagement] Sync: Removing mode ${modeId} not in availableModes`);
            //         delete newSettings[modeId];
            //         changed = true;
            //     }
            // });

            if (changed) {
                 console.log("[useModeSettingsManagement] Settings updated based on availableModes sync.");
                 // Update initial settings string if sync changes state significantly?
                 // setInitialModeSettings(JSON.stringify(newSettings));
                 return newSettings;
            }
            return prevSettings; // No changes needed
        });
    }
  }, [availableModes, isLoading]); // Depend on availableModes and isLoading


  // Update a specific mode's settings
  const updateModeSettings = useCallback((modeId: string, field: keyof ModeSettingsData, value: any) => {
    setModeSettings((prev) => ({
      ...prev,
      [modeId]: {
        ...prev[modeId],
        [field]: value,
      },
    }));
    console.log(`[useModeSettingsManagement] Updated setting for ${modeId}.${field}`);
  }, []);

  // Save all current mode settings to modes.json
  const saveAllModeSettings = useCallback(() => {
    const modesConfig: ModesConfig = {
      modes: Object.entries(modeSettings).map(([id, settings]) => ({
        id,
        name: settings.name,
        description: settings.description,
        rules: settings.rules,
      })),
    };

    console.log("[useModeSettingsManagement] Saving mode settings:", modesConfig);
    const saveMessage: WebviewMessage = {
      type: "saveModeSettings",
      text: JSON.stringify(modesConfig),
    };
    vscode.postMessage(saveMessage);

    // Update initial state after saving to reflect the new baseline
    setInitialModeSettings(JSON.stringify(modeSettings));

    // Show confirmation message
    const infoMessage: WebviewMessage = {
			type: "showInformationMessage",
			text: "모드 설정이 저장되었습니다. 변경 사항이 즉시 반영됩니다."
		};
		vscode.postMessage(infoMessage);
    console.log("[useModeSettingsManagement] Settings saved and confirmation message sent.");
  }, [modeSettings]); // Depend on modeSettings

  // Reset settings to default by telling the extension to overwrite modes.json
  const resetToDefaults = useCallback(() => {
    console.log("[useModeSettingsManagement] Requesting reset to default modes.");
    const resetMessage: WebviewMessage = { type: "resetModesToDefaults" };
    vscode.postMessage(resetMessage);
    // After reset, the extension should push the new config, triggering the load effect's listener
    // Optionally, set loading state here?
    setIsLoading(true); // Assume loading after reset request
  }, []);

  // Calculate if settings have changed
  const isDirty = JSON.stringify(modeSettings) !== initialModeSettings;

  return {
    modeSettings,
    isLoading, // Expose loading state
    isDirty,    // Expose dirty state
    updateModeSettings,
    saveAllModeSettings,
    resetToDefaults,
  };
};
