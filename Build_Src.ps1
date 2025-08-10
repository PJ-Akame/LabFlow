# 5. ソースファイル作成
Write-Host "Creating source files..." -ForegroundColor Green

# src/index.ts
$indexTs = @"
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { ICommandPalette } from "@jupyterlab/apputils";

const plugin: JupyterFrontEndPlugin<void> = {
  id: "labflow:plugin",
  autoStart: true,
  requires: [ICommandPalette],
  activate: activateExtension
};

function activateExtension(
  app: JupyterFrontEnd,
  palette: ICommandPalette
): void {
  console.log("🧪 LabFlow Extension activated!");
  
  // Add LabFlow command
  app.commands.addCommand("labflow:hello", {
    label: "LabFlow Hello",
    caption: "Test LabFlow extension",
    execute: () => {
      console.log("🚀 Hello from LabFlow!");
      alert("🧪 LabFlow Extension is working!\n\nAI Development Workflow ready!");
    }
  });

  // Add to command palette
  palette.addItem({ 
    command: "labflow:hello", 
    category: "LabFlow" 
  });

  console.log("✅ LabFlow commands registered");
}

export default plugin;
"@

$indexTs | Out-File -FilePath "src/index.ts" -Encoding UTF8
Write-Host "✅ src/index.ts created" -ForegroundColor Green

# style/index.css
$indexCss = @"
/* LabFlow Extension Styles */
.labflow-extension {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.labflow-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s ease;
}

.labflow-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.labflow-logo {
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
}
"@

$indexCss | Out-File -FilePath "style/index.css" -Encoding UTF8
Write-Host "✅ style/index.css created" -ForegroundColor Green

# ai_dev_extension/__init__.py
$initPy = @"
"""
LabFlow - AI Development Extension for JupyterLab
"""

try:
    from ._version import __version__
except ImportError:
    __version__ = "1.0.0"

def _jupyter_labextension_paths():
    return [{
        "src": "labextension", 
        "dest": "@labflow/jupyterlab-extension"
    }]
"@

$initPy | Out-File -FilePath "ai_dev_extension/__init__.py" -Encoding UTF8
Write-Host "✅ ai_dev_extension/__init__.py created" -ForegroundColor Green

# ai_dev_extension/_version.py
'__version__ = "1.0.0"' | Out-File -FilePath "ai_dev_extension/_version.py" -Encoding UTF8
Write-Host "✅ ai_dev_extension/_version.py created" -ForegroundColor Green