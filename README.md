# Melanoma Classification Project
Skin cancer is the most prevalent type of cancer.Melanoma is the most serious type of skin cancer,  responsible for 75 % of skin cancer deaths. It develops in the cells that produce melanin (the pigment that gives the skin its color). Melanomas can develop anywhere on the body, they most often develop in areas that have had exposure to the sun, such as back, legs, arms and face. They can develop from existing moles or can occur on otherwise normal-appearing skin.


This project uses the ISIC 2020 and the ISIC 2019 dataset to predict melanoma in pictures. It further provides options to deploy the resulting model. The project has been created by exchange students at Aarhus University. 


## Participants
Aneta Ambrosova <br>
Sophie Harren <br>
Oskar Pakuła <br>
Renée Villiger <br>

## Delivery Overview
The following files form part of the delivery. Please note that the notebooks should be executed in the order in which they are listed here.
- utilities.py : Provides utilities used by the following
- data_preperation_20192020.ipynb : Download and prepare the data
- downsampling.ipynb : Downsample the negative samples to avoid overfitting
- EfficientNetB0_model.ipynb : Transfer learning to identify melanoma in images
- model_evaluation.ipynb : Evaluate the performance using the hold out set
- explainable_ai.ipynb : Explainable AI to understand model predicitions

## Environment
A conda environment has been provided. Using a virtual environment makes sure that everyone is using the same dependencies, and that there are no version conflicts. This way problems only occuring on one machine are avoided. The environment has been modeled after the dependencies present on the GPU cluster of Aarhus University, since no new dependencies should be installed on the cluster. 

### How To: Create Environment
1. Open terminal (in conda base enviroment)
2. Paste: `conda env create -f {PATH}/environments.yml`
3. Press enter
4. Keep calm and wait a minute
5. You should have new conda enviroment called: cluster_env : )

### How To: Use the environment
1. Activate the env: `conda activate cluster_env`
2. Open jupyter notebook: `jupyter notebook`

### How To: Update the environment
1. Deactivate the activate environment: `conda deactivate`
2. Update the environment: `conda env update -f {PATH}/environments.yml`
3. Re-activate the environment: `conda activate cluster_env`

### Deployment 
For the deployment, some further files have been supplied. For a overview over these files, please refer to the README in the corresponding folder. 

### Website
A website has been developed, which can be used by a user to access the model and use the service. 


