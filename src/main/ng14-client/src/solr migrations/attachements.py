import requests

vydani = [
    {"id": 0, "name": ""},
    {"id": 1, "name": "morning"},
    {"id": 2, "name": "midday"},
    {"id": 3, "name": "afternoon"},
    {"id": 4, "name": "evening"},
    {"id": 5, "name": "special"},
    {"id": 7, "name": "periodic_attachment"},
    {"id": 6, "name": "attachment"}
]

for v in vydani:
    r = requests.get(
        f"http://localhost:8983/solr/exemplar/select?fl=id&fq=vydani%3A%22{v['name']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
    ids = r.json()

    PARAMS = []
    for ex in ids["response"]["docs"]:
        print(f"Exemplar {ex['id']} with vydani {v['name']} -> {v['id']}")
        PARAMS.append({"id": ex["id"], "vydani": {"set": v["id"]}})
    print("Updating exemplars")
    r = requests.post(url="http://localhost:8983/solr/exemplar/update?commit=true", json=PARAMS)
    response = r.json()
    print(response)
