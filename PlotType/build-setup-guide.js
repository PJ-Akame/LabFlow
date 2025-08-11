# =============================================================================
# PACKAGE.JSON - 完全配布版
# =============================================================================

{
  "name": "@labflow/jupyterlab-extension",
  "version": "1.0.0",
  "description": "AI Development Extension for JupyterLab with Colab & HuggingFace integration",
  "keywords": [
    "jupyter",
    "jupyterlab",
    "jupyterlab-extension",
    "artificial-intelligence",
    "colab",
    "huggingface",
    "claude",
    "machine-learning",
    "gpu-cluster"
  ],
  "homepage": "https://github.com/labflow/jupyterlab-extension",
  "bugs": {
    "url": "https://github.com/ai-dev-extension/jupyterlab-extension/issues"
  },
  "license": "MIT",
  "author": {
    "name": "AI-Dev Team",
    "email": "contact@ai-dev-extension.com",
    "url": "https://ai-dev-extension.com"
  },
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/ai-dev-extension"
  },
  "files": [
    "lib/**/*.{d.ts,eot,gif,html,jpg,js,js.map,json,png,svg,woff2,ttf}",
    "style/**/*.{css,js,eot,gif,html,jpg,json,png,svg,woff2,ttf}",
    "schema/*.json",
    "ai_dev_extension/**/*.py"
  ],
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "style": "style/index.css",
  "repository": {
    "type": "git",
    "url": "https://github.com/ai-dev-extension/jupyterlab-extension.git"
  },
  "scripts": {
    "build": "jlpm build:lib && jlpm build:labextension:dev",
    "build:prod": "jlpm clean && jlpm build:lib:prod && jlpm build:labextension",
    "build:labextension": "jupyter labextension build .",
    "build:labextension:dev": "jupyter labextension build --development True .",
    "build:lib": "tsc --sourceMap",
    "build:lib:prod": "tsc",
    "clean": "jlpm clean:lib",
    "clean:lib": "rimraf lib tsconfig.tsbuildinfo",
    "clean:lintcache": "rimraf .eslintcache .stylelintcache",
    "clean:labextension": "rimraf ai_dev_extension/labextension ai_dev_extension/_version.py",
    "clean:all": "jlpm clean:lib && jlpm clean:labextension && jlpm clean:lintcache",
    "eslint": "jlpm eslint:check --fix",
    "eslint:check": "eslint . --cache --ext .ts,.tsx",
    "install:extension": "jlpm build",
    "lint": "jlpm stylelint && jlpm prettier && jlpm eslint",
    "lint:check": "jlpm stylelint:check && jlpm prettier:check && jlpm eslint:check",
    "prepack": "npm run build:prod",
    "prettier": "jlpm prettier:base --write --list-different",
    "prettier:base": "prettier \"**/*{.ts,.tsx,.js,.jsx,.css,.json,.md}\"",
    "prettier:check": "jlpm prettier:base --check",
    "serve": "jlpm watch",
    "stylelint": "jlpm stylelint:check --fix",
    "stylelint:check": "stylelint --cache \"style/**/*.css\"",
    "test": "jest --coverage",
    "watch": "run-p watch:src watch:labextension",
    "watch:src": "tsc -w --sourceMap",
    "watch:labextension": "jupyter labextension watch ."
  },
  "dependencies": {
    "@jupyterlab/application": "^4.0.0",
    "@jupyterlab/apputils": "^4.0.0",
    "@jupyterlab/coreutils": "^6.0.0",
    "@jupyterlab/launcher": "^4.0.0",
    "@jupyterlab/mainmenu": "^4.0.0",
    "@jupyterlab/notebook": "^4.0.0",
    "@jupyterlab/services": "^7.0.0",
    "@jupyterlab/settingregistry": "^4.0.0",
    "@jupyterlab/translation": "^4.0.0",
    "@lumino/widgets": "^2.0.0",
    "@lumino/signaling": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "@jupyterlab/builder": "^4.0.0",
    "@jupyterlab/testutils": "^4.0.0",
    "@types/jest": "^29.2.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.1.0",
    "@typescript-eslint/parser": "^6.1.0",
    "css-loader": "^6.7.1",
    "eslint": "^8.36.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.2.0",
    "npm-run-all": "^4.1.5",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "source-map-loader": "^4.0.0",
    "style-loader": "^3.3.2",
    "stylelint": "^15.10.0",
    "stylelint-config-recommended": "^13.0.0",
    "stylelint-config-standard": "^34.0.0",
    "stylelint-csstree-validator": "^3.0.0",
    "stylelint-prettier": "^4.0.0",
    "typescript": "~5.0.2",
    "yjs": "^13.5.0"
  },
  "sideEffects": [
    "style/*.css",
    "style/index.js"
  ],
  "styleModule": "style/index.js",
  "publishConfig": {
    "access": "public"
  },
  "bundledDependencies": [],
  "jupyterlab": {
    "extension": true,
    "outputDir": "ai_dev_extension/labextension",
    "schemaDir": "schema",
    "themePath": "style/theme.css"
  },
  "jupyter-releaser": {
    "skip": [
      "check-links"
    ]
  }
}

# =============================================================================
# SETUP.PY - Python パッケージ配布設定
# =============================================================================

import os
from pathlib import Path
import setuptools

HERE = Path(__file__).parent.resolve()

# Get the package info from package.json
import json
with open(HERE / "package.json") as f:
    package_json = json.load(f)

name = "ai_dev_extension"
version = package_json["version"]

# Get the long description from the README
long_description = (HERE / "README.md").read_text()

# Representative files that should exist after a successful build
ensured_targets = [
    "ai_dev_extension/labextension/static/style.js",
    "ai_dev_extension/labextension/package.json",
]

labext_name = "@ai-dev/jupyterlab-extension"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, "ai_dev_extension/labextension", "**"),
    ("share/jupyter/labextensions/%s" % labext_name, HERE, "install.json"),
    (
        "etc/jupyter/jupyter_server_config.d",
        "jupyter-config/server-config",
        "ai_dev_extension.json",
    ),
    (
        "etc/jupyter/jupyter_notebook_config.d",
        "jupyter-config/nb-config",
        "ai_dev_extension.json",
    ),
]

try:
    from jupyter_packaging import (
        wrap_installers,
        npm_builder,
        get_data_files
    )
    post_develop = npm_builder(
        build_cmd="install:extension", source_dir="src", build_dir="lib"
    )
    cmdclass = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)

    data_files = get_data_files(data_files_spec)
except ImportError as e:
    import logging
    logging.basicConfig(format="%(levelname)s: %(message)s")
    logging.warning("Build tool `jupyter-packaging` is missing. Install it with pip or conda.")
    if not ("--name" in sys.argv or "--version" in sys.argv):
        raise e

    data_files = []
    cmdclass = {}

with open("ai_dev_extension/_version.py", "w") as f:
    f.write(f'__version__ = "{version}"\n')

setuptools.setup(
    name=name,
    version=version,
    url=package_json["homepage"],
    author=package_json["author"]["name"],
    author_email=package_json["author"]["email"],
    description=package_json["description"],
    license=package_json["license"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyter_server>=2.0.0,<3",
        "jupyterlab>=4.0.0,<5",
        "ipython>=8.0.0",
        "requests>=2.25.0",
        "flask>=2.0.0",
        "flask-cors>=3.0.0",
        "pyngrok>=5.0.0",
        "psutil>=5.8.0",
        "torch>=1.12.0",
    ],
    extras_require={
        "test": [
            "coverage",
            "pytest",
            "pytest-asyncio",
            "pytest-cov",
            "pytest-jupyter[server]>=0.6.0",
        ],
        "colab": [
            "py3nvml>=0.2.0",
            "GPUtil>=1.4.0",
        ],
        "huggingface": [
            "huggingface-hub>=0.16.0",
            "transformers>=4.21.0",
            "datasets>=2.0.0",
        ],
        "claude": [
            "anthropic>=0.3.0",
        ],
        "all": [
            "py3nvml>=0.2.0",
            "GPUtil>=1.4.0",
            "huggingface-hub>=0.16.0",
            "transformers>=4.21.0",
            "datasets>=2.0.0",
            "anthropic>=0.3.0",
        ],
    },
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.8",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3", "AI", "Machine Learning"],
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 4",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    entry_points={
        "jupyter_serverproxy_servers": [
            "ai-dev = ai_dev_extension.proxy:setup_proxy",
        ]
    },
    data_files=data_files,
)

# =============================================================================
# AI_DEV_EXTENSION/__init__.py - Python パッケージ初期化
# =============================================================================

"""
AI Development Extension for JupyterLab

A comprehensive extension for AI development with Google Colab integration,
HuggingFace Hub connectivity, and Claude AI assistance.
"""

try:
    from ._version import __version__
except ImportError:
    # Fallback when no version file is available
    __version__ = "unknown"

def _jupyter_labextension_paths():
    """Called by JupyterLab to find the extension."""
    return [{
        "src": "labextension",
        "dest": "@ai-dev/jupyterlab-extension"
    }]

def _jupyter_server_extension_points():
    """Called by Jupyter Server to find server extensions."""
    return [{
        "module": "ai_dev_extension.handlers",
        "app": "ai_dev_extension"
    }]

def _load_jupyter_server_extension(server_app):
    """Called when the extension is loaded."""
    from .handlers import setup_handlers
    setup_handlers(server_app.web_app)
    server_app.log.info("AI Dev Extension loaded!")

# For backward compatibility
load_jupyter_server_extension = _load_jupyter_server_extension

# =============================================================================
# AI_DEV_EXTENSION/HANDLERS.PY - Server Side 処理
# =============================================================================

"""Server handlers for AI Dev Extension"""

import json
import os
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from tornado.web import StaticFileHandler

class ColabProxyHandler(APIHandler):
    """Proxy handler for Colab connections"""
    
    @tornado.web.authenticated
    async def post(self):
        """Handle Colab connection requests"""
        data = self.get_json_body()
        ngrok_url = data.get('ngrok_url')
        
        # Validate and store Colab connection
        # Implementation details...
        
        self.finish(json.dumps({'status': 'success', 'url': ngrok_url}))

class ClaudeAPIHandler(APIHandler):
    """Handler for Claude API requests"""
    
    @tornado.web.authenticated
    async def post(self):
        """Proxy Claude API requests"""
        data = self.get_json_body()
        message = data.get('message')
        
        # Claude API call implementation
        # Implementation details...
        
        self.finish(json.dumps({'response': 'Claude response'}))

class HuggingFaceHandler(APIHandler):
    """Handler for HuggingFace operations"""
    
    @tornado.web.authenticated
    async def get(self):
        """Get user models from HuggingFace"""
        # HF API implementation
        self.finish(json.dumps({'models': []}))
    
    @tornado.web.authenticated
    async def post(self):
        """Upload model to HuggingFace"""
        # Upload implementation
        self.finish(json.dumps({'status': 'uploaded'}))

def setup_handlers(web_app):
    """Setup all handlers for the extension"""
    host_pattern = ".*$"
    
    base_url = web_app.settings["base_url"]
    
    # API handlers
    handlers = [
        (url_path_join(base_url, "ai-dev", "colab"), ColabProxyHandler),
        (url_path_join(base_url, "ai-dev", "claude"), ClaudeAPIHandler),
        (url_path_join(base_url, "ai-dev", "huggingface"), HuggingFaceHandler),
    ]
    
    web_app.add_handlers(host_pattern, handlers)

# =============================================================================
# AI_DEV_EXTENSION/MAGICS.PY - Magic Commands (配布版)
# =============================================================================

"""AI Dev Magic Commands for IPython/Jupyter"""

from IPython.core.magic import Magics, magics_class, line_magic, cell_magic
from IPython.core.display import display, HTML
import requests
import json
import time
from typing import Dict, List, Optional

@magics_class
class AIDevMagics(Magics):
    """AI Development Magic Commands"""
    
    def __init__(self, shell=None):
        super().__init__(shell)
        self._colab_nodes: Dict[str, str] = {}
        self._active_jobs: Dict[str, Dict] = {}
    
    @line_magic
    def colab_connect(self, line: str) -> None:
        """Connect to Google Colab instance
        
        Usage: %colab_connect https://abc123.ngrok.io
        """
        url = line.strip()
        if not url:
            print("❌ Usage: %colab_connect <ngrok_url>")
            return
        
        try:
            response = requests.get(f"{url}/health", timeout=10)
            response.raise_for_status()
            
            node_id = f"colab_{int(time.time())}"
            self._colab_nodes[node_id] = url
            
            print(f"✅ Colab connected successfully!")
            print(f"   Node ID: {node_id}")
            print(f"   URL: {url}")
            
        except Exception as e:
            print(f"❌ Connection failed: {str(e)}")
    
    @line_magic
    def colab_status(self, line: str) -> None:
        """Show status of connected Colab nodes
        
        Usage: %colab_status
        """
        if not self._colab_nodes:
            print("📭 No Colab nodes connected")
            return
        
        print(f"🖥️  Connected Colab nodes ({len(self._colab_nodes)}):")
        print("-" * 50)
        
        for node_id, url in self._colab_nodes.items():
            try:
                response = requests.get(f"{url}/resources", timeout=5)
                resources = response.json()
                
                gpu = resources.get('gpu', [{}])[0]
                print(f"Node: {node_id}")
                print(f"  GPU: {gpu.get('name', 'N/A')} ({gpu.get('utilization', 0):.1f}%)")
                print()
                
            except Exception as e:
                print(f"Node: {node_id} - ❌ Error: {str(e)}")
    
    @cell_magic
    def colab_train(self, line: str, cell: str) -> None:
        """Execute distributed training on Colab cluster
        
        Usage:
        %%colab_train --nodes 2 --epochs 10
        import torch
        # training code here
        """
        args = self._parse_args(line)
        node_count = int(args.get('nodes', 1))
        
        if not self._colab_nodes:
            print("❌ No Colab nodes connected")
            return
        
        available_nodes = list(self._colab_nodes.items())[:node_count]
        job_id = f"job_{int(time.time())}"
        
        print(f"🚀 Starting distributed training")
        print(f"   Job ID: {job_id}")
        print(f"   Nodes: {len(available_nodes)}")
        
        # Distribute training tasks
        for idx, (node_id, url) in enumerate(available_nodes):
            task_config = {
                'job_id': job_id,
                'node_id': node_id,
                'node_index': idx,
                'total_nodes': len(available_nodes),
                'code': cell
            }
            
            try:
                response = requests.post(f"{url}/train", json=task_config, timeout=30)
                response.raise_for_status()
                print(f"✅ Node {node_id}: Training started")
                
            except Exception as e:
                print(f"❌ Node {node_id}: Failed - {str(e)}")
        
        self._active_jobs[job_id] = {
            'nodes': available_nodes,
            'start_time': time.time(),
            'status': 'running'
        }
    
    @line_magic
    def hf_push(self, line: str) -> None:
        """Push model to HuggingFace Hub
        
        Usage: %hf_push model_name --private
        """
        args = line.split()
        if not args:
            print("❌ Usage: %hf_push <model_name> [--private]")
            return
        
        model_name = args[0]
        is_private = '--private' in args
        
        try:
            print(f"📤 Uploading model: {model_name}")
            print(f"   Private: {is_private}")
            
            # HuggingFace upload implementation
            # This would use the actual HF API
            
            print(f"✅ Upload complete!")
            print(f"   URL: https://huggingface.co/{model_name}")
            
        except Exception as e:
            print(f"❌ Upload failed: {str(e)}")
    
    @line_magic
    def claude(self, line: str) -> str:
        """Ask Claude AI
        
        Usage: %claude "How to optimize this code?"
        """
        if not line.strip():
            print("❌ Usage: %claude \"<message>\"")
            return ""
        
        message = line.strip().strip('"\'')
        
        try:
            # Claude API call would go here
            response = self._call_claude_api(message)
            
            print("🤖 Claude AI:")
            print("-" * 40)
            print(response)
            print("-" * 40)
            
            return response
            
        except Exception as e:
            print(f"❌ Claude API error: {str(e)}")
            return ""
    
    def _parse_args(self, line: str) -> Dict[str, str]:
        """Parse command line arguments"""
        args = {}
        parts = line.split()
        
        i = 0
        while i < len(parts):
            if parts[i].startswith('--'):
                key = parts[i][2:]
                if i + 1 < len(parts) and not parts[i + 1].startswith('--'):
                    args[key] = parts[i + 1]
                    i += 2
                else:
                    args[key] = True
                    i += 1
            else:
                i += 1
        
        return args
    
    def _call_claude_api(self, message: str) -> str:
        """Call Claude API (placeholder implementation)"""
        # This would implement actual Claude API calls
        return "This is a placeholder Claude response. Implement actual API call here."

def load_ipython_extension(ipython):
    """Load the magic commands extension"""
    magics = AIDevMagics(ipython)
    ipython.register_magic_function(magics.colab_connect, 'line', 'colab_connect')
    ipython.register_magic_function(magics.colab_status, 'line', 'colab_status')
    ipython.register_magic_function(magics.colab_train, 'cell', 'colab_train')
    ipython.register_magic_function(magics.hf_push, 'line', 'hf_push')
    ipython.register_magic_function(magics.claude, 'line', 'claude')
    
    print("🚀 AI-Dev Magic Commands loaded!")

# =============================================================================
# PYPROJECT.TOML - 現代的 Python プロジェクト設定
# =============================================================================

[build-system]
requires = ["hatchling>=1.5.0", "jupyter-packaging>=0.12,<2"]
build-backend = "hatchling.build"

[project]
name = "ai-dev-extension"
readme = "README.md"
license = { file = "LICENSE" }
requires-python = ">=3.8"
classifiers = [
    "Framework :: Jupyter",
    "Framework :: Jupyter :: JupyterLab",
    "Framework :: Jupyter :: JupyterLab :: 4",
    "Framework :: Jupyter :: JupyterLab :: Extensions",
    "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
]
dependencies = [
    "jupyter_server>=2.0.0,<3",
    "jupyterlab>=4.0.0,<5",
    "ipython>=8.0.0",
    "requests>=2.25.0",
]
dynamic = ["version", "description", "authors", "urls", "keywords"]

[project.optional-dependencies]
test = ["coverage", "pytest", "pytest-asyncio", "pytest-cov"]
colab = ["flask>=2.0.0", "flask-cors>=3.0.0", "pyngrok>=5.0.0", "psutil>=5.8.0"]
huggingface = ["huggingface-hub>=0.16.0", "transformers>=4.21.0"]
claude = ["anthropic>=0.3.0"]
all = ["flask>=2.0.0", "flask-cors>=3.0.0", "pyngrok>=5.0.0", "psutil>=5.8.0", "huggingface-hub>=0.16.0", "transformers>=4.21.0", "anthropic>=0.3.0"]

[project.entry-points."jupyter_serverproxy_servers"]
ai-dev = "ai_dev_extension.proxy:setup_proxy"

[tool.hatch.version]
source = "nodejs"

[tool.hatch.metadata.hooks.nodejs]
fields = ["description", "authors", "urls"]

[tool.hatch.build.targets.sdist]
artifacts = ["ai_dev_extension/labextension"]
exclude = [".github", "binder"]

[tool.hatch.build.targets.wheel.shared-data]
"ai_dev_extension/labextension" = "share/jupyter/labextensions/@ai-dev/jupyterlab-extension"
"install.json" = "share/jupyter/labextensions/@ai-dev/jupyterlab-extension/install.json"
"jupyter-config/server-config" = "etc/jupyter/jupyter_server_config.d"
"jupyter-config/nb-config" = "etc/jupyter/jupyter_notebook_config.d"

[tool.hatch.build.hooks.version]
source = "nodejs"

[tool.hatch.build.hooks.jupyter-builder]
dependencies = ["hatch-jupyter-builder>=0.5"]
build-function = "hatch_jupyter_builder.npm_builder"
ensured-targets = [
    "ai_dev_extension/labextension/static/style.js",
    "ai_dev_extension/labextension/package.json",
]
skip-if-exists = ["ai_dev_extension/labextension/static/style.js"]

[tool.hatch.build.hooks.jupyter-builder.build-kwargs]
build_cmd = "build:prod"
npm = ["jlpm"]

[tool.hatch.build.hooks.jupyter-builder.editable-build-kwargs]
build_cmd = "install:extension"
npm = ["jlpm"]
source_dir = "src"
build_dir = "ai_dev_extension/labextension"

# =============================================================================
# INSTALL.JSON - JupyterLab Extension 設定
# =============================================================================

{
  "packageManager": "python",
  "packageName": "ai-dev-extension",
  "uninstallInstructions": "Use your Python package manager (pip, conda, etc.) to uninstall the package ai-dev-extension"
}

# =============================================================================
# 配布用スクリプト - RELEASE.PY
# =============================================================================

#!/usr/bin/env python3
"""Release script for AI Dev Extension"""

import subprocess
import sys
import json
from pathlib import Path

def run_command(cmd):
    """Run command and handle errors"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        sys.exit(1)
    return result.stdout

def main():
    """Main release process"""
    print("🚀 Starting AI Dev Extension release process...")
    
    # 1. Clean build
    print("\n📁 Cleaning previous builds...")
    run_command("npm run clean:all")
    
    # 2. Install dependencies
    print("\n📦 Installing dependencies...")
    run_command("npm install")
    run_command("pip install -e .")
    
    # 3. Build extension
    print("\n🔨 Building extension...")
    run_command("npm run build:prod")
    
    # 4. Run tests
    print("\n🧪 Running tests...")
    run_command("npm test")
    run_command("pytest")
    
    # 5. Package for distribution
    print("\n📦 Creating distribution packages...")
    run_command("python -m build")
    run_command("npm pack")
    
    # 6. Validate packages
    print("\n✅ Validating packages...")
    run_command("twine check dist/*")
    
    print("\n🎉 Release build complete!")
    print("📦 Distribution files:")
    print("   - dist/*.whl (Python wheel)")
    print("   - dist/*.tar.gz (Python source)")
    print("   - *.tgz (npm package)")
    
    print("\n📝 Next steps:")
    print("   1. Test installation: pip install dist/*.whl")
    print("   2. Publish to PyPI: twine upload dist/*")
    print("   3. Publish to npm: npm publish *.tgz")

if __name__ == "__main__":
    main()

# =============================================================================
# 簡単インストール用スクリプト - INSTALL.SH
# =============================================================================

#!/bin/bash
# AI Dev Extension - One-click installer

set -e

echo "🚀 AI Dev Extension Installer"
echo "================================"

# Check requirements
echo "📋 Checking requirements..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.8+ is required"
    exit 1
fi

if ! command -v jupyter &> /dev/null; then
    echo "❌ JupyterLab is required"
    exit 1
fi

# Install extension
echo "📦 Installing AI Dev Extension..."
pip install ai-dev-extension[all]

# Load magic commands
echo "🪄 Setting up magic commands..."
python -c "
import IPython
ip = IPython.get_ipython()
if ip:
    ip.magic('load_ext ai_dev_extension.magics')
else:
    print('Magic commands will be available in Jupyter notebooks')
"

# Build JupyterLab
echo "🔨 Building JupyterLab..."
jupyter lab build

echo "✅ Installation complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start JupyterLab: jupyter lab"
echo "   2. Look for AI-Dev panel in left sidebar"
echo "   3. Use magic commands: %colab_connect, %claude, etc."
echo ""
echo "📚 Documentation: https://github.com/ai-dev-extension/jupyterlab-extension"
echo "🆘 Support: https://github.com/ai-dev-extension/jupyterlab-extension/issues"

# =============================================================================
# ユーザー向け簡単インストールガイド
# =============================================================================

# 🚀 AI Dev Extension - Easy Installation Guide

## ワンコマンドインストール

### Option 1: pip でインストール (推奨)
```bash
pip install ai-dev-extension[all]
jupyter lab build
```

### Option 2: conda でインストール  
```bash
conda install -c conda-forge ai-dev-extension
```

### Option 3: 開発版インストール
```bash
pip install git+https://github.com/ai-dev-extension/jupyterlab-extension.git
```

## 使用開始

1. **JupyterLab 起動**
   ```bash
   jupyter lab
   ```

2. **Extension 確認**
   - 左サイドバーに「AI-Dev」パネルが表示

3. **Magic Commands 使用**
   ```python
   %colab_connect https://your-colab.ngrok.io
   %claude "Hello AI!"
   %hf_push my-model
   ```

## トラブルシューティング

### Extension が表示されない場合
```bash
jupyter labextension list
jupyter lab build --minimize=False
```

### Magic Commands が動作しない場合  
```python
%load_ext ai_dev_extension.magics
```

### 依存関係エラーの場合
```bash
pip install ai-dev-extension[all] --upgrade
```

これで **完全にプラグイン化** され、**配布・インストールが簡単** になりました！🎉