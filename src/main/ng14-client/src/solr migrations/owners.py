# importing the requests library
import time

import requests

owners = [
  {"id": 0, "name": "NKP", "sigla": "ABA001"},
  {"id": 1, "name": "MZK", "sigla": "BOA001"},
  {"id": 2, "name": "VKOL", "sigla": "OLA001"},
  {"id": 3, "name": "SVKUL", "sigla": "ULG001"}
]

for owner in owners:
  # update exemplars

  r = requests.get(
    f"http://localhost:8983/solr/exemplar/select?fl=id&fq=vlastnik%3A%22{owner['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
  ids = r.json()

  PARAMS = []
  for ex in ids["response"]["docs"]:
    print(f"Exemplar {ex['id']} with owner {owner['name']} -> {owner['id']}")
    PARAMS.append({"id": ex["id"], "vlastnik": {"set": owner["id"]}})

  r = requests.post(url="http://localhost:8983/solr/exemplar/update?commit=true", json=PARAMS)
  response = r.json()
  print(response)

  # update volumes

  # method 1
  # r = requests.get(f"http://localhost:8983/solr/svazek/select?fl=id&fq=vlastnik%3A%22{owner['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
  # ids = r.json()

  # PARAMS = []
  # for ex in ids["response"]["docs"]:
  #   print(f"Svazek {ex['id']} with owner {owner['name']} -> {owner['id']}")
  #   PARAMS.append({"id": ex["id"], "vlastnik": {"set": owner["id"]}})

  # r = requests.post(
  #   url="http://localhost:8983/solr/svazek/update?overwrite=true&failOnVersionConflicts=false&commit=true", json=PARAMS)
  # response = r.json()
  # print(response)

  # method 2

  # ENABLE BODY STRAM!!!
  # curl -H
  # 'Content-type:application/json' -d
  # '{"set-property": {"requestDispatcher.requestParsers.enableRemoteStreaming": true}, "set-property": {"requestDispatcher.requestParsers.enableStreamBody": true}}'
  # http: //localhost:8983/solr/svazek/config

  r = requests.get(f"http://localhost:8983/solr/svazek/select?fq=vlastnik%3A%22{owner['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
  volumes = r.json()
  editedVolumes = []

  for volume in volumes["response"]["docs"]:
    newVolume = volume
    newVolume["vlastnik"] = owner["id"]
    editedVolumes.append(newVolume)
    print(f"Svazek {newVolume['id']} with owner {owner['name']} -> {owner['id']}")

  # delete all volumes because of atomic update error
  print("Deleting")
  headers = {'Content-type': 'application/json'}
  r = requests.post(url=f"http://localhost:8983/solr/svazek/update?stream.body=<delete><query>vlastnik:{owner['name']}</query></delete>&commit=true", headers=headers)
  response = r.json()
  print(response)
  time.sleep(5)
  print("Inserting")
  r = requests.post(url="http://localhost:8983/solr/svazek/update?overwrite=true&failOnVersionConflicts=false&commit=true", json=editedVolumes)
  response = r.json()
  print(response)

  # update users

  r = requests.get(
     f"http://localhost:8983/solr/user/select?fl=id&fq=owner%3A%22{owner['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=100")
  ids = r.json()

  PARAMS = []
  for user in ids["response"]["docs"]:
     print(f"User {user['id']} with owner {owner['name']} -> {owner['id']}")
     PARAMS.append({"id": user["id"], "owner": {"set": owner["id"]}})

  r = requests.post(url="http://localhost:8983/solr/user/update?commit=true", json=PARAMS)
  response = r.json()
  print(response)
