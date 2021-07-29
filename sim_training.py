import json
import os
import sys
import random
import time
import math

id = sys.argv[1]
filename = 'logs/logs' + str(id) + '.txt'
#filename = "logs.txt"
logs = {}
#logs["accuracy"] = 0.7+random.randint(1,500)/100000
#logs["loss"] = 1 + random.randint(1,500)/1000
#logs["epoch_time"] = 1.7+random.randint(1,700)/1000
#logs["epoch"] = 0
e = 1 
while True: 
    rad_x = e / (2*math.pi)
    logs["accuracy"] = math.atan(e/5)/(0.5*math.pi)*(1+random.randint(1,100)/10000)
    logs["loss"] = 1 + random.randint(1,500)/10000 - 0.5 * math.atan(e/5)/(0.5*math.pi)
    logs["epoch_time"] = 1.7+random.randint(1,700)/1000
    logs["epoch"] = e
    time.sleep(logs["epoch_time"])
    with open(filename,"w") as f:
        json.dump(logs,f)
    print(logs)
    e += 1

