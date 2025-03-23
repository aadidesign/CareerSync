import json
import argparse
import pandas as pd
from datetime import datetime
from jobspy import scrape_jobs
from job_intelligence import (
    enhance_job_data, 
    filter_jobs_by_date, 
    normalize_date_posted,
    extract_skills,
    extract_salary_range,
    extract_experience_range
)

# Custom JSON encoder to handle non-serializable objects like dates and NumPy types
class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif pd.isna(obj):
            return None
        return super().default(obj)

def format_job_data_to_json(job_data):
    """
    Format a single job data item to JSON format.
    This function is used by the API to return properly formatted JSON.
    """
    # If it's already a dictionary, just return it
    if isinstance(job_data, dict):
        return job_data
    
    # Convert any non-serializable objects
    return json.loads(json.dumps(job_data, cls=EnhancedJSONEncoder))

def format_to_json(jobs_df):
    """Convert JobSpy DataFrame to enhanced JSON format"""
    json_results = []
    
    for _, job in jobs_df.iterrows():
        # Convert row to dict for easier manipulation
        job_dict = job.to_dict()
        
        # Create base structure
        formatted_job = {}
        
        # Map fields from job_dict to our desired JSON structure
        field_mapping = {
            "id": "job_id",
            "title": "job_title",
            "company": "company_name",
            "job_url": "job_url",
            "site": "job_source",
            "description": "job_description",
            "job_type": "job_type",
            "job_level": "job_level",
            "job_function": "job_function",
            "skills": "skills_required",
            "experience_range": "experience_range",
            "location": "location",
            "is_remote": None,  # Special handling
            "date_posted": "date_posted",
            "listing_type": "listing_type",
            "company_industry": "company_industry",
            "company_url": "company_url",
            "company_logo": "company_logo",
            "company_addresses": "company_address",
            "company_num_employees": "company_size",
            "company_revenue": "company_revenue",
            "company_description": "company_description",
            "emails": "emails",
            "vacancy_count": "vacancy_count",
            "work_from_home_type": "work_from_home_type",
            "company_rating": "company_rating",
            "company_reviews_count": "company_reviews_count"
        }
        
        # Copy values using mapping
        for source_field, target_field in field_mapping.items():
            if target_field and source_field in job_dict:
                value = job_dict.get(source_field)
                if not pd.isna(value) and value is not None:
                    formatted_job[target_field] = value
                
        # Handle special cases
        
        # Ensure job_id has a consistent format
        if "job_id" not in formatted_job and "job_source" in formatted_job:
            if "id" in job_dict and not pd.isna(job_dict["id"]):
                formatted_job["job_id"] = f"{formatted_job['job_source']}-{job_dict['id']}"
        
        # Handle remote work field
        is_remote = job_dict.get("is_remote", False)
        if is_remote:
            formatted_job["remote_work"] = "Remote"
        elif "work_from_home_type" in formatted_job:
            if formatted_job["work_from_home_type"] == "Hybrid":
                formatted_job["remote_work"] = "Hybrid"
            else:
                formatted_job["remote_work"] = "On-site"
        else:
            formatted_job["remote_work"] = "On-site"
        
        # Handle salary range
        min_amount = job_dict.get("min_amount")
        max_amount = job_dict.get("max_amount")
        currency = job_dict.get("currency")
        
        if (min_amount is not None and not pd.isna(min_amount)) or (max_amount is not None and not pd.isna(max_amount)):
            salary_range = {}
            if min_amount is not None and not pd.isna(min_amount):
                salary_range["min_amount"] = min_amount
            if max_amount is not None and not pd.isna(max_amount):
                salary_range["max_amount"] = max_amount
            if currency is not None and not pd.isna(currency):
                salary_range["currency"] = currency
            if salary_range:
                formatted_job["salary_range"] = salary_range
        
        # Ensure skills_required is always a list
        if "skills_required" in formatted_job and isinstance(formatted_job["skills_required"], str):
            formatted_job["skills_required"] = [skill.strip() for skill in formatted_job["skills_required"].split(',')]
        
        # Ensure emails is always a list
        if "emails" in formatted_job and isinstance(formatted_job["emails"], str):
            formatted_job["emails"] = [email.strip() for email in formatted_job["emails"].split(',')]
        
        # Enhance the job data with inferred fields
        enhanced_job = enhance_job_data(formatted_job)
        
        # Add to results
        json_results.append(enhanced_job)
    
    return json_results

def scrape_jobs_with_filters(search_term, location=None, sites=None, results_per_site=10, 
                            days_old=None, remote_only=False, job_type=None, country="USA"):
    """
    Scrape jobs with specified filters and enhance the data.
    This function is used by the API to search for jobs.
    
    Args:
        search_term (str): Job title or keywords to search for
        location (str, optional): Location to search in
        sites (list, optional): List of job sites to search
        results_per_site (int, optional): Number of results per site
        days_old (int, optional): Filter jobs posted within specified days
        remote_only (bool, optional): Filter for remote jobs only
        job_type (str, optional): Filter by job type
        country (str, optional): Country for Indeed searches
        
    Returns:
        list: List of enhanced job data dictionaries
    """
    print(f"Searching for '{search_term}' jobs...")
    print(f"Location: {location or 'Any'}")
    print(f"Results per site: {results_per_site}")
    
    if days_old:
        print(f"Job age filter: {days_old} days")
    
    # Handle default sites
    if not sites:
        sites = ["indeed", "linkedin"]
    elif isinstance(sites, str):
        sites = [site.strip().lower() for site in sites.split(',')]
    
    # Handle special site name "all"
    if "all" in sites:
        sites = ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google", "bayt", "naukri"]
    
    print(f"Sites: {', '.join(sites)}")
    
    # Debug output to help diagnose issues
    print(f"DEBUG - Final sites being passed to scraper: {sites}")
    print(f"DEBUG - Remote only: {remote_only}")
    print(f"DEBUG - Results per site: {results_per_site}")
    print(f"DEBUG - Days old (hours): {days_old * 24 if days_old else None}")
    
    try:
        # Call JobSpy's scrape_jobs function
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            job_type=job_type,
            is_remote=remote_only,
            results_wanted=results_per_site,
            hours_old=days_old * 24 if days_old else None,  # Convert days to hours
            country_indeed=country,
            verbose=1
        )
        
        if jobs_df.empty:
            print("No jobs found matching your criteria.")
            return []
        
        print(f"Found {len(jobs_df)} jobs from scraping")
        
        # Convert to our enhanced JSON format
        json_results = format_to_json(jobs_df)
        
        # Apply additional filtering by date if specified
        if days_old:
            print(f"Filtering jobs posted within the last {days_old} days...")
            json_results = filter_jobs_by_date(json_results, days_old)
            print(f"After date filtering: {len(json_results)} jobs")
        
        return json_results
        
    except Exception as e:
        print(f"Error during job scraping: {str(e)}")
        return []

def scrape_with_filters(args):
    """Scrape jobs with specified filters and enhance the data"""
    print(f"Searching for '{args.search}' jobs...")
    print(f"Sites: {', '.join(args.site_name)}")
    print(f"Location: {args.location or 'Any'}")
    print(f"Results per site: {args.results}")
    print(f"Job age filter: {args.days_old} days")
    
    # Handle special site name "all"
    if "all" in args.site_name:
        site_name = ["indeed", "linkedin", "glassdoor", "zip_recruiter", "google", "bayt", "naukri"]
    else:
        site_name = args.site_name
    
    try:
        # Call JobSpy's scrape_jobs function
        jobs_df = scrape_jobs(
            site_name=site_name,
            search_term=args.search,
            location=args.location,
            distance=args.distance,
            job_type=args.job_type,
            is_remote=args.remote,
            results_wanted=args.results,
            offset=args.offset,
            hours_old=args.days_old * 24 if args.days_old else None,  # Convert days to hours
            country_indeed=args.country,
            verbose=args.verbose
        )
        
        if jobs_df.empty:
            print("No jobs found matching your criteria.")
            return []
        
        print(f"Found {len(jobs_df)} jobs from scraping")
        
        # Convert to our enhanced JSON format
        json_results = format_to_json(jobs_df)
        
        # Apply additional filtering by date if specified
        if args.days_old:
            print(f"Filtering jobs posted within the last {args.days_old} days...")
            json_results = filter_jobs_by_date(json_results, args.days_old)
            print(f"After date filtering: {len(json_results)} jobs")
        
        return json_results
        
    except Exception as e:
        print(f"Error during job scraping: {str(e)}")
        return []

def main():
    parser = argparse.ArgumentParser(description='Enhanced Job Scraper: Search and process job listings')
    
    # Required arguments
    parser.add_argument('--search', '-s', required=True, help='Job title or keywords to search for')
    
    # Optional arguments
    parser.add_argument('--location', '-l', help='Location to search in')
    parser.add_argument('--site', '-b', default='indeed,linkedin', 
                       help='Job boards to search (comma-separated): indeed,linkedin,glassdoor,zip_recruiter,google,bayt,naukri or "all"')
    parser.add_argument('--results', '-r', type=int, default=10, help='Number of results per site (default: 10)')
    parser.add_argument('--days-old', '-d', type=int, default=None, help='Filter jobs posted within specified days')
    parser.add_argument('--remote', action='store_true', help='Filter for remote jobs only')
    parser.add_argument('--job-type', '-j', choices=['fulltime', 'parttime', 'internship', 'contract'], 
                       help='Filter by job type')
    parser.add_argument('--distance', type=int, default=50, help='Search radius in miles (default: 50)')
    parser.add_argument('--country', default='USA', help='Country for Indeed searches (default: USA)')
    parser.add_argument('--offset', type=int, default=0, help='Start results from this offset')
    parser.add_argument('--output', '-o', help='Output filename (default: auto-generated)')
    parser.add_argument('--use-google-api', action='store_true', help='Use Google Natural Language API for enhanced processing')
    parser.add_argument('--verbose', '-v', type=int, default=1, choices=[0, 1, 2], 
                       help='Verbosity level (0=errors only, 1=warnings, 2=all logs)')
    
    args = parser.parse_args()
    
    # Convert site string to list
    args.site_name = [site.strip().lower() for site in args.site.split(',')]
    
    # Scrape jobs with enhanced processing
    enhanced_jobs = scrape_with_filters(args)
    
    if not enhanced_jobs:
        return
    
    # Generate output filename if not specified
    if not args.output:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"jobs_{args.search.replace(' ', '_')}_{timestamp}.json"
    else:
        output_file = args.output
        if not output_file.endswith('.json'):
            output_file += '.json'
    
    # Save results to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(enhanced_jobs, f, indent=2, ensure_ascii=False, cls=EnhancedJSONEncoder)
    
    print(f"\nSuccessfully processed {len(enhanced_jobs)} jobs")
    print(f"Results saved to {output_file}")
    
    # Display sample result
    if enhanced_jobs:
        print("\nSample Job (JSON format):")
        print(json.dumps(enhanced_jobs[0], indent=2, ensure_ascii=False, cls=EnhancedJSONEncoder))

if __name__ == "__main__":
    main() 