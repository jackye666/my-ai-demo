#!/usr/bin/env python
import os, sys, subprocess
from os import listdir
from os.path import isfile, join

import configparser
import random
from enum import IntEnum
from flask import Flask, request, jsonify
from flask_cors import CORS

# Read in the config file for some parameters.
config = configparser.ConfigParser()
config.read('config.ini')

app = Flask(__name__,
	static_url_path='', 
        static_folder='static'
)
CORS(app)

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/local_img_list', methods=['GET', 'POST'])
def handle_local_img_list():
    dataset_name = request.args.get('dataset_name', None)
    folder = "static/dataset/{}".format(dataset_name)
    
    res = {'dataset_name': dataset_name}

    onlyfiles = [f for f in listdir(folder) if isfile(join(folder, f))]
    #onlyfiles.sort(reverse=True)
    files = ",".join(onlyfiles)
    res['img_list'] = files

    print(res)
    response = res

    return jsonify(response)


@app.route('/config', methods=['GET', 'POST'])
def handle_config():
    res = {}

    for key in config["web"]:
        if key in ['host', 'port']:
            continue
        res[key] = config["web"][key]
    print(res)
    response =  res

    return jsonify(response)


def http_predict(node_name, dataset, img_name):
    return {'infer_time':random.uniform(0, 1),
            'cpu_rate':random.uniform(0, 1)}

#This is for a single image prediction
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    node_name = request.args.get('node_name', None)
    img_name = request.args.get('img_name', None)
    dataset = request.args.get('dataset', None)

    res = http_predict(node_name, dataset, img_name)
    scale = 1.0

    if node_name.find("32")>=0:
        res['infer_time'] += 4.0
    else:
        res['infer_time'] = 1.0

    res['infer_time'] *= scale

    #print("time is:" + str(infer_time))
    res.update({"node_name": node_name, "img_name": img_name})
    response = res
    #print(response)
    return jsonify(response)

# This is for a batch of images prediction.
@app.route('/predict_batch', methods=['GET', 'POST'])
def predict_batch():
    global avgtime, time_array
    time_array = []
    avgtime = -1
    device = int(request.args.get('device', None))
    framework = int(request.args.get('framework', None))
    model = int(request.args.get('model', None))
    dataset = int(request.args.get('dataset', None))
    version = int(request.args.get('version', None))
    img_id = request.args.get('imgName', None)

    #If it is bigDL framework:
    if framework == Framework.BigDL:
        format = 0
        # Execute the batch "spark submit" command, and gather the output
        if version == Version.Batch_ImagePredictor:
            if device == Device.CPU_1:
                myCmd = os.popen(config['Default']['bigdl_batch_command_1']).read()
            elif device == Device.CPU_28:
                myCmd = os.popen(config['Default']['bigdl_batch_command_28']).read()
        else:
            format = 1
            if model == Model.FP32:
                myCmd = os.popen(config['Default']['bigdl_batch_command_fp32']).read()
            else:
                myCmd = os.popen(config['Default']['bigdl_batch_command_int8']).read()
        print("output:", myCmd)
        avgtime = parseOutput(myCmd, format)
    #Tensorflow on decathlon:
    if framework == Framework.TensorFlow and dataset == DataSet.Decathlon:
        avgtime = plot_inference_examples.predict_batch()
    
    print("average time is:", avgtime)
  
    # Send the response back to frontend.
    response = {"device": device, "framework": framework, "version": version, "model": model, "dataset": dataset, "imgName": img_id, "elapsed": avgtime}
    return jsonify(response)

if __name__ == '__main__':
    app.run(host=config['web']['host'], port = config['web']['port'], debug=True)
