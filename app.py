import os.path
from flask import Flask, request, send_from_directory, jsonify, make_response
import requests
import json
from requests.auth import HTTPBasicAuth
import time

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def root():
  return app.send_static_file('index.htm')

@app.route("/code-text")
def a_plain_text_route():
    response = make_response('foo')
    response.headers["content-type"] = "text/plain"
    return response

@app.route('/v1.0/proxy', methods=['POST'])
def proxy():
    if not request.json \
      or 'mode' not in request.json \
      or 'origin_server' not in request.json \
      or 'username' not in request.json \
      or 'password' not in request.json \
      or 'country' not in request.json:
        print request.json
        abort(400)

    if request.json['mode'] == 'S':
      if 'address1' not in request.json:
        print request.json
        abort(400)

    if request.json['mode'] == 'V':
      if 'address1' not in request.json \
      or 'adminarea' not in request.json \
      or 'postalcode' not in request.json \
      or 'minimumverificationlevel' not in request.json \
      or 'city' not in request.json:
        print request.json
        abort(400)


    if request.json['mode'] == 'S':
      payload = [
        {
          "addressid": "1",
          "address1": request.json['address1'],
          "country": request.json['country'],
          "charcase":"M",
          "mode": 'S',
          "minimumverificationmatchscore":"70",
          "allowedverificationresultcodes": 'V'
        }
      ]
    else:
      payload = [
        {
          "addressid": "1",
          "address1": request.json['address1'],
          "address2": request.json['address2'],
          "country": request.json['country'],
          "city": request.json['city'],
          "adminarea": request.json['adminarea'],
          "postalcode": request.json['postalcode'],
          "minimumverificationlevel": request.json['minimumverificationlevel'],
          "charcase":"M",
          "mode": 'V',
          "minimumverificationmatchscore":"70",
          "allowedverificationresultcodes": 'PVAU'
        }
      ]
  
    print payload

    headers = {'content-type': 'application/json'}

    t0 = time.time()
    response = requests.post(request.json['origin_server'], 
      auth=HTTPBasicAuth(request.json['username'].strip(), request.json['password'].strip()),
      headers = headers,
      data = json.dumps(payload)
    )
    t1 = time.time()

    api_result = {
      "duration_ms": int(1000*(t1-t0)),
      "request": payload,
      "result": response.json()
    }

    print json.dumps(api_result, sort_keys=False, indent=2)


    return jsonify(api_result), response.status_code

if __name__ == "__main__":
  app.run(debug=True, host='0.0.0.0')


