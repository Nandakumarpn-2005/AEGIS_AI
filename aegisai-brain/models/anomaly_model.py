import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler


class AnomalyModel:

    def __init__(self):
        self.model = None
        self.scaler = None

    def train(self, data):
        """
        Train with 6 features:
        [cpu, memory, disk, process_count, net_sent, net_recv]
        """

        self.scaler = MinMaxScaler()
        scaled = self.scaler.fit_transform(data)

        self.model = IsolationForest(
            contamination=0.15,
            random_state=42
        )

        self.model.fit(scaled)

        joblib.dump(self.model, "models/isolation_model.pkl")
        joblib.dump(self.scaler, "models/scaler.pkl")

    def load(self):
        self.model = joblib.load("models/isolation_model.pkl")
        self.scaler = joblib.load("models/scaler.pkl")

    def predict(self, data):
        scaled = self.scaler.transform(data)
        return self.model.predict(scaled)