import sys
import os # Import os module for path manipulation

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths relative to the workspace root
# These are now constructed based on SCRIPT_DIR going up two levels to workspace root
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
CAREZERO_CHANGES_PATH = os.path.join(WORKSPACE_ROOT, "caret-docs/tasks/029-02-action-git-caret-zero-changes.txt")
CLINE_UPSTREAM_CHANGES_PATH = os.path.join(WORKSPACE_ROOT, "caret-docs/tasks/029-02-action-git-caret-upstream-changes.txt")

# Output file paths (now relative to SCRIPT_DIR)
UPSTREAM_ONLY_OUTPUT_PATH = os.path.join(SCRIPT_DIR, "upstream_only_changes.txt")
BOTH_CHANGED_OUTPUT_PATH = os.path.join(SCRIPT_DIR, "both_changed_files.txt")
CARET_ONLY_OUTPUT_PATH = os.path.join(SCRIPT_DIR, "caret_only_changes.txt")

def read_file_lines(filepath, encoding='utf-16-le'):
    print(f"Attempting to read file: {filepath} with encoding {encoding}")
    try:
        with open(filepath, 'r', encoding=encoding) as f:
            return set(line.strip() for line in f if line.strip())
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}", file=sys.stderr)
        # Do not exit here, allow main to handle overall success/failure
        return None 
    except Exception as e:
        print(f"Error reading file {filepath}: {e}", file=sys.stderr)
        return None

def write_lines_to_file(filepath, lines):
    print(f"Attempting to write to {filepath}...")
    if lines is None: # Check if lines is None (from a read error)
        print(f"Skipping write to {filepath} due to previous read error.", file=sys.stderr)
        return False
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            if lines: # Check if the set itself is not empty
                for line in sorted(list(lines)):
                    f.write(line + '\n')
            else:
                f.write("(없음)\n")
        print(f"Successfully wrote to {filepath}")
        return True
    except Exception as e:
        print(f"Error writing to file {filepath}: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    print("Comparing diff files...")
    caret_files = read_file_lines(CAREZERO_CHANGES_PATH) 
    # Assuming caret-upstream changes file is also UTF-16LE based on previous issues
    # If it's consistently UTF-8, this can be read_file_lines(CLINE_UPSTREAM_CHANGES_PATH, encoding='utf-8')
    upstream_files = read_file_lines(CLINE_UPSTREAM_CHANGES_PATH, encoding='utf-16-le')

    all_reads_succeeded = True
    if caret_files is None:
        print("Failed to read caret_files.", file=sys.stderr)
        all_reads_succeeded = False
    if upstream_files is None:
        print("Failed to read upstream_files.", file=sys.stderr)
        all_reads_succeeded = False

    if not all_reads_succeeded:
        print("Exiting due to file read errors.", file=sys.stderr)
        sys.exit(1)

    upstream_only = upstream_files - caret_files
    both_changed = upstream_files.intersection(caret_files)
    caret_only = caret_files - upstream_files

    print("\nWriting results to files...")
    success1 = write_lines_to_file(UPSTREAM_ONLY_OUTPUT_PATH, upstream_only)
    success2 = write_lines_to_file(BOTH_CHANGED_OUTPUT_PATH, both_changed)
    success3 = write_lines_to_file(CARET_ONLY_OUTPUT_PATH, caret_only)

    if success1 and success2 and success3:
        print("\n--- Comparison Complete. All results written to files in scripts/ directory: ---")
        print(f"- {UPSTREAM_ONLY_OUTPUT_PATH}")
        print(f"- {BOTH_CHANGED_OUTPUT_PATH}")
        print(f"- {CARET_ONLY_OUTPUT_PATH}")
        sys.exit(0)
    else:
        print("\n--- Comparison Incomplete. Some files may not have been written correctly. Please check logs. ---", file=sys.stderr)
        sys.exit(1) 