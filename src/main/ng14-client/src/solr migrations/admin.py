import requests

r = requests.get(
  f"http://localhost:8983/solr/user/select?fl=id&fq=id%3A%224298187b-bbd2-4b72-8433-0f316c4c2c8c%22&indent=true&q.op=OR&q=*%3A*&rows=100")
ids = r.json()

PARAMS = []
for user in ids["response"]["docs"]:
    PARAMS.append({"id": user["id"], "role": {"set": "admin"}})
print("Updating users")
r = requests.post(url="http://localhost:8983/solr/user/update?commit=true", json=PARAMS)
response = r.json()
print(response)
