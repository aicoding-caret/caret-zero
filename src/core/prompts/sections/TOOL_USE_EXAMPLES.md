# Tool Use Examples

## Example 1: Requesting to execute a command

```xml
<execute_command>
<command>npm run dev</command>
<requires_approval>false</requires_approval>
</execute_command>
```

## Example 2: Requesting to create a new file

```xml
<write_to_file>
<path>src/frontend-config.json</path>
<content>
{
  "apiEndpoint": "https://api.example.com",
  "theme": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "fontFamily": "Arial, sans-serif"
  },
  "features": {
    "darkMode": true,
    "notifications": true,
    "analytics": false
  },
  "version": "1.0.0"
}
</content>
</write_to_file>
```

## Example 3: Editing specific parts of an existing file

```xml
<replace_in_file>
<path>src/components/Button.js</path>
<diff>
<<<<<<< SEARCH
const Button = ({ text, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary">
      {text}
    </button>
  );
};
=======
const Button = ({ text, onClick, disabled = false, type = "primary" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-${type}`}>
      {text}
    </button>
  );
};
>>>>>>> REPLACE
</diff>
</replace_in_file>
```

## Example 4: Multiple edits in a single file

```xml
<replace_in_file>
<path>src/utils/config.js</path>
<diff>
<<<<<<< SEARCH
const API_URL = 'https://api.dev.example.com';
const API_TIMEOUT = 5000; // 5 seconds
=======
const API_URL = 'https://api.prod.example.com';
const API_TIMEOUT = 10000; // 10 seconds
>>>>>>> REPLACE

<<<<<<< SEARCH
export const DEBUG_MODE = true;
=======
export const DEBUG_MODE = false;
>>>>>>> REPLACE
</diff>
</replace_in_file>
```
