import os
import json
import jupyter_core.paths

data_dir = jupyter_core.paths.jupyter_data_dir()
ext_dir = os.path.join(data_dir, 'share', 'jupyter', 'labextensions', '@labflow', 'jupyterlab-extension')

print(f'Extension directory: {ext_dir}')
print(f'Directory exists: {os.path.exists(ext_dir)}')

if os.path.exists(ext_dir):
    print('\\nFiles in extension directory:')
    for root, dirs, files in os.walk(ext_dir):
        level = root.replace(ext_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            file_path = os.path.join(root, file)
            file_size = os.path.getsize(file_path)
            print(f'{subindent}{file} ({file_size} bytes)')
            
            # package.json の内容確認
            if file == 'package.json':
                try:
                    with open(file_path, 'r') as f:
                        package_data = json.load(f)
                    print(f'{subindent}Package.json content:')
                    print(f'{subindent}  Name: {package_data.get(\"name\", \"NOT SET\")}')
                    print(f'{subindent}  Main: {package_data.get(\"main\", \"NOT SET\")}')
                    print(f'{subindent}  JupyterLab: {package_data.get(\"jupyterlab\", \"NOT SET\")}')
                except Exception as e:
                    print(f'{subindent}Error reading package.json: {e}')