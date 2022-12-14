# USAGE
# Start the server:
# 	python run_keras_server.py
# Submit a request via cURL:
# 	curl -X POST -F image=@dog.jpg 'http://localhost:5000/predict'
# Submita a request via Python:
#	python simple_request.py

# import the necessary packages
from tensorflow.keras.models import load_model
from efficientnet.tfkeras import EfficientNetB0
from PIL import Image
import flask
import numpy as np
import io

# needed for explain route
from lime import lime_image
from skimage.segmentation import mark_boundaries
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from flask import Response


# initialize our Flask application and the Keras model
app = flask.Flask(__name__)
model = None
model_path = "model_07122022180601.h5" 
img_pixel = (224,224)
explainer = lime_image.LimeImageExplainer(42)
np.random.seed(42)

def setup_model():
	# load the pre-trained Keras model (here we are using a model
	# pre-trained on ImageNet and provided by Keras, but you can
	# substitute in your own networks just as easily)
	global model
	model = load_model(model_path)

	global img_pixel
	input_shape = model.get_config()["layers"][0]["config"]["batch_input_shape"]
	img_pixel = input_shape[1]

	print("Model has been successfully loaded")
	print(model.summary())

def prepare_image(image): # image is PIL image here!
	# if the image mode is not RGB, convert it
	if image.mode != "RGB":
		image = image.convert("RGB")

	# resize the input image and preprocess it
	image = image.resize((img_pixel, img_pixel))
	image = np.array(image)
	image = np.expand_dims(image, axis=0) # add one dim to match expected shape

	# scale image
	image = image / 255

	# return the processed image
	return image

@app.route("/explain", methods=["POST"])
def predict():
	# initialize the data dictionary that will be returned from the view
	data = {"success": False}

	# ensure an image was properly uploaded to our endpoint
	if flask.request.method == "POST":
		if flask.request.files.get("image"):
			# read the image in PIL format
			image = flask.request.files["image"].read()
			image = Image.open(io.BytesIO(image))

			# preprocess the image and prepare it for classification
			image = prepare_image(image)

			exp = explainer.explain_instance(image[0], 
                             model.predict, 
                             hide_color=[0,1,0], 
                             num_samples=1000)

			plt.figure()
			lime_image, mask = exp.get_image_and_mask(exp.top_labels[0], 
												positive_only=False, 
												num_features=6,
												hide_rest=False,
												min_weight=0.001)
			plt.imshow(mark_boundaries(lime_image, mask))
			plt.axis('off')
			output = io.BytesIO()
			FigureCanvas(plt.gcf()).print_png(output)

			response = Response(output.getvalue(), mimetype='image/png')
			response.headers.add('Access-Control-Allow-Origin', '*')
			return response

	response = flask.jsonify(data)
	response.headers.add('Access-Control-Allow-Origin', '*')
	# return the data dictionary as a JSON response
	return response

@app.route("/predict", methods=["POST"])
def explain():
	# initialize the data dictionary that will be returned from the view
	data = {"success": False}

	# ensure an image was properly uploaded to our endpoint
	if flask.request.method == "POST":
		if flask.request.files.get("image"):
			# read the image in PIL format
			image = flask.request.files["image"].read()
			image = Image.open(io.BytesIO(image))

			# preprocess the image and prepare it for classification
			image = prepare_image(image)

			# classify the input image and then initialize the list of predictions to return to the client
			preds = model.predict(image)
			probability = preds[0][0] # pred for 1st input 1st label
			data["probability"] = "{:.4f}".format(probability) 

			# indicate that the request was a success
			data["success"] = True

	response = flask.jsonify(data)
	response.headers.add('Access-Control-Allow-Origin', '*')
	# return the data dictionary as a JSON response
	return response

# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
	print(("* Loading Keras model and Flask starting server..."
		"please wait until server has fully started"))
	setup_model()
	app.run()