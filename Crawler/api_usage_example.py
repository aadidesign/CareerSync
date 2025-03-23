"""
JobSpy API Usage Examples

This script demonstrates how to call the JobSpy API from Python,
which can be adapted for frontend integration with JavaScript.
"""

import requests
import json

# API Base URL
API_BASE_URL = "http://localhost:5000"  # Update this if your server is on a different port or host

def search_jobs(job_title, location, sites="all", days_old=30, results=20, remote_only=False):
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
        "remote": "true" if remote_only else "false"
    }
    
    # Print the URL being called (for debugging)
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    print(f"API Call: {API_BASE_URL}/api/v1/search?{query_string}")
    
    # Make the API request
    response = requests.get(f"{API_BASE_URL}/api/v1/search", params=params)
    
    # Check if the request was successful
    if response.status_code == 200:
        return response.json()
    else:
        # Handle error response
        print(f"Error {response.status_code}: {response.text}")
        return None

def get_supported_sites():
    """Get the list of supported job sites from the API"""
    response = requests.get(f"{API_BASE_URL}/api/v1/sites")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

# Example Usage
if __name__ == "__main__":
    # Get supported sites
    print("Getting supported job sites...")
    sites_response = get_supported_sites()
    if sites_response:
        print(f"Supported sites: {', '.join([site['id'] for site in sites_response['sites']])}")
    
    # Example 1: Search for Software Engineer jobs in San Francisco on all sites
    print("\nExample 1: Software Engineer jobs in San Francisco (all sites)")
    jobs_response = search_jobs(
        job_title="Software Engineer",
        location="San Francisco",
        sites="all",
        days_old=30,
        results=5
    )
    
    if jobs_response:
        print(f"Found {jobs_response['results_count']} jobs")
        for i, job in enumerate(jobs_response['jobs'][:3], 1):  # Show first 3 jobs
            print(f"\nJob {i}: {job['job_title']}")
            print(f"Company: {job['company_name']}")
            print(f"Location: {job['location']}")
            print(f"Source: {job['job_source']}")
            if 'salary_range' in job:
                print(f"Salary: {json.dumps(job['salary_range'])}")
    
    # Example 2: Search for remote Data Scientist jobs on LinkedIn and Indeed
    print("\nExample 2: Remote Data Scientist jobs (LinkedIn and Indeed)")
    jobs_response = search_jobs(
        job_title="Data Scientist",
        location="Remote",
        sites="linkedin,indeed",
        days_old=7,  # Last week only
        results=3,
        remote_only=True
    )
    
    if jobs_response:
        print(f"Found {jobs_response['results_count']} jobs")
        # Just print the list of job titles
        for i, job in enumerate(jobs_response['jobs'], 1):
            print(f"{i}. {job['job_title']} at {job['company_name']} ({job['job_source']})")

"""
JavaScript equivalent for frontend integration:

```javascript
// Function to search for jobs using the JobSpy API
async function searchJobs(jobTitle, location, sites = "all", daysOld = 30, results = 20, remoteOnly = false) {
    try {
        // Build query parameters
        const params = new URLSearchParams({
            search: jobTitle,
            location: location,
            site: sites,
            days_old: daysOld,
            results: results,
            remote: remoteOnly ? "true" : "false"
        });
        
        // Make the API request
        const response = await fetch(`http://localhost:5000/api/v1/search?${params.toString()}`);
        
        // Check if the request was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch jobs');
        }
        
        // Parse and return the JSON response
        return await response.json();
    } catch (error) {
        console.error('Error searching jobs:', error);
        return null;
    }
}

// Example usage:
document.getElementById('searchButton').addEventListener('click', async () => {
    const jobTitle = document.getElementById('jobTitle').value;
    const location = document.getElementById('location').value;
    
    // Show loading indicator
    document.getElementById('results').innerHTML = 'Searching...';
    
    // Call the API
    const results = await searchJobs(jobTitle, location, "all", 30, 20, false);
    
    // Display results
    if (results && results.jobs.length > 0) {
        document.getElementById('results').innerHTML = `
            <h2>Found ${results.results_count} jobs</h2>
            <div class="job-list">
                ${results.jobs.map(job => `
                    <div class="job-card">
                        <h3>${job.job_title}</h3>
                        <p>${job.company_name}</p>
                        <p>${job.location}</p>
                        <p>Source: ${job.job_source}</p>
                        <a href="${job.job_url}" target="_blank">View Job</a>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        document.getElementById('results').innerHTML = 'No jobs found matching your criteria.';
    }
});
```
""" 