import requests

r = requests.get(
    f"http://localhost:8983/solr/exemplar/select?q=-carovy_kod:['' TO *]&rows=100000")
ids = r.json()

PARAMS = []
for exemplar in ids["response"]["docs"]:
    print(f"Exemplar with id: {exemplar['id']} will be removed")
    PARAMS.append(f"<id>{exemplar['id']}</id>")
if len(PARAMS):
    print("Deleting exemplars")
    url = "http://localhost:8983/solr/exemplar/update?commit=true"
    headers = {'Content-Type': 'application/xml'}
    r = requests.post(url=url, headers=headers, data=f"<delete>{''.join(PARAMS)}</delete>")
    response = r.json()
    print(response)
else:
    print("No exemplars found")

# Delete volume
r = requests.get(
    f"http://localhost:8983/solr/svazek/select?q=carovy_kod:265A005194&rows=100000")
ids = r.json()

PARAMS = []
for volume in ids["response"]["docs"]:
    print(f"Volume with id: {volume['id']} will be removed")
    PARAMS.append(f"<id>{volume['id']}</id>")
if len(PARAMS):
    print("Deleting volumes")
    url = "http://localhost:8983/solr/volume/update?commit=true"
    headers = {'Content-Type': 'application/xml'}
    r = requests.post(url=url, headers=headers, data=f"<delete>{''.join(PARAMS)}</delete>")
    response = r.json()
    print(response)
else:
    print("No volumes found")
