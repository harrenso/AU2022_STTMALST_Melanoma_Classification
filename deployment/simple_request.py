# USAGE
# python simple_request.py [img-path]

# import the necessary packages
import requests
import sys

# initialize the Keras REST API endpoint URL along with the input
# image paths
KERAS_REST_API_URL = "http://localhost:5000/predict"
IMAGE_PATH = "ISIC_0000167.jpg"

if len(sys.argv) > 1:
    IMAGE_PATH = sys.argv[1]

# load the input image and construct the payload for the request
image = open(IMAGE_PATH, "rb").read()
payload = {"image": image}

# submit the request
r = requests.post(KERAS_REST_API_URL, files=payload).json()

# ensure the request was sucessful
if r["success"]:
    print('success')
    print("Probability of Melanoma: " + r["probability"])

# otherwise, the request failed
else:
	print("Request failed")
    