/**
 * JobSpy JSON API Client Example
 * 
 * This file demonstrates how to interact with the JobSpy JSON API server
 * from a JavaScript frontend application.
 */

// API base URL - change this to match your server configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Check the API health status
 * @returns {Promise<Object>} Health status response
 */
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Error checking API health:', error);
    return { success: false, error: 'connection_failed', message: error.message };
  }
}

/**
 * Get supported job sites
 * @returns {Promise<Object>} Supported sites response
 */
async function getSupportedSites() {
  try {
    const response = await fetch(`${API_BASE_URL}/sites`);
    return await response.json();
  } catch (error) {
    console.error('Error getting supported sites:', error);
    return { success: false, error: 'connection_failed', message: error.message };
  }
}

/**
 * Search for jobs using the GET method (recommended approach)
 * @param {Object} params - Search parameters object 
 * @returns {Promise<Object>} Job search results
 */
async function searchJobs(params) {
  try {
    // Validate required parameters
    if (!params.search || !params.location) {
      return {
        success: false,
        error: 'missing_required_params',
        message: "Both 'search' and 'location' parameters are required",
        timestamp: new Date().toISOString()
      };
    }
    
    // Build query string
    const queryParams = new URLSearchParams({
      search: params.search,
      location: params.location,
      site: params.site || 'all',
      days_old: params.days_old || 30,
      results: params.results || 10,
      remote_only: params.remote_only ? 'true' : 'false'
    });
    
    // Make GET request
    const url = `${API_BASE_URL}/search?${queryParams.toString()}`;
    console.log(`Searching jobs: ${url}`);
    
    const response = await fetch(url);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'invalid_response',
        message: 'The server returned a non-JSON response',
        timestamp: new Date().toISOString()
      };
    }
    
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

/**
 * Search for jobs using POST request with JSON body (alternative method)
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} Job search results
 */
async function searchJobsPost(params) {
  try {
    // Validate required parameters
    if (!params.search || !params.location) {
      return {
        success: false,
        error: 'missing_required_params',
        message: "Both 'search' and 'location' parameters are required",
        timestamp: new Date().toISOString()
      };
    }
    
    // Make POST request with JSON body
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search: params.search,
        location: params.location,
        site: params.site || 'all',
        days_old: params.days_old || 30,
        results: params.results || 10,
        remote_only: params.remote_only || false
      })
    });
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'invalid_response',
        message: 'The server returned a non-JSON response',
        timestamp: new Date().toISOString()
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching jobs (POST):', error);
    return {
      success: false,
      error: 'connection_failed',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Render job results to HTML element
 * @param {Array} jobs - Array of job objects
 * @param {HTMLElement} containerElement - Container element to render jobs into
 */
function renderJobsToHtml(jobs, containerElement) {
  if (!jobs || jobs.length === 0) {
    containerElement.innerHTML = '<div class="no-results">No jobs found matching your criteria.</div>';
    return;
  }
  
  const jobsHtml = jobs.map(job => `
    <div class="job-card">
      <h3>${job.job_title || 'Untitled Position'}</h3>
      <p class="company">${job.company_name || 'Unknown Company'}</p>
      <div class="details">
        <p><strong>Location:</strong> ${job.location || 'Unknown'}</p>
        <p><strong>Source:</strong> ${job.job_source || 'Unknown'}</p>
        ${job.date_posted ? `<p><strong>Posted:</strong> ${job.date_posted}</p>` : ''}
        ${job.job_type ? `<p><strong>Type:</strong> ${job.job_type}</p>` : ''}
      </div>
      ${job.skills_required && job.skills_required.length ? `
        <div class="skills">
          <strong>Skills:</strong>
          <ul>${job.skills_required.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </div>
      ` : ''}
      <a href="${job.job_url}" target="_blank" class="apply-now-btn">Apply Now</a>
    </div>
  `).join('');
  
  containerElement.innerHTML = jobsHtml;
}

/**
 * Display error message in an element
 * @param {string} message - Error message
 * @param {HTMLElement} element - Element to display error in
 */
function showError(message, element) {
  element.innerHTML = `<div class="error-message">${message}</div>`;
}

// Example usage:
// 1. Simple GET request with required parameters
// searchJobs({
//   search: "Software Engineer", 
//   location: "Remote"
// })
// .then(result => {
//   if (result.success) {
//     console.log(`Found ${result.data.results_count} jobs`);
//   }
// });
//
// 2. GET request with all parameters
// searchJobs({
//   search: "Data Scientist",
//   location: "New York",
//   site: "indeed,linkedin",
//   days_old: 7,
//   results: 20,
//   remote_only: true
// })
// .then(result => {
//   // Handle result
// });

// Example for HTML page initialization
document.addEventListener('DOMContentLoaded', async () => {
  // For code demonstration, let's assume we have these elements
  const healthStatusEl = document.getElementById('health-status');
  const sitesListEl = document.getElementById('sites-list');
  const searchForm = document.getElementById('job-search-form');
  const resultsContainer = document.getElementById('search-results');
  const errorContainer = document.getElementById('error-container');
  
  // Check API health
  const healthResponse = await checkApiHealth();
  if (healthStatusEl) {
    if (healthResponse.success) {
      healthStatusEl.textContent = `API Status: ${healthResponse.data.status}`;
      healthStatusEl.className = 'status-ok';
    } else {
      healthStatusEl.textContent = 'API Status: Offline';
      healthStatusEl.className = 'status-error';
    }
  }
  
  // Get supported sites
  const sitesResponse = await getSupportedSites();
  if (sitesListEl && sitesResponse.success) {
    const sitesList = sitesResponse.data.sites.map(site => 
      `<option value="${site.id}">${site.name}</option>`
    ).join('');
    sitesListEl.innerHTML = sitesList;
  }
  
  // Set up search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous errors
      if (errorContainer) {
        errorContainer.innerHTML = '';
      }
      
      // Get form data
      const formData = new FormData(searchForm);
      const searchParams = {
        search: formData.get('search'),
        location: formData.get('location'),
        site: formData.get('site') || 'all',
        days_old: parseInt(formData.get('days_old') || 30),
        results: parseInt(formData.get('results') || 10),
        remote_only: formData.get('remote_only') === 'on'
      };
      
      // Validate required fields
      if (!searchParams.search || !searchParams.location) {
        if (errorContainer) {
          showError('Job title and location are required', errorContainer);
        }
        return;
      }
      
      // Show loading state
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="loading">Searching for jobs...</div>';
      }
      
      // Send the search request using GET method
      const searchResponse = await searchJobs(searchParams);
      
      // Handle the response
      if (searchResponse.success) {
        // Show success message
        console.log(`Found ${searchResponse.data.results_count} jobs matching your criteria`);
        
        // Render jobs to results container
        if (resultsContainer) {
          renderJobsToHtml(searchResponse.data.jobs, resultsContainer);
        }
      } else {
        // Show error message
        console.error('Search failed:', searchResponse.error, searchResponse.message);
        if (errorContainer) {
          showError(`Error: ${searchResponse.message}`, errorContainer);
        }
        if (resultsContainer) {
          resultsContainer.innerHTML = '';
        }
      }
    });
  }
});

// Simple HTML example to use with this script:
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobSpy Client Example</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1, h2 {
      color: #333;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    .status-ok {
      color: green;
    }
    .status-error {
      color: red;
    }
    .error-message {
      background-color: #ffdddd;
      color: #ff0000;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    .job-card {
      background-color: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .job-card h3 {
      margin-top: 0;
    }
    .company {
      color: #666;
      font-style: italic;
    }
    .apply-now-btn {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 8px 12px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>JobSpy Client Example</h1>
    
    <div id="api-status">
      <p id="health-status">Checking API status...</p>
    </div>
    
    <div id="error-container"></div>
    
    <div id="search-section">
      <h2>Search for Jobs</h2>
      <form id="job-search-form">
        <div class="form-group">
          <label for="search">Job Title</label>
          <input type="text" id="search" name="search" placeholder="e.g. Software Engineer" required>
        </div>
        
        <div class="form-group">
          <label for="location">Location</label>
          <input type="text" id="location" name="location" placeholder="e.g. New York or Remote" required>
        </div>
        
        <div class="form-group">
          <label for="site">Job Sites</label>
          <select id="sites-list" name="site">
            <option value="all">All Sites</option>
            <!-- Sites will be populated by JavaScript -->
          </select>
        </div>
        
        <div class="form-group">
          <label for="days_old">Days Since Posted</label>
          <select id="days_old" name="days_old">
            <option value="1">Last 24 hours</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last week</option>
            <option value="30" selected>Last month</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="results">Results Per Site</label>
          <select id="results" name="results">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" name="remote_only"> Remote Jobs Only
          </label>
        </div>
        
        <button type="submit">Search Jobs</button>
      </form>
    </div>
    
    <h2>Search Results</h2>
    <div id="search-results"></div>
  </div>
  
  <script src="json_client_example.js"></script>
</body>
</html>
*/ 