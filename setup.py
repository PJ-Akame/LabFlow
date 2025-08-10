from setuptools import setup, find_packages

setup(
    name="labflow-extension",
    version="1.0.0",
    description="LabFlow AI Development Extension",
    packages=find_packages(),
    install_requires=[
        "jupyterlab>=4.0.0",
    ],
)
