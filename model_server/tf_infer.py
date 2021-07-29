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
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
#import psutil

model_path = 'resnet50_fp32_pretrained_model.pb'

class Infer():
    def __init__(self):
        self.graph = self.load_pb(model_path)

    def predict(self, dataset, img_name):
        full_path = '{}/{}'.format(dataset, img_name)
        img = image.load_img(full_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        #print('shape', x.shape)
        infer_time = self.infer_perf_run(x)
        cpu_rate = 0.0 #psutil.cpu_percent(1)
        return infer_time, cpu_rate

    def load_pb(self, model_file):
        infer_graph = tf.Graph()
        with infer_graph.as_default():
          graph_def = tf.compat.v1.GraphDef()
          with tf.compat.v1.gfile.FastGFile(model_file, 'rb') as input_file:
            input_graph_content = input_file.read()
            graph_def.ParseFromString(input_graph_content)

            output_graph = graph_def

          tf.import_graph_def(output_graph, name='')
        return infer_graph


    def infer_perf_run(self, x_test, input_l="input", output_l="predict"):
        graph = self.graph
        input_tensor = graph.get_tensor_by_name(input_l + ":0")
        output_tensor = graph.get_tensor_by_name(output_l + ":0")

        with tf.compat.v1.Session(graph=graph) as sess_graph:
            bt = 0
            bt = time.time()
            _predictions = sess_graph.run(output_tensor,
                                          {input_tensor: x_test})
            et = time.time()
            latency = (et - bt)
            #print('latency:', latency)
            return latency

if __name__=='__main__':
    infer = Infer()
    res = infer.predict('imagenet', 'ILSVRC2012_val_00000363.JPEG')
    print(res)






