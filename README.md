# Intel AI Perforemance Demo

## Background

This project is forked from [ai-demo-backend](https://gitlab.devtools.intel.com/ltsai1/ai-demo-backend) and [ai-demo-frontend](https://gitlab.devtools.intel.com/ltsai1/ai-demo-frontend).

The structure is changed more to enhance the extention capability to support more AI model nodes.


## Purpose

This project shows Intel AI performance based on difference Hardware, AI framework, Model and Data Type.

It could be deployed in private lab servers and public cloud.

## Structure

```
Web client <====HTTP====> Access Server <====HTTP====> Model Server1
                                        <====HTTP====> Model Server2
                                                            ...
                                        <====HTTP====> Model ServerN
```
                              

## Usage

### Setup

#### Running environment

Create a venv **ai_demo**

Run 
```
cd access_server
./ut.sh

```

### Startup Service

#### Access Server

```
cd access_server
source ai_demo/bin/activate
python access_server.py

```

Access will be started up and listen on port 8000 (default)

#### Model Server

```
cd model_server
source ai_demo/bin/activate
python model_svr.py


cd model_server_2
source ai_demo/bin/activate
python model_svr.py

```

Two model servers will be started up and listen on port 8001, 8002 (default)

### Run Demo

Access server will bind IP as IP1.

Open url "http://127.0.0.1:8000" or "http://IP1:8000" in web brower.



