# JupyterLabでExtensionが認識されているかチェック
python -c "
import subprocess, sys, json
try:
    # Extension一覧を取得
    result = subprocess.run([
        sys.executable, '-c', 
        'import jupyterlab; from jupyterlab.labapp import LabApp; app = LabApp(); app.initialize(); print(json.dumps(list(app.extension_manager.extensions.keys())))'
    ], capture_output=True, text=True, timeout=30)
    print('Extensions found:')
    if result.stdout.strip():
        extensions = json.loads(result.stdout.strip())
        for ext in extensions:
            print('  -', ext)
    else:
        print('  No extensions found or error occurred')
    
    if result.stderr:
        print('Errors:')
        print(result.stderr)
        
except Exception as e:
    print('Error checking extensions:', e)
"