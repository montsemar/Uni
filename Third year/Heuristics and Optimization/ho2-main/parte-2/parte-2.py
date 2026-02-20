#!/usr/bin/env python3
import sys
import subprocess
import os

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    exe_path = os.path.join(script_dir, "parte-2.exe")

    args = [exe_path] + sys.argv[1:]
    
    try:
        subprocess.run(args)
    except FileNotFoundError:
        print(f"Error: No se encuentra {exe_path}")
    except KeyboardInterrupt:
        print("\nEjecución cancelada.")

if __name__ == "__main__":
    main()