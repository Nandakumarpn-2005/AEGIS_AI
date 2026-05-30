from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import psutil
import os
import time
import datetime
import threading
import win32gui
import win32process
import GPUtil

import smtplib
from email.mime.text import MIMEText

from automation.actions import Actions
from logic.failure_predictor import FailurePredictor
from logic.decision_engine import DecisionEngine
from database import init_db, insert_metrics, get_history


app = FastAPI(title="AegisAI Brain API")

# ------------------------------------------------
# EMAIL TEST ENDPOINT
# ------------------------------------------------
@app.get("/test-email")
def test_email():

    send_email_alert(
        "AegisAI Test Email",
        "This is a test email from your AegisAI monitoring system."
    )

    return {"status": "Email test triggered"}

# ------------------------------------------------
# EMAIL ALERT SYSTEM (NEW)
# ------------------------------------------------
EMAIL_USER = "navaneethnavaneeth876@gmail.com"
EMAIL_PASS = "lkfgfkyviyuziduo"

EMAIL_COOLDOWN = 300
last_email_time = 0


def send_email_alert(subject, message):

    global last_email_time

    try:

        now = time.time()

        if now - last_email_time < EMAIL_COOLDOWN:
            return

        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = EMAIL_USER

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)

        server.sendmail(
            EMAIL_USER,
            EMAIL_USER,
            msg.as_string()
        )

        server.quit()

        last_email_time = now

        print("Email alert sent")

    except Exception as e:
        print("Email failed:", e)


# ------------------------------------------------
# INITIALIZE MODULES
# ------------------------------------------------
actions = Actions()
predictor = FailurePredictor()
decision_engine = DecisionEngine()

init_db()

# ------------------------------------------------
# SAFETY SETTINGS
# ------------------------------------------------
SAFE_CPU_LEVEL = 95

PROTECTED_PROCESSES = [
    "system",
    "system idle process",
    "services.exe",
    "wininit.exe",
    "lsass.exe",
    "csrss.exe",
    "smss.exe",
    "explorer.exe",
    "python.exe",
    "uvicorn.exe",
    "dwm.exe",
    "svchost.exe"
]

CURRENT_PID = os.getpid()
LAST_ACTION_TIME = 0
ACTION_COOLDOWN = 10


# ------------------------------------------------
# NETWORK / DISK TRACKING
# ------------------------------------------------
last_net = psutil.net_io_counters()
last_disk = psutil.disk_io_counters()

# ------------------------------------------------
# SYSTEM CACHE
# ------------------------------------------------
system_cache = {
    "cpu":0,
    "ram":0,
    "disk":0,
    "net":0,
    "disk_io":0,
    "process_count":0
}

# ------------------------------------------------
# PROCESS CACHE
# ------------------------------------------------
process_cache = []


# ------------------------------------------------
# BACKGROUND SYSTEM MONITOR
# ------------------------------------------------
def background_monitor():

    global system_cache
    global last_net
    global last_disk

    while True:

        try:

            cpu = psutil.cpu_percent(interval=None)
            ram = psutil.virtual_memory().percent
            disk = psutil.disk_usage("C:\\").percent
            process_count = len(psutil.pids())

            net_now = psutil.net_io_counters()

            net_speed = (
                (net_now.bytes_sent + net_now.bytes_recv)
                - (last_net.bytes_sent + last_net.bytes_recv)
            )

            last_net = net_now

            net_speed = round(net_speed/1024/1024,2)

            disk_now = psutil.disk_io_counters()

            disk_speed = (
                (disk_now.read_bytes + disk_now.write_bytes)
                - (last_disk.read_bytes + last_disk.write_bytes)
            )

            last_disk = disk_now

            disk_speed = round(disk_speed/1024/1024,2)

            system_cache = {
                "cpu":cpu,
                "ram":ram,
                "disk":disk,
                "net":net_speed,
                "disk_io":disk_speed,
                "process_count":process_count
            }

        except:
            pass

        time.sleep(2)


# ------------------------------------------------
# BACKGROUND PROCESS MONITOR
# ------------------------------------------------
def process_background_monitor():

    global process_cache

    while True:

        processes = []

        for proc in psutil.process_iter(['pid','name','memory_percent','create_time']):
            try:

                cpu = proc.cpu_percent(interval=None)

                runtime = time.time() - proc.info['create_time']

                processes.append({
                    "pid":proc.info['pid'],
                    "name":proc.info['name'],
                    "cpu":round(cpu,2),
                    "memory":round(proc.info['memory_percent'],2),
                    "runtime":round(runtime/60,1)
                })

            except:
                continue

        processes = sorted(processes,key=lambda x:x["cpu"],reverse=True)

        process_cache = processes[:50]

        time.sleep(3)


threading.Thread(target=background_monitor,daemon=True).start()
threading.Thread(target=process_background_monitor,daemon=True).start()


# ------------------------------------------------
# CORS
# ------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------
# STATUS
# ------------------------------------------------
@app.get("/status")
def get_status():

    global LAST_ACTION_TIME

    try:

        cpu = system_cache["cpu"]
        memory = system_cache["ram"]
        disk = system_cache["disk"]
        net_speed = system_cache["net"]
        disk_speed = system_cache["disk_io"]
        process_count = system_cache["process_count"]

        # EMAIL ALERT TRIGGER
        if cpu > 90:
            send_email_alert(
                "AegisAI ALERT",
                f"""
High CPU usage detected

CPU: {cpu}%
RAM: {memory}%
Disk: {disk}%

Time: {datetime.datetime.now()}
"""
            )

        risk = predictor.calculate_risk(cpu,memory,disk,process_count)

        decision = decision_engine.decide(False,risk)

        current_time = time.time()

        if cpu >= SAFE_CPU_LEVEL:

            if current_time - LAST_ACTION_TIME > ACTION_COOLDOWN:

                if decision == "KILL_PROCESS":
                    kill_memory_priority_process()
                    LAST_ACTION_TIME = current_time

        timestamp = datetime.datetime.now().strftime("%H:%M:%S")

        data = {
            "time":timestamp,
            "cpu":round(cpu,1),
            "ram":round(memory,1),
            "memory":round(memory,1),
            "disk":round(disk,1),
            "net":net_speed,
            "disk_io":disk_speed,
            "process_count":process_count,
            "risk":risk,
            "decision":decision
        }

        insert_metrics(data)

        return data

    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


# ------------------------------------------------
# HISTORY
# ------------------------------------------------
@app.get("/history")
def history():
    return get_history()


# ------------------------------------------------
# PROCESSES
# ------------------------------------------------
@app.get("/processes")
def get_processes():
    return process_cache


# ------------------------------------------------
# PROCESS THREATS
# ------------------------------------------------
@app.get("/process-threats")
def process_threats():
    return process_cache[:20]


# ------------------------------------------------
# NETWORK
# ------------------------------------------------
@app.get("/network")
def network():

    net = psutil.net_io_counters()

    return {
        "sent":net.bytes_sent,
        "received":net.bytes_recv
    }


# ------------------------------------------------
# DISK ACTIVITY
# ------------------------------------------------
@app.get("/disk-activity")
def disk_activity():

    disk = psutil.disk_io_counters()

    return {
        "read":disk.read_bytes,
        "write":disk.write_bytes
    }


# ------------------------------------------------
# SYSTEM INFO
# ------------------------------------------------
@app.get("/system-info")
def system_info():

    boot = psutil.boot_time()

    uptime = int(time.time() - boot)

    return {
        "cpu_cores":psutil.cpu_count(),
        "logical_cores":psutil.cpu_count(logical=True),
        "uptime":uptime
    }


# ------------------------------------------------
# GPU MONITOR
# ------------------------------------------------
@app.get("/gpu")
def gpu_stats():

    gpus = GPUtil.getGPUs()

    data = []

    for gpu in gpus:

        data.append({
            "name":gpu.name,
            "load":round(gpu.load*100,2),
            "memory":round(gpu.memoryUtil*100,2),
            "temperature":gpu.temperature
        })

    return data


# ------------------------------------------------
# CPU CORES
# ------------------------------------------------
@app.get("/cpu-cores")
def cpu_cores():

    cores = psutil.cpu_percent(percpu=True)

    result = []

    for i,val in enumerate(cores):

        result.append({
            "core":i,
            "usage":val
        })

    return result


# ------------------------------------------------
# ANOMALY DETECTION
# ------------------------------------------------
@app.get("/anomaly")
def anomaly_detection():

    cpu = system_cache["cpu"]
    ram = system_cache["ram"]

    status = "Normal"

    if cpu>85 or ram>85:
        status="Critical"

    elif cpu>70 or ram>70:
        status="Warning"

    return {
        "cpu":cpu,
        "ram":ram,
        "status":status
    }


# ------------------------------------------------
# ALERTS
# ------------------------------------------------
@app.get("/alerts")
def alerts():

    alerts=[]

    cpu=system_cache["cpu"]
    ram=system_cache["ram"]
    disk=system_cache["disk"]

    now=datetime.datetime.now().strftime("%H:%M:%S")

    if cpu>80:
        alerts.append({
            "level":"warning",
            "type":"CPU",
            "message":f"High CPU usage ({cpu}%)",
            "time":now
        })

    if ram>80:
        alerts.append({
            "level":"warning",
            "type":"RAM",
            "message":f"High RAM usage ({ram}%)",
            "time":now
        })

    if disk>90:
        alerts.append({
            "level":"critical",
            "type":"DISK",
            "message":f"Disk almost full ({disk}%)",
            "time":now
        })

    return alerts


# ------------------------------------------------
# PROCESS KILLER
# ------------------------------------------------
def get_foreground_pid():

    try:
        hwnd=win32gui.GetForegroundWindow()
        _,pid=win32process.GetWindowThreadProcessId(hwnd)
        return pid
    except:
        return None


def kill_memory_priority_process():

    active_pid=get_foreground_pid()

    candidates=[]

    for proc in psutil.process_iter(['pid','name']):

        try:

            pid=proc.info['pid']
            name=proc.info['name']

            if not name:
                continue

            if pid==CURRENT_PID:
                continue

            if name.lower() in PROTECTED_PROCESSES:
                continue

            cpu=proc.cpu_percent(interval=None)
            mem=proc.memory_percent()

            score=(mem*3)+cpu

            if mem>1 or cpu>5:
                candidates.append((score,proc))

        except:
            continue

    if not candidates:
        return

    candidates.sort(reverse=True,key=lambda x:x[0])

    target=candidates[0][1]

    try:
        target.kill()
    except:
        pass


# ------------------------------------------------
# MANUAL PROCESS KILL
# ------------------------------------------------
@app.post("/kill-process/{pid}")
def kill_process(pid:int):

    try:

        process=psutil.Process(pid)

        name=process.name().lower()

        if name in PROTECTED_PROCESSES:

            return {"status":"blocked","message":f"{name} protected"}

        try:
            process.terminate()

        except:
            process.kill()

        return {
            "status":"terminated",
            "pid":pid,
            "process":name
        }

    except Exception as e:

        return {
            "status":"error",
            "message":str(e)
        }