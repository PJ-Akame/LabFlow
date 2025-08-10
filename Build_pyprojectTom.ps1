# 3. pyproject.toml作成（テキストファイルとして）
Write-Host "Creating pyproject.toml..." -ForegroundColor Green
$pyprojectContent = @"
[build-system]
requires = ["hatchling>=1.5.0", "jupyter-packaging>=0.12,<2"]
build-backend = "hatchling.build"

[project]
name = "labflow"
readme = "README.md"
license = { file = "LICENSE" }
requires-python = ">=3.8"
classifiers = [
    "Framework :: Jupyter",
    "Framework :: Jupyter :: JupyterLab",
    "Framework :: Jupyter :: JupyterLab :: 4",
    "Framework :: Jupyter :: JupyterLab :: Extensions",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Programming Language :: Python :: 3.13",
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

[tool.hatch.version]
source = "nodejs"
"@

$pyprojectContent | Out-File -FilePath "pyproject.toml" -Encoding UTF8
Write-Host "✅ pyproject.toml created" -ForegroundColor Green