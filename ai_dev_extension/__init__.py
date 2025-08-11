"""LabFlow - AI Development Extension for JupyterLab"""
__version__ = "1.0.0"

def _jupyter_labextension_paths():
    return [{
        "src": "labextension", 
        "dest": "@labflow/jupyterlab-extension"
    }]
