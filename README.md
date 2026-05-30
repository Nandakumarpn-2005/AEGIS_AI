# 🛡️ AegisAI – Autonomous Self-Healing Infrastructure & Threat Intelligence System

## 📖 Overview

AegisAI is an AI-powered infrastructure monitoring and self-healing platform designed to improve system reliability, security, and operational efficiency. The system continuously monitors system resources, detects anomalies using machine learning, predicts potential failures, identifies suspicious activities, and automatically performs corrective actions.

---

## 🎯 Features

- Real-time system monitoring
- CPU, Memory, Disk, and Network tracking
- Process monitoring and analysis
- AI-based anomaly detection using Isolation Forest
- Failure risk prediction
- Suspicious process detection
- Automated self-healing actions
- Service restart automation
- Process termination automation
- Alert generation
- Dashboard integration support
- REST API support

---

## 🏗️ System Architecture

```text
Operating System
        │
        ▼
Data Collection Layer
(psutil Monitoring Agent)
        │
        ▼
MySQL Database
(system_metrics)
        │
        ▼
Intelligence Layer
(Isolation Forest + Decision Engine)
        │
        ▼
Automation Layer
(Self-Healing Actions)
        │
        ▼
Dashboard & Alerts
(Streamlit / FastAPI)
```

---

## 📂 Project Structure

```text
AegisAI/
│
├── data_collection/
│   ├── monitor.py
│   └── database.py
│
├── brain/
│   ├── config.py
│   ├── model_loader.py
│   ├── anomaly_detector.py
│   ├── risk_predictor.py
│   ├── process_monitor.py
│   ├── decision_engine.py
│   ├── automation.py
│   ├── logger.py
│   └── main_brain.py
│
├── dashboard/
│   └── app.py
│
├── models/
│   ├── isolation_forest_model.pkl
│   └── scaler.pkl
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## 🧠 Technologies Used

### Programming Language
- Python

### Machine Learning
- Scikit-Learn
- Isolation Forest

### Data Processing
- Pandas
- NumPy

### Visualization
- Streamlit
- Matplotlib
- Seaborn

### Database
- MySQL

### Monitoring
- psutil

### API Development
- FastAPI

---

## 📊 Database Tables

### system_metrics

Stores real-time system telemetry.

Columns:

- id
- timestamp
- cpu_usage
- memory_usage
- disk_usage
- network_sent
- network_received
- process_count

### process_metrics

Stores running process information.

Columns:

- id
- timestamp
- process_id
- process_name
- process_cpu_usage
- process_memory_usage
- execution_path

### anomaly_results

Stores AI predictions and actions.

Columns:

- id
- timestamp
- anomaly_status
- risk_level
- suspicious_process
- decision_taken

---

## 🤖 Machine Learning Workflow

1. Collect system metrics
2. Store data in MySQL
3. Clean and preprocess data
4. Normalize features using MinMaxScaler
5. Train Isolation Forest model
6. Save trained model and scaler
7. Perform real-time anomaly detection
8. Generate risk scores
9. Trigger self-healing actions

---

## 🔍 Anomaly Detection

The project uses Isolation Forest to identify abnormal system behavior.

### Features Used

- CPU Usage
- Memory Usage
- Disk Usage
- Network Sent
- Network Received
- Process Count

### Output

- Normal
- Confirmed Anomaly

---

## ⚠️ Risk Prediction Logic

### Rules

- CPU > 90% → +1
- Memory > 85% → +1
- Disk > 95% → +1

### Risk Levels

| Score | Risk |
|---------|---------|
| 0 | Low |
| 1 | Medium |
| 2+ | High |

---

## 🔧 Self-Healing Actions

### Automated Responses

- Restart services
- Kill suspicious processes
- Generate alerts
- Log incidents

### Example Rules

| Condition | Action |
|------------|---------|
| Confirmed anomaly + High risk | Restart Service |
| Suspicious process | Kill Process |
| Medium risk | Alert |
| Normal | No Action |

---

## 🚀 Installation

### Clone Repository

```bash
git clone <repository-url>
cd AegisAI
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Database

Update MySQL credentials in:

```python
config.py
```

### Run Monitoring Agent

```bash
python monitor.py
```

### Run Brain Engine

```bash
python main_brain.py
```

### Run Dashboard

```bash
streamlit run app.py
```

---

## 🎯 Project Outcome

AegisAI provides an intelligent and automated approach to infrastructure monitoring by detecting anomalies, predicting failures, identifying security threats, and performing self-healing actions to minimize downtime and improve system resilience.

---

## 👥 Team Responsibilities

### Member 1 – Data & Monitoring

- System monitoring using psutil
- Data collection
- Database management
- Telemetry pipeline

### Member 2 – Intelligence & Automation

- Anomaly detection
- Failure prediction
- Decision engine
- Self-healing automation

### Member 3 – Interface & Integration

- Streamlit dashboard
- Alert system
- API integration
- Visualization

---

## 📜 License

This project is developed for educational and research purposes.
