# register_extension.py - Manual Extension Registration
import json
import os
import shutil
from pathlib import Path

def register_labflow_extension():
    """Manually register LabFlow extension"""
    
    print("LabFlow Extension Registration")
    print("==============================")
    
    # Get user home directory
    home = Path.home()
    
    # Try different Jupyter data directory locations
    possible_dirs = [
        home / '.local' / 'share' / 'jupyter',
        home / '.jupyter',
        home / 'AppData' / 'Roaming' / 'jupyter',  # Windows
    ]
    
    jupyter_dir = None
    for dir_path in possible_dirs:
        if dir_path.exists() or dir_path.parent.exists():
            jupyter_dir = dir_path
            break
    
    if not jupyter_dir:
        jupyter_dir = home / '.local' / 'share' / 'jupyter'
    
    print(f"Using Jupyter directory: {jupyter_dir}")
    
    # Create extensions directory
    extensions_dir = jupyter_dir / 'labextensions'
    labflow_dir = extensions_dir / '@labflow' / 'jupyterlab-extension'
    
    print(f"Creating extension directory: {labflow_dir}")
    labflow_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy files if they exist
    current_dir = Path('.')
    
    if (current_dir / 'lib').exists():
        target_lib = labflow_dir / 'lib'
        if target_lib.exists():
            shutil.rmtree(target_lib)
        shutil.copytree(current_dir / 'lib', target_lib)
        print("[OK] lib/ directory copied")
    else:
        print("[WARNING] lib/ directory not found - run 'npx tsc' first")
    
    if (current_dir / 'style').exists():
        target_style = labflow_dir / 'style'
        if target_style.exists():
            shutil.rmtree(target_style)
        shutil.copytree(current_dir / 'style', target_style)
        print("[OK] style/ directory copied")
    else:
        print("[WARNING] style/ directory not found")
    
    # Create package.json for the extension
    package_data = {
        "name": "@labflow/jupyterlab-extension",
        "version": "1.0.0",
        "description": "LabFlow AI Development Extension",
        "main": "lib/index.js",
        "style": "style/index.css",
        "jupyterlab": {
            "extension": True
        }
    }
    
    package_file = labflow_dir / 'package.json'
    with open(package_file, 'w') as f:
        json.dump(package_data, f, indent=2)
    
    print(f"[OK] Extension package.json created: {package_file}")
    
    # Create install.json
    install_data = {
        "packageManager": "python",
        "packageName": "labflow-extension",
        "uninstallInstructions": "Use pip uninstall labflow-extension"
    }
    
    install_file = labflow_dir / 'install.json'
    with open(install_file, 'w') as f:
        json.dump(install_data, f, indent=2)
    
    print(f"[OK] Extension install.json created: {install_file}")
    
    print("")
    print("Extension registration complete!")
    print("================================")
    print("")
    print("Next steps:")
    print("1. Run: python -m jupyterlab")
    print("2. Look for 'LabFlow' in left sidebar")
    print("3. If not visible, reload browser (Ctrl+F5)")
    print("")

if __name__ == "__main__":
    try:
        register_labflow_extension()
    except Exception as e:
        print(f"Error during registration: {e}")
        print("Try running as administrator or check file permissions")
    
    input("Press Enter to continue...")