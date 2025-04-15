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
