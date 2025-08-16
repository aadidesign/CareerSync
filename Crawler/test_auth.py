#!/usr/bin/env python3
"""
Test script to verify authentication middleware for the Job Search API
"""

import requests
import json
import sys

# Configuration
API_BASE_URL = "http://localhost:5000"  # Change this to your API URL
TEST_ENDPOINT = f"{API_BASE_URL}/api/search"

def test_public_endpoints():
    """Test endpoints that don't require authentication"""
    print("Testing public endpoints...")
    
    # Test health check
    try:
        response = requests.get(f"{API_BASE_URL}/api/health")
        print(f"✓ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
    
    # Test sites endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/api/sites")
        print(f"✓ Sites endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"✗ Sites endpoint failed: {e}")

def test_protected_endpoint_without_auth():
    """Test protected endpoint without authentication"""
    print("\nTesting protected endpoint without authentication...")
    
    test_data = {
        "search": "software engineer",
        "location": "New York",
        "site": "indeed",
        "days_old": 7,
        "results": 5
    }
    
    try:
        response = requests.post(TEST_ENDPOINT, json=test_data)
        print(f"✓ Protected endpoint without auth: {response.status_code}")
        
        if response.status_code == 401:
            print("  ✓ Correctly rejected unauthenticated request")
            error_data = response.json()
            print(f"  Error message: {error_data.get('message', 'No message')}")
            print(f"  Error type: {error_data.get('error', 'No error type')}")
        else:
            print(f"  ✗ Should have returned 401, got {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Test failed: {e}")

def test_protected_endpoint_with_invalid_auth():
    """Test protected endpoint with invalid authentication"""
    print("\nTesting protected endpoint with invalid authentication...")
    
    test_data = {
        "search": "software engineer",
        "location": "New York",
        "site": "indeed",
        "days_old": 7,
        "results": 5
    }
    
    # Test with invalid token format
    headers = {"Authorization": "InvalidFormat token123"}
    
    try:
        response = requests.post(TEST_ENDPOINT, json=test_data, headers=headers)
        print(f"✓ Protected endpoint with invalid auth format: {response.status_code}")
        
        if response.status_code == 401:
            print("  ✓ Correctly rejected invalid auth format")
            error_data = response.json()
            print(f"  Error message: {error_data.get('message', 'No message')}")
        else:
            print(f"  ✗ Should have returned 401, got {response.status_code}")
            
    except Exception as e:
        print(f"✗ Test failed: {e}")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token_123"}
    
    try:
        response = requests.post(TEST_ENDPOINT, json=test_data, headers=headers)
        print(f"✓ Protected endpoint with invalid token: {response.status_code}")
        
        if response.status_code == 401:
            print("  ✓ Correctly rejected invalid token")
            error_data = response.json()
            print(f"  Error message: {error_data.get('message', 'No message')}")
        else:
            print(f"  ✗ Should have returned 401, got {response.status_code}")
            
    except Exception as e:
        print(f"✗ Test failed: {e}")

def test_protected_endpoint_with_valid_auth():
    """Test protected endpoint with valid authentication (requires actual token)"""
    print("\nTesting protected endpoint with valid authentication...")
    print("Note: This test requires a valid JWT token from Supabase")
    
    # You can set this environment variable or modify the script to use a real token
    token = input("Enter a valid JWT token (or press Enter to skip): ").strip()
    
    if not token:
        print("  Skipping valid auth test (no token provided)")
        return
    
    test_data = {
        "search": "software engineer",
        "location": "New York",
        "site": "indeed",
        "days_old": 7,
        "results": 5
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(TEST_ENDPOINT, json=test_data, headers=headers)
        print(f"✓ Protected endpoint with valid auth: {response.status_code}")
        
        if response.status_code == 200:
            print("  ✓ Successfully authenticated request")
            response_data = response.json()
            print(f"  Jobs found: {len(response_data.get('data', []))}")
        elif response.status_code == 401:
            print("  ✗ Authentication failed - check your token")
            error_data = response.json()
            print(f"  Error message: {error_data.get('message', 'No message')}")
        else:
            print(f"  ✗ Unexpected status code: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Test failed: {e}")

def main():
    """Run all authentication tests"""
    print("🔐 Job Search API Authentication Tests")
    print("=" * 50)
    
    try:
        # Test public endpoints
        test_public_endpoints()
        
        # Test protected endpoint without auth
        test_protected_endpoint_without_auth()
        
        # Test protected endpoint with invalid auth
        test_protected_endpoint_with_invalid_auth()
        
        # Test protected endpoint with valid auth
        test_protected_endpoint_with_valid_auth()
        
        print("\n" + "=" * 50)
        print("✅ Authentication tests completed!")
        
    except KeyboardInterrupt:
        print("\n\n❌ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test suite failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
