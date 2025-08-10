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
