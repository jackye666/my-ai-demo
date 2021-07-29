#!/usr/bin/env python
import os, sys, subprocess, threading
from os import listdir
from os.path import isfile, join
import time

import urllib

import configparser
import random
from enum import IntEnum
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

# Read in the config file for some parameters.
config = configparser.ConfigParser()
config.read('config.ini')
sim = config['web']['sim']

app = Flask(__name__,
	static_url_path='',
        static_folder='static'
)
CORS(app)

latest_perf_buf={}


global dic
dic = {}
dic["prev_check_time"] = 0
case_num = 4
for i in range(case_num):
    case_id = "case" + str(i+1)
    dic[case_id] = {}
dic["model_name"] = ""

watchdog_check_time = 5
def watch_dog():
    print("watch dog start !!!!")
    dic["stop_watchdog"] = False
    cnt = 0
    while True:
        print("\n%d\n"%cnt)
        time.sleep(watchdog_check_time)
        with open("frontend_status.txt","r") as f:
            d = json.load(f)
        prev_t = d["prev_time"]
        if prev_t != 0 and prev_t == dic["prev_check_time"]:
            print("\n\nfrontend disconnect!\n\n")
            stop_training()
            break
        else:
            dic["prev_check_time"] = prev_t
        if dic["stop_watchdog"]:
            break
        cnt = cnt + 1

    print("\n\nwatch dog stop !!!\n\n")



@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/local_img_list', methods=['GET', 'POST'])
def handle_local_img_list():
    global latest_perf_buf
    latest_perf_buf={}
    dataset_name = request.args.get('dataset_name', None)
    folder = "static/dataset/{}".format(dataset_name)

    res = {'dataset_name': dataset_name}

    onlyfiles = [f for f in listdir(folder) if isfile(join(folder, f))]
    onlyfiles.sort(reverse=False)
    files = ",".join(onlyfiles)
    res['img_list'] = files
    print("latest_perf_buf=", latest_perf_buf)
    print(res)

    response = res

    return jsonify(response)

def http_req(config, model_name, act):
    host = config[model_name]['host']
    port = config[model_name]['port']
    url = "http://{}:{}/{}".format(host,port, act)
    #print(url)
    session = requests.Session()
    session.trust_env = False

    headers = {'User-Agent': 'Mozilla/5.0'}

    try:
        response = session.get(url, headers=headers)
        res = json.loads(response.content)
        print(res)
    except:
        res = {}
    return res

def sim_config():
    ms1 = {"dataset": "imagenet", "framework": "tensorflow",
             "hw": "Skylake(6180)", "model": "Resnet50",
             "name": "mod_sky_tf_resent50_fp32", "type": "FP32"};
    ms2 = {"dataset": "imagenet", "framework": "tensorflow",
             "hw": "Skylake(6180)", "model": "Resnet50",
             "name": "mod_sky_tf_resent50_int8", "type": "INT8"}
    ms3 = {"dataset": "imagenet", "framework": "tensorflow",
             "hw": "Skylake(6180)", "model": "YOLOv3",
             "name": "mod_sky_tf_resent50_fp32", "type": "FP32"}
    ms4 = {"dataset": "imagenet", "framework": "tensorflow",
             "hw": "Skylake(6180)", "model": "YOLOv3",
             "name": "mod_sky_tf_resent50_int8", "type": "INT8"}
    res = {"mod_servers":[ms1, ms2, ms3, ms4]}


    return res


@app.route('/config', methods=['GET', 'POST'])
def handle_config():
    res = []
    if sim=='yes':
        response = sim_config()
        return jsonify(response)

    for sec in config.sections():
        if sec[:3]!='mod':
            continue
        mod = {}
        name = sec
        mod['name'] = sec
        res_config = http_req(config, name, "config")
        print(res_config)
        if len(res_config)==0:
            continue

        for key in res_config.keys():
            print(key)
            if key in ['host', 'port']:
                continue
            mod[key]=res_config[key]


        res.append(mod)
    print(res)
    response = {"mod_servers": res}

    return jsonify(response)


def http_predict(node_name, dataset, img_name):
    res = http_req(config, node_name,  \
        "predict?node_name={}&dataset={}&img_name={}".format( \
        node_name, dataset, img_name))

    if len(res)==0:
        infer_time = 0.0
        cpu_rate = 0.0
    else:
        infer_time = res['infer_time']
        cpu_rate = res['cpu_rate']
    return {'infer_time': infer_time,
            'cpu_rate': cpu_rate}

#    return {'infer_time':random.uniform(0, 1),
#            'cpu_rate':random.uniform(0, 1)}

def sim_http_predict(node_name, model):
    quick = 1
    if node_name =="mod_sky_tf_resent50_fp32":
        if quick==1:
            infer_time = 0.010+random.uniform(-0.002, 0.002)
        else:
            infer_time = 1.510+random.uniform(-0.002, 0.002)
    else:
        if quick == 1:
            infer_time = 0.004+random.uniform(-0.001, 0.001)
        else:
            infer_time = 0.75+random.uniform(-0.002, 0.002)

    time.sleep(infer_time)
    res = {"cpu_rate": 0, "infer_time": infer_time}
    if model == 'YOLOv3':
        y1 = 0.1 + random.uniform(-0.1, 0.1)
        x1 = 0.1 + random.uniform(-0.1, 0.1)
        y2 = 0.8 + random.uniform(-0.2, 0.2)
        x2 = 0.8 + random.uniform(-0.2, 0.2)
        res['rect']=[y1, x1, y2, x2]
    return res

#This is for a single image prediction
@app.route('/predict', methods=['GET', 'POST'])
def handle_predict():
    node_name = request.args.get('node_name', None)
    img_name = request.args.get('img_name', None)
    dataset = request.args.get('dataset', None)
    model = request.args.get('model', None)
    framework = request.args.get('framework', None)
    model_type = request.args.get('model_type', None)
    hw = request.args.get('hw', None)
    if sim == 'yes':
        res = sim_http_predict(node_name, model)
    else:
        res = http_predict(node_name, dataset, img_name)
    res.update({"node_name": node_name, "img_name": img_name})
    latest_perf_buf[node_name] = res
    latest_perf_buf[node_name]['dataset'] = dataset
    latest_perf_buf[node_name]['model'] = model
    latest_perf_buf[node_name]['framework'] = framework
    latest_perf_buf[node_name]['model_type'] = model_type
    latest_perf_buf[node_name]['hw'] = hw
    response = res
    #print(response)
    return jsonify(response)

@app.route('/latest_perf_data', methods=['GET', 'POST'])
def handle_latest_perf_buf():
    global latest_perf_buf
    return jsonify(latest_perf_buf)

@app.route('/training_config', methods=['GET', 'POST'])
def handle_training_config():
    res = []
    if sim=='yes':
        response = sim_config()
        return jsonify(response)

    for sec in config.sections():
        if sec[:3]!='mod':
            continue
        mod = {}
        name = sec
        mod['name'] = sec
        res_config = http_req(config, name, "training_config")
        print("this is res_config: %s !!!!!!!!!!!!!!!!!!\n"%res_config)
        if len(res_config)==0:
            continue
        res_config = res_config["mod_servers"][0]
        for key in res_config.keys():
            mod[key]=res_config[key]
        res.append(mod)
    print(res)
    response = {"mod_servers": res}

    return jsonify(response)
@app.route("/get_node_name")
def get_node_name():
    dic["model_name"] = request.args.get("model_name",None)
    print("model name is %s !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n"%dic["model_name"])
    return "model_name"


@app.route('/training')
def training():
    print("begin training")
    if sim == "yes":
        cmd = "exec python ../sim_training.py"
        for i in range(case_num):
            case_id = "case" + str(i+1)
            train = subprocess.Popen(cmd + " " + str(i+1) ,shell = True)
            dic[case_id]["train"] = train
            print("\n training in the process : %s"%case_id)
        watcher_thread = threading.Thread(target=watch_dog)
        watcher_thread.start()
        dic["watcher_thread"] = watcher_thread
        return "sim_training"
    else: 
        watcher_thread = threading.Thread(target=watch_dog)
        watcher_thread.start()
        dic["watcher_thread"] = watcher_thread
        http_req(config, dic["model_name"], "training")
        return "training"

@app.route("/stop_training")
def stop_training():
    if sim == "yes":
        print("\n------------------------------stop training!!--------------------------")
        for i in range(case_num):
            case_id = "case" + str(i+1)
            dic[case_id]["train"].terminate()
        dic["stop_watchdog"] = True
        return "stop"
    else:
        dic["stop_watchdog"] = True
        http_req(config,dic["model_name"], "stop")
        return "stop_training"

@app.route("/checking")
def check_log():
    res = {}
    if not os.path.exists("logs"):
        os.mkdir("logs")
    if not os.path.isfile("frontend_status.txt"):
        with open("frontend_status.txt","w") as f:
            json.dump(res,f)
   # print(os.listdir("logs"))
    if len(os.listdir("logs")) != case_num:
        for i in range(case_num):
            filename = "logs/logs"+ str(i+1) + ".txt"
            with open(filename, "w") as f:
                json.dump(res, f)
    
    if request.method == 'GET':
        with open("frontend_status.txt","w") as f:
            res = {}
            res["prev_time"] = time.time()
            json.dump(res, f)
    
    if sim == "yes":
        for i in range(case_num):
            filename = "logs/logs"+ str(i+1) + ".txt"
            res={}
            res["info"] = ""
            res["case_num"] = case_num
            with open(filename,"r") as f:
               d = json.load(f)
            case_id = "case" + str(i+1)
            if d == {}:
               res["info"] = "check"
               res["case_id"] = case_id
               return res
            cur_epoch = d["epoch"]
            if "epoch" not in dic[case_id].keys():
               dic[case_id]["epoch"] = -1
            if dic[case_id]["epoch"] != cur_epoch :
               dic[case_id]["epoch"]  = cur_epoch
               res["info"] = "logs info changed"
               res["log"] = d
               res["case_id"] = case_id
               return res
        return res
    else:
        res = {}
        res["info"] = ""
        res["case_num"] = case_num
        res["case_id"] = "case0"
        print("model name is %s"%dic["model_name"])
        if dic["model_name"] != "":
            res = http_req(config, dic["model_name"], "checking")
        return res

if __name__ == '__main__':
    print("sim is %s"%sim)
    app.run(host=config['web']['host'], port = config['web']['port'], debug=True)
