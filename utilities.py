import pandas as pd # for data manipulation
import numpy as np # for data manipulation
import cv2 # for ingesting images
import matplotlib.pyplot as plt # for showing images
import os # for getting files from disk
import threading # for parallelizing loading of data

default_img_pixel = 128
depth = 3

def random_state():
    return 42

def unflatten_images_df(df,img_pixel=default_img_pixel):
    df_img = df.filter(regex='pixel*', axis=1)
    images = df_img.to_numpy() 
    images = images.reshape((df.shape[0],img_pixel,img_pixel,depth))
    return images

def flatten_images(img_data):
    img_data_flattened = []
    for img in img_data:
        img_data_flattened.append(img.flatten()) 
    return img_data_flattened

def read_images(img_paths,img_pixel=default_img_pixel):
    img_data = []
    for img_path in img_paths:
        img = cv2.imread(img_path)[:,:,::-1] 
        img = cv2.resize(img, (img_pixel, img_pixel)) 
        img_data.append(img) 
    return img_data

def load_flattened_images(img_paths,img_pixel=default_img_pixel):
    img_data = read_images(img_paths,img_pixel)
    img_data_flattened = flatten_images(img_data)
    img_data_flattened = np.array(img_data_flattened) / 255
    return img_data_flattened

def get_all_img_paths(folder):
    image_paths = []
    for image in list(os.listdir(folder)):
        image_paths = image_paths+[folder+"/"+image]
    return image_paths

def get_img_paths(folder, max_number):
    image_paths = []
    count = 0
    for image in list(os.listdir(folder)):
        image_paths = image_paths+[folder+"/"+image]
        count += 1
        if (count == max_number):
            return image_paths
    return image_paths

def load_data(img_paths, groundtruth_file, img_pixel=default_img_pixel):
    flattened_images = load_flattened_images(img_paths, img_pixel)
    df_img_flattened = pd.DataFrame(flattened_images, dtype="float", columns = ['pixel' + str(i + 1) 
                                                             for i in range(flattened_images.shape[1])])
    
    img_names = [ os.path.splitext(os.path.basename(img_path))[0] for img_path in img_paths]
    df_img_names = pd.DataFrame(img_names, dtype="string", columns = ["image_name"])
    df_img = pd.concat([df_img_flattened, df_img_names], axis=1)
    df_img.set_index("image_name", inplace=True)

    df_ground_truth = pd.read_csv(groundtruth_file)
    df_ground_truth = df_ground_truth[['image_name', 'target']]
    df_ground_truth.set_index("image_name", inplace=True)
    df = pd.merge(df_img, df_ground_truth, how='inner', left_index=True, right_index=True)
    return df

def display_results(X, y_pred, y_actual, max=50, img_pixel=default_img_pixel):
    images = unflatten_images_df(X, img_pixel)
    
    y_pred_list = list(y_pred)
    y_actual_list = list(y_actual)

    return display_results_internal(images, y_pred_list, y_actual_list, max)

def display_interesting_results(X, y_pred, y_actual, max=50, img_pixel=default_img_pixel):
    images = unflatten_images_df(X,img_pixel)
    y_pred_list = list(y_pred)
    y_actual_list = list(y_actual)
    
    interesting_images = np.empty(0)
    interesting_y_pred_list = list() 
    interesting_y_actual_list = list()

    for i in range(0,len(y_pred_list)):
        if (y_pred_list[i] != y_actual_list[i]):
            interesting_images = np.append(interesting_images,images[i])
            interesting_y_pred_list.append(y_pred_list[i])
            interesting_y_actual_list.append(y_actual_list[i])

    interesting_images = interesting_images.reshape(len(interesting_y_actual_list),img_pixel,img_pixel,depth)
    return display_results_internal(interesting_images, interesting_y_pred_list, interesting_y_actual_list,max)

def display_results_internal(images, y_pred_list, y_actual_list, max_num=50):
    num_images = min(len(y_actual_list),max_num)
    cols = min(num_images,5)
    rows = max(int(num_images/cols),1) if cols != 0  else 0

    fig, axs = plt.subplots(rows, cols, sharey=False, tight_layout=True, figsize=(50,50), facecolor='white')
    n=0
    for i in range(0,rows):
        for j in range(0,cols):
            title = "Predicted: " + ("Benign" if y_pred_list[n] == 0  else "Melanoma") + "\nActual: " + ("Benign" if y_actual_list[n] == 0  else "Melanoma")
            if (rows != 1):
                axs[i,j].matshow(images[n])
                axs[i,j].set_title(title, size = 36)
            else:
                if (cols != 1):
                    axs[j].matshow(images[n])
                    axs[j].set_title(title, size = 36)
                else:
                    axs.matshow(images[n])
                    axs.set_title(title, size = 36)
            n=n+1     
            if (max_num == n):
                return plt
    return plt

def split_predictors_target(df):
    X = df.drop(columns = ['target']).copy()
    y = df['target']
    return X, y

def slice_list(lst, n):
    p = len(lst) // n
    if len(lst)-p > 0:
        return [lst[:p]] + slice_list(lst[p:], n-1)
    else:
        return [lst]

def get_df(result_arr, index, img_paths, groundtruth_file, name, num_images_per_thread, img_pixel=default_img_pixel):
    print("start loading " + name)
    
    num_images = len(img_paths)
    num_threads = max(int(num_images/num_images_per_thread), 1)
    
    result = [None] * num_threads
    threads = []
    
    # divide image paths into even chunks per thread
    sliced_img_paths = slice_list(img_paths, num_threads) 
    
    # spawn threads
    for i in range(num_threads):
        t = threading.Thread(target=get_df_thread, args=(result, i, sliced_img_paths[i], groundtruth_file, name, img_pixel)) 
        t.start()
        threads.append(t)
    
    # wait for threads
    for t in threads:
        t.join()
    
    df = pd.DataFrame()
    # combine results
    for r in result:
        if df.empty:
            df = r
        else:
            df = pd.concat([df,r])
    
    print("done loading " + name)
    result_arr[index] = df
    return df

def get_df_thread(result_arr, index, img_paths, groundtruth_file, name, img_pixel=default_img_pixel):
    print("start thread #%d for %s" %(index, name))
    
    df = load_data(img_paths, groundtruth_file, img_pixel)
    result_arr[index] = df
    
    print("finished thread #%d for %s" %(index, name))

def load_train_test(img_paths_train, groundtruth_file_train, img_paths_test, groundtruth_file_test, option, img_pixel=default_img_pixel):
    df_train = []
    df_test = []

    if option == "parallel_fusion":
        one_thread_per_x_images = int((len(img_paths_train) + len(img_paths_test)) / 10)
        print("Num images per thread %d"%one_thread_per_x_images)

        result = [None] * 2
        
        t1 = threading.Thread(target=get_df, args=(result, 0, img_paths_train, groundtruth_file_train, "train", one_thread_per_x_images, img_pixel))
        t2 = threading.Thread(target=get_df, args=(result, 1, img_paths_test, groundtruth_file_test, "test", one_thread_per_x_images, img_pixel)) 

        t1.start()
        t2.start()

        t1.join()
        t2.join()

        df_train = result[0]
        df_test = result[1]
    elif option == "parallel_train_test":
        result = [None] * 2
        
        t1 = threading.Thread(target=get_df_thread, args=(result, 0, img_paths_train, groundtruth_file_train, "train", img_pixel))
        t2 = threading.Thread(target=get_df_thread, args=(result, 1, img_paths_test, groundtruth_file_test, "test", img_pixel))

        t1.start()
        t2.start()

        t1.join()
        t2.join()

        df_train = result[0]
        df_test = result[1]
    elif option == "sequential_train_test_parallel_chunks": 
        one_thread_per_x_images = int((len(img_paths_train) + len(img_paths_test)) / 10)
        print("Num images per thread %d"%one_thread_per_x_images)

        result = [None] * 2
        df_train = get_df(result, 0, img_paths_train, groundtruth_file_train, "train", one_thread_per_x_images, img_pixel)
        df_test = get_df(result, 1, img_paths_test, groundtruth_file_test, "test", one_thread_per_x_images, img_pixel)
    elif option == "sequential":
        df_train = load_data(img_paths_train, groundtruth_file_train, img_pixel)
        df_test = load_data(img_paths_test, groundtruth_file_test, img_pixel)
    else: 
        print("Invalid option")

    return df_train, df_test