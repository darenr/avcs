import requests
import json
from requests.auth import HTTPBasicAuth
import time

payload = [
  {
  "addressid": "1", 
  "city": "redwood city", 
  "adminarea": "California", 
  "address1": "400 Oracle parkway", 
  "mode": "V", 
  "country": "US", 
  "minimumverificationlevel": "2",
  "charcase":"M",
  "minimumverificationmatchscore":"70",
  "allowedverificationresultcodes": "VPAU"
  }
]

headers = {'content-type': 'application/json'}


#origin_server = 'http://slcn09vmf0053.us.oracle.com:7767/av/api/v2/addressclean'
#username = 'avuser'
#password = 'welcome1'

origin_server = 'http://adc00qrw.us.oracle.com:7767/av/api/v2/addressclean'
username = 'daas_user1'
password = 'Welcome1'

t0 = time.time()
r = requests.post(origin_server, 
      auth=HTTPBasicAuth(username, password),
      headers = headers,
      data = json.dumps(payload)
)
t1 = time.time()
print r

#print json.dumps(r.json(), sort_keys=False, indent=4)
#print t1-t0

