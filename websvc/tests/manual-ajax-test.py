import requests
import json
import time

# Replace the URL with the endpoint of the server you want to test
url = 'https://simba.publicinterest.ai/simba/api/sum-extract'

# Define the data you want to send in the AJAX call
data = json.loads(open("example-dinnerstein.json").read())

st = time.time()
response = requests.post(url, data=data)

# Check that the server responded with a success status code
print("Responded with:", response.status_code, "in: ", time.time() - st)
assert response.status_code == 200

# Check that the server responded with the expected content
print(response.json())
assert set(response.json().keys()) == {'output', 'uuid'}
assert type(response.json()['output']) is list
assert type(response.json()['output'][0]) is str
