# How To: Make environment on your PC 😎
1. Download .yml file from git
2. Open terminal (in conda base enviroment)
3. Paste: `conda env create -f {PATH}/environments.yml`
4. Press enter
5. Keep calm and wait a minute
6. You should have new conda enviroment called: cluster_env : )

# How To: Use the environment
1. Activate the env: `conda activate cluster_env`
2. Open jupyter notebook: `jupyter notebook`

# How To: Update the environment
1. Deactivate the activate environment: `conda deactivate`
2. Update the environment: `conda env update -f {PATH}/environments.yml`
3. Re-activate the environment: `conda activate cluster_env`

