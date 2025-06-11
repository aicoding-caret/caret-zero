# ud15cud50cub9bf uce90ub9adud130 uc5c5ub370uc774ud2b8 uc791uc5c5 ubcf4uace0uc11c

**uc791uc131uc790**: uc54cud30c
**ub0a0uc9dc**: 2025-05-02
**uc791uc5c5**: ud15cud50cub9bf uce90ub9adud130 ub85cub529 ubc0f uc124uc815 ucc3d uc801uc6a9 ubb38uc81c ud574uacb0

## uc791uc5c5 uc694uc57d

1. ud15cud50cub9bf uce90ub9adud130 ub85cub529 ubb38uc81c ud574uacb0
   - i18n uac00uc774ub4dcuc5d0 ub9deuac8c uc5b8uc5b4 uc124uc815 uad00ub828 ucf54ub4dc uc911uc559ud654
   - VSCode uc5b8uc5b4 uc124uc815uc744 uac00uc838uc640 ud604uc7ac uc5b8uc5b4uc5d0 ub9deub294 ud15cud50cub9bf uce90ub9adud130 ub370uc774ud130 ud45cuc2dc

2. ubaa8ub2ec ub514uc790uc778 uac1cuc120
   - ubaa8ub2ecucc3d uc88cuc6b0 uc5ecubc31 ucd94uac00
   - ubaa8ub2ec ud06cuae30 ubc0f ubc30uacbd ud22cuba85ub3c4 uc870uc815

3. ud15cud50cub9bf uce90ub9adud130 uc120ud0dd uc2dc uc124uc815 ucc3d uc801uc6a9 uae30ub2a5 uad6cud604
   - uae30ubcf8 uc774ubbf8uc9c0, uc0dduac01uc911 uc774ubbf8uc9c0, ucee4uc2a4ud140 uc778uc2a4ud2b8ub7educ158 3uac00uc9c0ub9cc uc801uc6a9

## uc791uc5c5 ub0b4uc6a9

### 1. i18n uad00ub828 ucf54ub4dc uc911uc559ud654

`src/utils/i18n.ts` ud30cuc77cuc5d0 uc5b8uc5b4 uad00ub828 uc720ud2f8ub9acud2f0 ud568uc218 ucd94uac00:

```typescript
// uae00ub85cubc8c ub2e4uad6duc5b4/uad6duc81cud654 uc720ud2f8
import * as vscode from 'vscode';

export const DEFAULT_LANGUAGE = "en" as const;

/**
 * VSCode uc5b8uc5b4 uc124uc815uc5d0uc11c ud604uc7ac uc5b8uc5b4ub97c uac00uc838uc635ub2c8ub2e4.
 * @returns uc5b8uc5b4 ucf54ub4dc (uc608: 'ko', 'en' ub4f1)
 */
export function getCurrentLanguage(): string {
  // VSCode uc5b8uc5b4 uc124uc815uc5d0uc11c uac00uc838uc635ub2c8ub2e4. (uae30ubcf8uac12 'ko')
  const vscodeLocale = vscode.env.language || 'ko';
  // uc5b8uc5b4 ucf54ub4dcuc5d0uc11c uc9c0uc5ed uc815ubcf4ub97c uc81cuac70ud569ub2c8ub2e4. (uc608: ko-KR -> ko)
  return vscodeLocale.split('-')[0];
}

/**
 * ub2e4uad6duc5b4 ub370uc774ud130uc5d0uc11c ud2b9uc815 uc5b8uc5b4uc758 ub370uc774ud130ub97c uac00uc838uc635ub2c8ub2e4.
 * @param data ub2e4uad6duc5b4 ub370uc774ud130
 * @param lang uc5b8uc5b4 ucf54ub4dc
 * @returns ud574ub2f9 uc5b8uc5b4uc758 ub370uc774ud130
 */
export function getLocalizedData(data: Record<string, any>, lang: string): any {
  // uc5b8uc5b4 ucf54ub4dcuc5d0 ud574ub2f9ud558ub294 ub370uc774ud130ub97c uac00uc838uc635ub2c8ub2e4. uc5c6uc73cuba74 uae30ubcf8 uc5b8uc5b4 ub370uc774ud130ub97c uac00uc838uc635ub2c8ub2e4.
  return data[lang] ?? data[DEFAULT_LANGUAGE] ?? {};
}
```

### 2. ubaa8ub2ec ub514uc790uc778 uac1cuc120

`webview-ui/src/components/common/Modal.tsx` ud30cuc77c uc218uc815:

```typescript
const contentStyle: React.CSSProperties = {
  background: "var(--vscode-editor-background, #fff)",
  color: "var(--vscode-editor-foreground, #222)",
  borderRadius: 8,
  minWidth: 320,
  maxWidth: "80%",
  width: "400px",
  maxHeight: "85vh",
  overflowY: "auto",
  padding: 24,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  position: "relative",
  margin: "0 20px",
};
```

### 3. ud15cud50cub9bf uce90ub9adud130 uc120ud0dd uc2dc uc124uc815 ucc3d uc801uc6a9 uae30ub2a5 uad6cud604

`PersonaSettingsView.tsx` ud30cuc77cuc5d0 uc124uc815 ucc3d ubc0f ub370uc774ud130 uc801uc6a9 uae30ub2a5 uad6cud604:

```typescript
const handleTemplateSelect = (character: TemplateCharacter) => {
  const lang = selectedLanguage || DEFAULT_LANGUAGE;
  const locale = (character[lang] as TemplateCharacterLocale) || (character[DEFAULT_LANGUAGE] as TemplateCharacterLocale);

  // uc0c8 ud37cuc18cub098 uac1duccb4 uc0dduc131 (uae30ubcf8 uc774ubbf8uc9c0, uc0dduac01uc911 uc774ubbf8uc9c0, ucee4uc2a4ud140 uc778uc2a4ud2b8ub7educ158ub9cc ud3ecud568)
  const newPersona: PersonaForm = {
    id: "persona-" + Date.now(),
    name: { [lang]: locale.name },
    description: { [lang]: locale.description },
    customInstructions: locale.customInstruction,
    avatarUri: character.avatarUri || "",
    thinkingAvatarUri: character.thinkingAvatarUri || ""
  };

  // ubc31uc5d4ub4dcub85c ud37cuc18cub098 uc5c5ub370uc774ud2b8 uba54uc2dcuc9c0 uc804uc1a1
  vscode.postMessage({
    type: "addOrUpdatePersona",
    persona: newPersona,
  });

  // ud604uc7ac ud3fc uc0c1ud0dc uc5c5ub370uc774ud2b8 (UIuc5d0 uc989uc2dc ubc18uc601)
  setForm(newPersona);
  setHasChanges(false);
  setShowTemplateModal(false);
};
```

### 4. uc124uc815 ucc3d UI uad6cud604

`PersonaSettingsView.tsx`uc5d0 uc124uc815 ucc3d UI uad6cud604:

```tsx
<PersonaDetailSection>
  {/* ucee4uc2a4ud140 uc778uc2a4ud2b8ub7educ158 */}
  <div style={{ marginBottom: 16 }}>
    <label htmlFor="customInstructions" style={{ display: 'block', marginBottom: 8 }}>ucee4uc2a4ud140 uc778uc2a4ud2b8ub7educ158</label>
    <VSCodeTextArea
      id="customInstructions"
      value={form.customInstructions || ""}
      onChange={(e) => handleInput("customInstructions", (e.target as HTMLTextAreaElement).value)}
      style={{ width: '100%', minHeight: '100px' }}
    />
  </div>

  {/* uc774ubbf8uc9c0 URL uc785ub825 ud544ub4dc */}
  <div style={{ marginBottom: 16 }}>
    <label htmlFor="avatarUri" style={{ display: 'block', marginBottom: 8 }}>uae30ubcf8 uc774ubbf8uc9c0 URL</label>
    <VSCodeTextField
      id="avatarUri"
      value={form.avatarUri || ""}
      onChange={(e) => handleInput("avatarUri", (e.target as HTMLInputElement).value)}
      style={{ width: '100%' }}
    />
  </div>

  <div style={{ marginBottom: 16 }}>
    <label htmlFor="thinkingAvatarUri" style={{ display: 'block', marginBottom: 8 }}>uc0dduac01uc911 uc774ubbf8uc9c0 URL</label>
    <VSCodeTextField
      id="thinkingAvatarUri"
      value={form.thinkingAvatarUri || ""}
      onChange={(e) => handleInput("thinkingAvatarUri", (e.target as HTMLInputElement).value)}
      style={{ width: '100%' }}
    />
  </div>

  {/* uc800uc7a5 ubc84ud2bc */}
  {hasChanges && (
    <SettingsSaveButton onClick={handleSave}>uc800uc7a5</SettingsSaveButton>
  )}
  {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
</PersonaDetailSection>
```

## uc644ub8cc uc0c1ud669

1. i18n uac00uc774ub4dcuc5d0 ub9deuac8c uc5b8uc5b4 uad00ub828 ucf54ub4dc uc911uc559ud654 uc644ub8cc
2. VSCode uc5b8uc5b4 uc124uc815uc744 uac00uc838uc640 ud604uc7ac uc5b8uc5b4uc5d0 ub9deub294 ud15cud50cub9bf uce90ub9adud130 ub370uc774ud130 ud45cuc2dc uae30ub2a5 uad6cud604 uc644ub8cc
3. ubaa8ub2ec ub514uc790uc778 uac1cuc120 uc644ub8cc (uc88cuc6b0 uc5ecubc31 ucd94uac00, ubc30uacbd ud22cuba85ub3c4 uc870uc815)
4. ud15cud50cub9bf uce90ub9adud130 uc120ud0dd uc2dc uc124uc815 ucc3duc5d0 ub370uc774ud130 uc801uc6a9 uae30ub2a5 uad6cud604 uc644ub8cc
5. uc124uc815 ucc3duc5d0 uae30ubcf8 uc774ubbf8uc9c0, uc0dduac01uc911 uc774ubbf8uc9c0, ucee4uc2a4ud140 uc778uc2a4ud2b8ub7educ158 3uac00uc9c0ub9cc ud3ecud568ud558ub3c4ub85d uad6cud604 uc644ub8cc

## ud655uc778 ubc0f ud14cuc2a4ud2b8 uacb0uacfc

- ud15cud50cub9bf uce90ub9adud130 uc120ud0dd uc2dc uc124uc815 ucc3duc5d0 ub370uc774ud130uac00 uc801uc6a9ub418ub294 uac83 ud655uc778
- uc5b8uc5b4 uc124uc815uc5d0 ub530ub77c ud15cud50cub9bf uce90ub9adud130 uc774ub984uacfc uc124uba85uc774 uc62cubc14ub974uac8c ud45cuc2dcub418ub294 uac83 ud655uc778
- ubaa8ub2ec ub514uc790uc778 uac1cuc120uc73c ub85c uc0acuc6a9uc131 ud5a5uc0c1 ud655uc778

## ucd94uac00 uac1cuc120 uc0acud56d

- uc774ubbf8uc9c0 ubbf8ub9acubcf4uae30 uae30ub2a5 ucd94uac00 uace0ub824
- uc5b8uc5b4 uc124uc815 ubcc0uacbd uc2dc uc989uc2dc ubc18uc601 uae30ub2a5 uace0ub824
- uc774ubbf8uc9c0 URL uc720ud6a8uc131 uac80uc0ac uae30ub2a5 ucd94uac00 uace0ub824
