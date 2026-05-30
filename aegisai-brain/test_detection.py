from data.data_loader import DataLoader
from models.anomaly_model import AnomalyModel

loader = DataLoader()
model = AnomalyModel()

# Load trained model
model.load()

# Fetch latest record
latest = loader.fetch_latest_record()

prediction = model.predict(latest)

if prediction[0] == -1:
    print("🚨 Anomaly Detected")
else:
    print("✅ System Normal")