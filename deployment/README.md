# Deployment 

## You Get...
### Flask Server (flask_server.py)
Run with `python flask_server.py`
Exposes two services
- predict (give probability the provided image is cancer)
- explain (explain prediction)
### Simple Request (simple_request.py)
Sends a prediction request to the server
Run with `python simple_request.py`
You may additionally specify for which image specifically the request shall be performed by giving the path of the file: `python simple_request.py <image path>`
### Explain Request Notebook (explain_request.ipynb)
Run as jupyter notebook
Send an "explain" request to the server and display the result once received

## You Need...
1. Model (specify in flask_server.py, default model is NOT given but you can get one from google drive!)
2. An image (you can change the path in both files or specify a param when calling simple_request.py, a default image is given)