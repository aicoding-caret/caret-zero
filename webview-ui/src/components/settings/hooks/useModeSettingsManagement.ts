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

export const useModeSettingsManagement = () => {
  const { availableModes } = useExtensionState(); // Get availableModes for syncing

  const [modeSettings, setModeSettings] = useState<ModeSettingsState>({});
  const [initialModeSettings, setInitialModeSettings] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  // 중복 호출 방지용 ref
  const hasRequestedConfig = useRef(false);

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

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "modesConfigLoaded" && message.text) {
        console.log("[useModeSettingsManagement] Received modesConfigLoaded:", message.text);
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
            setModeSettings(loadedSettings);
            setInitialModeSettings(JSON.stringify(loadedSettings)); // Store initial state after loading
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

    window.addEventListener("message", handleMessage);
    return () => {
      console.log("[useModeSettingsManagement] Cleaning up message listener.");
      window.removeEventListener("message", handleMessage);
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
