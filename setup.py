from setuptools import setup, find_packages
import json
import os

# Read package.json for metadata
with open('package.json', 'r') as f:
    npm_pkg = json.load(f)

# JupyterLab extension info
lab_extension_info = {
    "src": "labextension",
    "dest": npm_pkg["name"]
}

setup(
    name="labflow-extension",
    version="1.0.0",
    description="LabFlow AI Development Extension for JupyterLab",
    long_description=open('README.md').read() if os.path.exists('README.md') else '',
    long_description_content_type='text/markdown',
    author="LabFlow Team",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "jupyterlab>=4.0.0,<5",
        "jupyter-packaging>=0.12",
    ],
    extras_require={
        "dev": [
            "build",
            "twine"
        ]
    },
    python_requires=">=3.8",
    classifiers=[
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 4",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
    ],
    entry_points={
        "jupyter_labextensions": [
            f"{npm_pkg['name']} = labflow_extension:_jupyter_labextension_paths"
        ]
    },
)
