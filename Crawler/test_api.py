"""
Test script for the JobSpy API

This script tests if the JobSpy API is working correctly by
making direct requests to the API endpoints.
"""

import requests
import json
import sys

# Configuration
API_BASE_URL = "http://localhost:5000"  # Update this if using a different port

def print_separator():
    """Print a separator line"""
    print("\n" + "="*50 + "\n")

def test_health_endpoint():
    """Test the health check endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_sites_endpoint():
    """Test the supported sites endpoint"""
    print("Testing supported sites endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/sites")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_search_endpoint(search_term="Software Engineer", location="Remote"):
    """Test the job search endpoint with basic parameters"""
    print(f"Testing search endpoint with search='{search_term}', location='{location}'...")
    try:
        params = {
            "search": search_term,
            "location": location,
            "site": "indeed",
            "results": 1,
            "days_old": 30
        }
        
        # Manually create query string instead of using requests.utils.urlencode
        query_params = "&".join([f"{k}={v}" for k, v in params.items()])
        print(f"Request URL: {API_BASE_URL}/api/v1/search?{query_params}")
        
        response = requests.get(f"{API_BASE_URL}/api/v1/search", params=params)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            # Print a summarized version of the response
            summary = {
                "query": data.get("query", {}),
                "results_count": data.get("results_count", 0),
                "sample_job": data.get("jobs", [{}])[0].get("job_title", "No jobs found") if data.get("jobs") else "No jobs found"
            }
            print(f"Response Summary: {json.dumps(summary, indent=2)}")
            return True
        else:
            print(f"Error Response: {json.dumps(response.json(), indent=2)}")
            return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("JobSpy API Test Client")
    print_separator()
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    print("Health Endpoint:", "✅ OK" if health_ok else "❌ FAILED")
    print_separator()
    
    # Test sites endpoint
    sites_ok = test_sites_endpoint()
    print("Sites Endpoint:", "✅ OK" if sites_ok else "❌ FAILED")
    print_separator()
    
    # Test search endpoint
    search_ok = test_search_endpoint()
    print("Search Endpoint:", "✅ OK" if search_ok else "❌ FAILED")
    print_separator()
    
    # Overall result
    if health_ok and sites_ok and search_ok:
        print("All tests PASSED! The API is working correctly.")
        return 0
    else:
        print("Some tests FAILED. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 