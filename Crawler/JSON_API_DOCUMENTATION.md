# JobSpy JSON API Documentation

This document provides comprehensive documentation for the JobSpy JSON API server, which offers a clean RESTful interface for job searching across multiple job boards.

## Table of Contents

1. [Overview](#overview)
2. [Running the API Server](#running-the-api-server)
3. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Supported Sites](#supported-sites)
   - [Job Search](#job-search)
4. [JSON Response Format](#json-response-format)
5. [Error Handling](#error-handling)
6. [Client Examples](#client-examples)
   - [JavaScript](#javascript)
   - [Python](#python)
   - [cURL](#curl)
7. [RESTful Design Principles](#restful-design-principles)

## Overview

The JobSpy JSON API provides a standardized way to programmatically access job listing data from multiple job boards, including Indeed, LinkedIn, Glassdoor, and ZipRecruiter. It offers:

- A consistent JSON response format
- RESTful API design with GET method for data retrieval
- Support for filtering by job title, location, date posted, and more
- Error handling with descriptive messages
- CORS support for frontend access

## Running the API Server

To start the JobSpy JSON API server:

```bash
python json_api_server.py
```

Command line options:

- `--port`: Specify the port number (default: 5000)
  ```
  python json_api_server.py --port 8080
  ```

- `--host`: Specify the host (default: 0.0.0.0)
  ```
  python json_api_server.py --host 127.0.0.1
  ```

- `--debug`: Run in debug mode (for development)
  ```
  python json_api_server.py --debug
  ```

## API Endpoints

### Health Check

```
GET /api/health
```

Checks if the API server is running properly.

**Example Response:**

```json
{
  "success": true,
  "timestamp": "2025-03-23T16:12:31.123456",
  "data": {
    "status": "operational"
  },
  "message": "API is operational"
}
```

### Supported Sites

```
GET /api/sites
```

Returns a list of supported job sites.

**Example Response:**

```json
{
  "success": true,
  "timestamp": "2025-03-23T16:12:31.123456",
  "data": {
    "sites": [
      {"id": "indeed", "name": "Indeed"},
      {"id": "linkedin", "name": "LinkedIn"},
      {"id": "glassdoor", "name": "Glassdoor"},
      {"id": "ziprecruiter", "name": "ZipRecruiter"}
    ]
  }
}
```

### Job Search

```
GET /api/search
```

Searches for jobs based on the provided query parameters. This is the **recommended way** to search for jobs using the API, following RESTful principles for retrieving data.

#### Query Parameters

| Parameter   | Type      | Required | Description                                                  | Default        |
|-------------|-----------|----------|--------------------------------------------------------------|----------------|
| search      | string    | Yes      | Job title or keywords to search for                          | -              |
| location    | string    | Yes      | Location to search in                                        | -              |
| site        | string    | No       | Comma-separated list of job sites or "all" for all sites     | indeed,linkedin|
| days_old    | integer   | No       | Filter jobs posted within specified number of days           | 30             |
| results     | integer   | No       | Maximum number of results per site (max: 100)                | 10             |
| remote_only | boolean   | No       | Filter for remote jobs only (true/false)                     | false          |

#### Example GET Request

```
GET /api/search?search=Software%20Engineer&location=Remote&site=all&days_old=7&results=20&remote_only=true
```

#### Example Response

```json
{
  "success": true,
  "timestamp": "2025-03-23T16:12:31.123456",
  "data": {
    "query": {
      "search": "Software Engineer",
      "location": "Remote",
      "sites": ["indeed", "linkedin", "glassdoor", "ziprecruiter"],
      "days_old": 7,
      "remote_only": true
    },
    "results_count": 42,
    "jobs": [
      {
        "job_id": "indeed-abc123",
        "job_title": "Senior Software Engineer",
        "company_name": "Example Corp",
        "job_url": "https://www.indeed.com/viewjob?jk=abc123",
        "job_source": "indeed",
        "job_description": "...",
        "job_type": "fulltime",
        "location": "Remote, US",
        "date_posted": "2025-03-20",
        "skills_required": ["python", "javascript", "react"],
        "salary_range": {
          "min_amount": 120000,
          "max_amount": 150000,
          "currency": "USD"
        }
      },
      // Additional job objects...
    ]
  },
  "message": "Found 42 jobs matching the search criteria"
}
```

## JSON Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,        // Whether the request was successful
  "timestamp": "ISO-8601-date", // Server timestamp of the response
  "data": {                     // Response data (only on success)
    // Endpoint-specific data
  },
  "message": "string",          // Human-readable message
  "error": "error_code"         // Error code (only on failure)
}
```

## Error Handling

When an error occurs, the API returns a JSON response with `success: false` and details about the error:

```json
{
  "success": false,
  "timestamp": "2025-03-23T16:12:31.123456",
  "error": "invalid_parameter",
  "message": "Both 'search' and 'location' parameters are required"
}
```

### Common Error Codes

| Error Code             | Description                                     | HTTP Status |
|------------------------|-------------------------------------------------|-------------|
| missing_required_params| Required parameters are missing                  | 400         |
| invalid_sites          | No valid job sites were specified                | 400         |
| invalid_parameter      | A parameter has an invalid value                 | 400         |
| job_scraping_failed    | Failed to scrape jobs from the specified sites   | 500         |
| formatting_failed      | Failed to format job data                        | 500         |
| server_error           | Unexpected server error                          | 500         |
| not_found              | The requested resource does not exist            | 404         |
| method_not_allowed     | HTTP method not allowed for the endpoint         | 405         |

## Client Examples

### JavaScript

```javascript
// Simple function to search for jobs using GET method (recommended)
async function searchJobs(jobTitle, location, options = {}) {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      search: jobTitle,
      location: location,
      site: options.sites || 'all',
      days_old: options.daysOld || 30,
      results: options.results || 10,
      remote_only: options.remoteOnly ? 'true' : 'false'
    });
    
    // Make GET request
    const response = await fetch(`http://localhost:5000/api/search?${params.toString()}`);
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch jobs');
    }
    
    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error('Error searching jobs:', error);
    return { 
      success: false, 
      error: 'connection_failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Example usage
searchJobs('Software Engineer', 'Remote', { 
  sites: 'indeed,linkedin',
  daysOld: 7,
  results: 20,
  remoteOnly: true
})
.then(result => {
  if (result.success) {
    console.log(`Found ${result.data.results_count} jobs`);
    result.data.jobs.forEach(job => {
      console.log(`${job.job_title} at ${job.company_name}`);
    });
  } else {
    console.error(`Error: ${result.message}`);
  }
});

fetch('http://localhost:5000/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    search: "Software Engineer",
    location: "Remote",
    site: "all",
    days_old: 7,
    results: 10,
    remote_only: true
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Python

```python
import requests
import json

API_BASE_URL = 'http://localhost:5000/api'

def search_jobs(job_title, location, sites="all", days_old=30, results=10, remote_only=False):
    """
    Search for jobs using the JobSpy API
    
    Args:
        job_title (str): Job title or keywords to search for
        location (str): Location to search in
        sites (str): Comma-separated list of job sites or "all" for all supported sites
        days_old (int): Filter jobs by days since posting
        results (int): Maximum number of results per site
        remote_only (bool): Filter for remote jobs only
    
    Returns:
        dict: JSON response from the API
    """
    # Build query parameters
    params = {
        "search": job_title,
        "location": location,
        "site": sites,
        "days_old": days_old,
        "results": results,
        "remote_only": "true" if remote_only else "false"
    }
    
    # Make GET request
    try:
        response = requests.get(f"{API_BASE_URL}/search", params=params)
        response.raise_for_status()  # Raise exception for non-200 status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error during API request: {e}")
        return {
            "success": False,
            "error": "request_failed",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Example usage
jobs = search_jobs(
    job_title="Software Engineer",
    location="Remote",
    sites="indeed,linkedin",
    days_old=7,
    results=20,
    remote_only=True
)

if jobs and jobs["success"]:
    print(f"Found {jobs['data']['results_count']} jobs")
    for job in jobs["data"]["jobs"][:3]:  # Print first 3 jobs
        print(f"- {job['job_title']} at {job['company_name']}")
else:
    print(f"Error: {jobs.get('message', 'Unknown error')}")
```

### cURL

#### Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

#### Supported Sites

```bash
curl -X GET http://localhost:5000/api/sites
```

#### Job Search (GET - Recommended)

```bash
curl -X GET "http://localhost:5000/api/search?search=Software%20Engineer&location=Remote&site=all&days_old=7&results=10&remote_only=true"
```

## RESTful Design Principles

This API follows RESTful design principles, particularly:

1. **Using GET for data retrieval**: GET is the appropriate HTTP method for retrieving data without side effects
2. **Meaningful URLs**: Resources are organized hierarchically with clear naming
3. **Statelessness**: Each request contains all the information needed without relying on server-stored context
4. **Consistent response format**: All endpoints return data in the same JSON structure
5. **Appropriate error codes**: Standard HTTP status codes are used to indicate errors

For frontend integration, the GET method is strongly recommended as it follows proper REST principles for retrieving data, is easier to debug, can be bookmarked, and is more cache-friendly. 