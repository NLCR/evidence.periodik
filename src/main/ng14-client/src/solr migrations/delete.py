import requests

r = requests.get(
  f"http://localhost:8983/solr/exemplar/select?q=-carovy_kod:["" TO *]&rows=100000")
ids = r.json()

PARAMS = []
for exemplar in ids["response"]["docs"]:
  print(f"Exemplar with id: {exemplar['id']} will be removed")
  PARAMS.append({"id": exemplar["id"]})
print("Deleting exemplars")
r = requests.post(url="http://localhost:8983/solr/exemplar/delete?commit=true", json=PARAMS)
response = r.json()
print(response)
