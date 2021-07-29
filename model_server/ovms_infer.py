import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ["KMP_BLOCKTIME"] = "1"
os.environ["KMP_SETTINGS"] = "0"
os.environ["OMP_NUM_THREADS"] = str(24)
os.environ["TF_NUM_INTEROP_THREADS"] = str(1)
os.environ["TF_NUM_INTRAOP_THREADS"] = str(24)

import tensorflow as tf
tf.compat.v1.disable_eager_execution()

import numpy as np
import time
import json
from tensorflow.keras.preprocessing import image
#from tensorflow.keras.applications.resnet50 import preprocess_input
#import psutil
import grpc
import cv2
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc

class Infer():
    def __init__(self):
        server_ip='127.0.0.1'
        port='9002'
        channel = grpc.insecure_channel(server_ip + ':' + port)
        self.stub = prediction_service_pb2_grpc.PredictionServiceStub(channel)
        self.request = predict_pb2.PredictRequest()
        self.request.model_spec.name='resnet50'
        self.request.model_spec.signature_name='serving_default'

    def predict(self, dataset, img_name):
        tt = time.time()
        full_path='{}/{}'.format(dataset, img_name)
        if not os.path.exists(full_path):
            return 1.0, 0.0

        img_data = cv2.imread(full_path)
        image = cv2.resize(img_data, (224, 224))
        image = image.astype('float32')
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = image.transpose(2,0,1).reshape(1, 3, 224, 224)
        tensor = tf.make_tensor_proto(image, shape=(image.shape))
        self.request.inputs['input_tensor'].CopyFrom(tensor)
        response = self.stub.Predict(self.request, 30.0)
        infer_time = time.time() - tt
        print("Infer FP32 time is: %.5fs" % infer_time)
        cpu_rate = 0.0
        return infer_time, cpu_rate

if __name__=='__main__':
    infer = Infer()
    res = infer.predict('imagenet', 'ILSVRC2012_val_00000363.JPEG')
    print(res)






