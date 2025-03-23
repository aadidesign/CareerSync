import requests
import json
import sys

def test_post_request():
    url = "http://localhost:5000/api/search"
    headers = {"Content-Type": "application/json"}
    
    # The exact JSON data provided by the user
    data = {
        "search": "Software Engineer",
        "location": "pune",
        "site": "all",
        "days_old": 7,
        "results": 10,
        "remote_only": False
    }
    
    print(f"Sending POST request to {url}")
    print(f"Headers: {headers}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"\nStatus Code: {response.status_code}")
        
        # Print the response
        try:
            print("Response:")
            print(json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print("Raw Response:")
            print(response.text)
            
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_post_request()
    sys.exit(0 if success else 1) 