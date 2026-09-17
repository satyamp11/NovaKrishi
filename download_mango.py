import urllib.request
import os

url = "https://images.unsplash.com/photo-1601493700465-9831c0e0e1eb?auto=format&fit=crop&w=600&q=80"
output_path = "C:/Users/ARPIT TIWARI/OneDrive/Documents/KishanMitra/KrishiSetu/frontend/public/images/crops/mango.jpg"

print(f"Downloading {url} to {output_path}")
urllib.request.urlretrieve(url, output_path)
print("Download complete!")
