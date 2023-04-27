import requests

mutace = [
  {"id": 0, "name": ""},
  {"id": 0, "name": " "},
  {"id": 1, "name": "Brno"},
  {"id": 2, "name": "Praha"},
  {"id": 3, "name": "Ostrava"},
]

for v in mutace:
  r = requests.get(
    f"http://localhost:8983/solr/exemplar/select?fl=id&fq=mutace%3A%22{v['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
  ids = r.json()

  PARAMS = []
  for ex in ids["response"]["docs"]:
    print(f"Exemplar {ex['id']} with mutation {v['name']} -> {v['id']}")
    PARAMS.append({"id": ex["id"], "mutace": {"set": v["id"]}})
  print("Updating exemplars")
  r = requests.post(url="http://localhost:8983/solr/exemplar/update?commit=true", json=PARAMS)
  response = r.json()
  print(response)

  r = requests.get(
    f"http://localhost:8983/solr/svazek/select?fl=id&fq=mutace%3A%22{v['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
  ids = r.json()

  PARAMS = []
  for ex in ids["response"]["docs"]:
    print(f"Volume {ex['id']} with mutation {v['name']} -> {v['id']}")
    PARAMS.append({"id": ex["id"], "mutace": {"set": v["id"]}})
  print("Updating volumes")
  r = requests.post(url="http://localhost:8983/solr/svazek/update?commit=true", json=PARAMS)
  response = r.json()
  print(response)


