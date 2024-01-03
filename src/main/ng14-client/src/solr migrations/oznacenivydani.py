import requests

oznaceni = [
    {"old_value": "*", "value": "★"},
    {"old_value": "**", "value": "★★"},
    {"old_value": "***", "value": "★★★"},
    {"old_value": "****", "value": "★★★★"},
    {"old_value": "*****", "value": "★★★★★"},
    {"old_value": "******", "value": "★★★★★★"},
]

for v in oznaceni:
    r = requests.get(
        f"http://localhost:8983/solr/exemplar/select?fl=id&fq=znak_oznaceni_vydani%3A%22{v['old_value']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
    ids = r.json()

    PARAMS = []
    for ex in ids["response"]["docs"]:
        print(f"Exemplar {ex['id']} with mutation mark {v['old_value']} -> {v['value']}")
        PARAMS.append({"id": ex["id"], "znak_oznaceni_vydani": {"set": v["value"]}})
    print("Updating exemplars")
    r = requests.post(url="http://localhost:8983/solr/exemplar/update?commit=true", json=PARAMS)
    response = r.json()
    print(response)

    r = requests.get(
        f"http://localhost:8983/solr/svazek/select?fl=id&fq=znak_oznaceni_vydani%3A%22{v['old_value']}%22&indent=true&q.op=OR&q=*%3A*&rows=1000000")
    ids = r.json()

    PARAMS = []
    for ex in ids["response"]["docs"]:
        print(f"Volume {ex['id']} with mutation mark {v['old_value']} -> {v['value']}")
        PARAMS.append({"id": ex["id"], "znak_oznaceni_vydani": {"set": v["value"]}})
    print("Updating volumes")
    r = requests.post(url="http://localhost:8983/solr/svazek/update?commit=true", json=PARAMS)
    response = r.json()
    print(response)
