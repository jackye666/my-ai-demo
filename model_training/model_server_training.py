#!/usr/bin/env python
import os, sys, subprocess
from os import listdir
from os.path import isfile, join
import time

import urllib

import configparser
import random
from enum import IntEnum
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import json
import subprocess
import threading


# Read in the config file for some parameters.
config = configparser.ConfigParser()
config.read('config.ini')


app = Flask(__name__,
	static_url_path='',
        static_folder='static'
)
CORS(app)

global dic
dic = {}
dic["prev_check_time"] = 0
case_num = 4 
for i in range(case_num):
    case_id = "case" + str(i+1)
    dic[case_id] = {}

@app.route('/')
def root():
    return app.send_static_file('index_training.html')

@app.route('/training_config', methods=['GET', 'POST'])
def handle_training_config():
    res = {}
    for key in config["web"]:
        if key in ['host', 'port']:
            continue
        res[key] = config["web"][key]
    print(res)
    response ={"mod_servers":[res]}

    return jsonify(response)

@app.route('/training')
def training():
    print("begin training")
    cmd = "exec python training.py"
    for i in range(case_num):
        case_id = "case" + str(i+1)
        train = subprocess.Popen(cmd + " " + str(i+1) ,shell = True)
        dic[case_id]["train"] = train
        print("\n training in the process : %s"%case_id)
    return "training"

@app.route("/stop")
def stop():
    print("\n\n------------------------------stop training!!--------------------------\n\n")
    for i in range(case_num):
        case_id = "case" + str(i+1)
        dic[case_id]["train"].terminate()
    return "stop"

@app.route("/checking")
def check_log():
    #print("begin checking")
    if not os.path.exists("logs"):
        os.mkdir("logs")
    if len(os.listdir("logs"))!=case_num:
        for i in range(case_num):
            log_file = "logs/logs" + str(i + 1) + ".txt"
            with open(log_file,"w") as f:
                res =  {}
                json.dump(res,f)
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

if __name__ == '__main__':
    app.run(host=config['web']['host'], port = config['web']['port'], debug=True)

