import tensorflow as tf
import time
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import *
import json
import os
import sys

os.environ["CUDA_VISIBLE_DEVICES"] = ""

#gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.17)
#sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options))

print(tf.__version__)
id = sys.argv[1]
filename = 'logs/logs' + str(id) + '.txt'
print(filename)
global res
res = {}
class myCallback(tf.keras.callbacks.Callback):
  def on_train_begin(self, logs={}):
      self.epoch_time = 0
      self.epoch = 0

  def on_epoch_begin(self, epoch, logs={}):
      self.epoch_time_start = time.time()

  def on_epoch_end(self, epoch, logs={}):
      self.epoch_time = (time.time() - self.epoch_time_start)
      #print(self.epoch_time,logs.get("loss"))
      logs["epoch_time"] = self.epoch_time
      logs["epoch"] = self.epoch
      logs["loss"] = logs["loss"]
      self.epoch += 1
      with open(filename,"w") as f:
        json.dump(logs,f)  
    

callbacks = myCallback()
mnist = tf.keras.datasets.fashion_mnist
(training_images, training_labels), (test_images, test_labels) = mnist.load_data()
training_images=training_images/255.0
test_images=test_images/255.0
print(test_images[0].shape)
training_images = training_images.reshape(training_images.shape[0], 28, 28, 1)
test_images = test_images.reshape(test_images.shape[0], 28, 28, 1)

model = Sequential()
 
# lenet-5
#model.add(Convolution2D(filters=6, kernel_size=(5, 5), padding='valid', input_shape=(28, 28, 1), activation='tanh'))
#model.add(MaxPooling2D(pool_size=(2, 2)))
#model.add(Convolution2D(filters=16, kernel_size=(5, 5), padding='valid', activation='tanh'))
#model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Flatten())
#model.add(Dense(120, activation='tanh'))
#model.add(Dense(84, activation='tanh'))
model.add(Dense(10, activation='softmax'))
 
#打印模型# verbose=1显示进度条

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy',metrics = ['accuracy'])
model.fit(training_images, training_labels, epochs=10000, callbacks=[callbacks])
