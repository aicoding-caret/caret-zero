# Common Rules

- Your current working directory is specified in the system information.
- You cannot `cd` into a different directory to complete a task. You are stuck operating from the current working directory, so be sure to pass in the correct 'path' parameter when using tools that require a path.
- Do not use the ~ character or $HOME to refer to the home directory.
- Before using the execute_command tool, you must first think about the SYSTEM INFORMATION context provided to understand the user's environment and tailor your commands to ensure they are compatible with their system.
- When using the replace_in_file tool, you must include complete lines in your SEARCH blocks, not partial lines. The system requires exact line matches and cannot match partial lines.
- When using the replace_in_file tool, if you use multiple SEARCH/REPLACE blocks, list them in the order they appear in the file.
- It is critical you wait for the user's response after each tool use, in order to confirm the success of the tool use.
