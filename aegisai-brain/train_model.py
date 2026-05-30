import psutil
import numpy as np
from models.anomaly_model import AnomalyModel

model = AnomalyModel()

data = []

print("Collecting normal system data...")

for _ in range(200):

    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage("C:\\").percent
    process_count = len(psutil.pids())

    net = psutil.net_io_counters()
    net_sent = net.bytes_sent
    net_recv = net.bytes_recv

    data.append([
        cpu,
        memory,
        disk,
        process_count,
        net_sent,
        net_recv
    ])

data = np.array(data)

model.train(data)

print("✅ Model trained successfully with 6 features.")