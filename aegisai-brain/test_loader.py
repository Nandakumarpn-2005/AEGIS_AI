from data.data_loader import DataLoader

loader = DataLoader()

df = loader.fetch_historical_data(limit=100)

print(df.head())
print("Shape:", df.shape)