from sqlalchemy import create_engine
from urllib.parse import quote_plus
import pandas as pd


DB_CONFIG = {
    "user": "root",
    "password": "Nandakumarpn@!",
    "host": "localhost",
    "database": "aegisai_db",
    "port": 3306
}


class DataLoader:

    def __init__(self):
        encoded_password = quote_plus(DB_CONFIG["password"])

        self.engine = create_engine(
            f"mysql+pymysql://{DB_CONFIG['user']}:{encoded_password}@"
            f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
        )

    def fetch_historical_data(self, limit=5000):
        query = f"""
            SELECT 
                cpu_usage,
                memory_usage,
                disk_usage,
                network_sent,
                network_received,
                process_count
            FROM system_metrics
            ORDER BY timestamp ASC
            LIMIT {limit}
        """
        df = pd.read_sql(query, self.engine)
        df.dropna(inplace=True)
        return df

    def fetch_latest_record(self):
        query = """
            SELECT 
                cpu_usage,
                memory_usage,
                disk_usage,
                network_sent,
                network_received,
                process_count
            FROM system_metrics
            ORDER BY timestamp DESC
            LIMIT 1
        """
        return pd.read_sql(query, self.engine)

    def fetch_latest_processes(self, limit=10):
        query = f"""
            SELECT 
                process_id,
                process_name,
                process_cpu_usage,
                process_memory_usage,
                execution_path
            FROM process_metrics
            ORDER BY timestamp DESC
            LIMIT {limit}
        """
        return pd.read_sql(query, self.engine)