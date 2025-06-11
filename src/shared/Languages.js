export const DEFAULT_LANGUAGE_SETTINGS = "en";
export const languageOptions = [
    { key: "en", display: "English" },
    { key: "ar", display: "Arabic - العربية" },
    { key: "pt-BR", display: "Portuguese - Português (Brasil)" },
    { key: "cs", display: "Czech - Čeština" },
    { key: "fr", display: "French - Français" },
    { key: "de", display: "German - Deutsch" },
    { key: "hi", display: "Hindi - हिन्दी" },
    { key: "hu", display: "Hungarian - Magyar" },
    { key: "it", display: "Italian - Italiano" },
    { key: "ja", display: "Japanese - 日本語" },
    { key: "ko", display: "Korean - 한국어" },
    { key: "pl", display: "Polish - Polski" },
    { key: "pt-PT", display: "Portuguese - Português (Portugal)" },
    { key: "ru", display: "Russian - Русский" },
    { key: "zh-CN", display: "Simplified Chinese - 简体中文" },
    { key: "es", display: "Spanish - Español" },
    { key: "zh-TW", display: "Traditional Chinese - 繁體中文" },
    { key: "tr", display: "Turkish - Türkçe" },
];
export function getLanguageKey(display) {
    if (!display) {
        return DEFAULT_LANGUAGE_SETTINGS;
    }
    const languageOption = languageOptions.find((option) => option.display === display);
    if (languageOption) {
        return languageOption.key;
    }
    return DEFAULT_LANGUAGE_SETTINGS;
}
//# sourceMappingURL=Languages.js.map