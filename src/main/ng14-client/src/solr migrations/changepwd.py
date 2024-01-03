import requests

userId = "3aab26f8-23c6-4993-8673-0c1fd5cfae9f"
pwd = "098f6bcd4621d373cade4e832627b4f6"
# update user password

r = requests.get(
    f"http://localhost:8983/solr/user/select?fl=id&fq=id%3A%22{userId}%22&indent=true&q.op=OR&q=*%3A*&rows=100")
ids = r.json()

PARAMS = []
for user in ids["response"]["docs"]:
    # print(f"User {user['id']} with owner {owner['name']} -> {owner['id']}")
    PARAMS.append({"id": user["id"], "heslo": {"set": pwd}})
print("Updating user")
r = requests.post(url="http://localhost:8983/solr/user/update?commit=true", json=PARAMS)
response = r.json()
print(response)
