import urllib.request
import zipfile
import os

url = 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip'
zip_file = 'maven.zip'
extract_dir = 'maven'

try:
    print("Downloading Maven...")
    urllib.request.urlretrieve(url, zip_file)

    print("Extracting Maven...")
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)

    print("Cleaning up...")
    os.remove(zip_file)
    print("Maven downloaded and extracted successfully!")
except Exception as e:
    print("Error during Maven setup:", e)
