"""
JobSpy JSON API Server

A clean REST API for job searching that communicates exclusively using JSON.
Optimized for GET requests for job searching with proper RESTful design.
"""

import os
import json
import traceback
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from enhanced_job_scraper import scrape_jobs_with_filters, format_job_data_to_json
from error_handling import JobScraperError, log_error

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing to allow frontend access

# Configuration
DEFAULT_PORT = 5000
DEFAULT_HOST = "0.0.0.0"
REQUEST_LIMIT = 100  # Maximum number of results per site

# Standard JSON response structure
def create_response(success=True, data=None, message=None, error=None, status_code=200):
    """
    Create a standardized JSON response
    
    Args:
        success (bool): Whether the request was successful
        data (dict): Data to return (if successful)
        message (str): Message to return (success or error)
        error (str): Error type if request failed
        status_code (int): HTTP status code
        
    Returns:
        tuple: (response_json, status_code)
    """
    response = {
        "success": success,
        "timestamp": datetime.now().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    if message is not None:
        response["message"] = message
    
    if error is not None:
        response["error"] = error
    
    return jsonify(response), status_code

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running."""
    data = {"status": "operational"}
    return create_response(data=data, message="API is operational")

@app.route('/api/sites', methods=['GET'])
def get_supported_sites():
    """Return a list of supported job sites."""
    sites_data = {
        "sites": [
            {"id": "indeed", "name": "Indeed"},
            {"id": "linkedin", "name": "LinkedIn"},
            {"id": "glassdoor", "name": "Glassdoor"},
            {"id": "zip_recruiter", "name": "ZipRecruiter"}
        ]
    }
    return create_response(data=sites_data)

@app.route('/api/search', methods=['GET', 'POST'])
def search_jobs():
    """
    Search for jobs based on provided parameters.
    
    Accepts both GET requests with query parameters and POST requests with JSON body.
    GET is the recommended and RESTful approach for retrieving job data.
    
    Query Parameters for GET:
    - search: Job title or keywords (required)
    - location: Location (required)
    - site: Comma-separated list of job sites or "all" for all supported sites (default: "indeed,linkedin")
    - days_old: Filter jobs by days since posting (default: 30)
    - results: Maximum number of results per site (default: 10, max: 100)
    - remote_only: Filter for remote jobs only (default: false)
    
    Returns:
        JSON response with scraped job data
    """
    try:
        # Determine if request is GET or POST and extract parameters
        if request.method == 'POST':
            # Get parameters from JSON body
            request_data = request.get_json(silent=True) or {}
            search_term = request_data.get('search')
            location = request_data.get('location')
            sites_param = request_data.get('site', 'indeed,linkedin')
            days_old = int(request_data.get('days_old', 30))
            results = min(int(request_data.get('results', 10)), REQUEST_LIMIT)
            remote_only = request_data.get('remote_only', False)
        else:
            # Get parameters from query string (GET method)
            search_term = request.args.get('search')
            location = request.args.get('location')
            sites_param = request.args.get('site', 'indeed,linkedin')
            
            # Handle potential type errors with safe conversions
            try:
                days_old = int(request.args.get('days_old', 30))
            except (ValueError, TypeError):
                days_old = 30
                
            try:
                results = min(int(request.args.get('results', 10)), REQUEST_LIMIT)
            except (ValueError, TypeError):
                results = 10
                
            remote_only = request.args.get('remote_only', 'false').lower() == 'true'
        
        # Validate required parameters
        if not search_term or not location:
            return create_response(
                success=False,
                error="missing_required_params",
                message="Both 'search' and 'location' parameters are required",
                status_code=400
            )
        
        # Handle 'all' sites option
        if sites_param.lower() == 'all':
            sites = ["indeed", "linkedin", "glassdoor", "zip_recruiter"]
        else:
            sites = sites_param.split(',')
            
            # Convert ziprecruiter to zip_recruiter if needed
            sites = ["zip_recruiter" if site.lower() == "ziprecruiter" else site for site in sites]
        
        # Validate sites parameter
        valid_sites = ["indeed", "linkedin", "glassdoor", "zip_recruiter"]
        sites = [site for site in sites if site in valid_sites]
        
        if not sites:
            return create_response(
                success=False,
                error="invalid_sites",
                message=f"No valid sites provided. Valid options are: {', '.join(valid_sites)} or 'all'",
                status_code=400
            )
        
        # Call job scraper function
        try:
            app.logger.info(f"Searching for '{search_term}' in '{location}' on sites: {', '.join(sites)}")
            jobs = scrape_jobs_with_filters(
                search_term=search_term,
                location=location,
                sites=sites,
                results_per_site=results,
                days_old=days_old,
                remote_only=remote_only
            )
        except Exception as scrape_error:
            # Log detailed error from job scraping
            error_details = f"Job scraping error: {str(scrape_error)}\n{traceback.format_exc()}"
            log_error(error_details)
            return create_response(
                success=False,
                error="job_scraping_failed",
                message=f"Failed to scrape jobs: {str(scrape_error)}",
                status_code=500
            )
        
        # Format the output to JSON
        try:
            formatted_jobs = [format_job_data_to_json(job) for job in jobs]
        except Exception as format_error:
            # Log detailed error from formatting
            error_details = f"JSON formatting error: {str(format_error)}\n{traceback.format_exc()}"
            log_error(error_details)
            return create_response(
                success=False,
                error="formatting_failed",
                message=f"Failed to format job data: {str(format_error)}",
                status_code=500
            )
        
        # Return JSON response
        response_data = {
            "query": {
                "search": search_term,
                "location": location,
                "sites": sites,
                "days_old": days_old,
                "remote_only": remote_only
            },
            "results_count": len(formatted_jobs),
            "jobs": formatted_jobs
        }
        
        return create_response(
            data=response_data,
            message=f"Found {len(formatted_jobs)} jobs matching the search criteria"
        )
    
    except ValueError as e:
        error_details = f"Value error in API request: {str(e)}\n{traceback.format_exc()}"
        log_error(error_details)
        return create_response(
            success=False,
            error="invalid_parameter",
            message=str(e),
            status_code=400
        )
    
    except Exception as e:
        error_details = f"Unexpected error: {str(e)}\n{traceback.format_exc()}"
        log_error(error_details)
        return create_response(
            success=False,
            error="server_error",
            message=f"An unexpected error occurred: {str(e)}",
            status_code=500
        )

@app.errorhandler(404)
def not_found(e):
    return create_response(
        success=False,
        error="not_found",
        message="The requested resource does not exist",
        status_code=404
    )

@app.errorhandler(405)
def method_not_allowed(e):
    return create_response(
        success=False,
        error="method_not_allowed",
        message="The HTTP method is not allowed for the requested URL",
        status_code=405
    )

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='JobSpy JSON API Server')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT, help='Port to run the server on')
    parser.add_argument('--host', type=str, default=DEFAULT_HOST, help='Host to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    
    args = parser.parse_args()
    
    print(f"\n=== JobSpy JSON API Server ===")
    print(f"Server running at: http://{args.host if args.host != '0.0.0.0' else 'localhost'}:{args.port}/api/")
    print(f"Available endpoints:")
    print(f"  - GET /api/health")
    print(f"  - GET /api/sites")
    print(f"  - GET /api/search?search=<job_title>&location=<location>&site=<sites>&...")
    print(f"\nPress Ctrl+C to stop the server")
    
    if args.debug:
        app.run(host=args.host, port=args.port, debug=True)
    else:
        from waitress import serve
        print(f"Starting production server on {args.host}:{args.port}")
        serve(app, host=args.host, port=args.port) 