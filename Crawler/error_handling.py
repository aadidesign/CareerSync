import logging
import traceback
import pandas as pd
import json
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('jobspy_enhanced.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('jobspy_enhanced')

class JobScraperError(Exception):
    """Base exception class for JobSpy scraper errors"""
    def __init__(self, message, details=None):
        self.message = message
        self.details = details
        super().__init__(self.message)

class ScraperInitError(JobScraperError):
    """Exception raised for errors during scraper initialization"""
    pass

class ScraperExecutionError(JobScraperError):
    """Exception raised for errors during scraping execution"""
    pass

class DataProcessingError(JobScraperError):
    """Exception raised for errors during data processing"""
    pass

def log_error(e, error_type="general", job_source=None, search_term=None):
    """Log error with contextual information"""
    if isinstance(e, JobScraperError):
        logger.error(f"{error_type} error: {e.message}")
        if e.details:
            logger.error(f"Details: {e.details}")
    else:
        logger.error(f"{error_type} error: {str(e)}")
    
    if job_source:
        logger.error(f"Job source: {job_source}")
    if search_term:
        logger.error(f"Search term: {search_term}")
    
    logger.error(f"Traceback: {traceback.format_exc()}")

def handle_scraper_error(e, job_source, search_term, output_filename=None):
    """Handle scraper errors with appropriate logging and recovery"""
    error_type = "Scraper"
    
    # Classify error based on type
    if "Connection" in str(e) or "Timeout" in str(e) or "Network" in str(e):
        error_type = "Network"
        log_error(e, error_type, job_source, search_term)
        return pd.DataFrame(), f"Network error when scraping {job_source}: {str(e)}"
    
    elif "Authentication" in str(e) or "Login" in str(e) or "Credentials" in str(e):
        error_type = "Authentication"
        log_error(e, error_type, job_source, search_term)
        return pd.DataFrame(), f"Authentication error with {job_source}: {str(e)}"
    
    elif "Parsing" in str(e) or "Element" in str(e) or "Selector" in str(e) or "HTML" in str(e):
        error_type = "Parsing"
        log_error(e, error_type, job_source, search_term)
        return pd.DataFrame(), f"Parsing error with {job_source} data: {str(e)}"
    
    elif "blocked" in str(e).lower() or "captcha" in str(e).lower() or "detected" in str(e).lower():
        error_type = "Access Blocked"
        log_error(e, error_type, job_source, search_term)
        return pd.DataFrame(), f"Access blocked by {job_source}: {str(e)}"
    
    # Default case
    log_error(e, error_type, job_source, search_term)
    return pd.DataFrame(), f"Error scraping {job_source}: {str(e)}"

def save_partial_results(df, filename=None, error_msg=None):
    """Save partial results if a scraper fails to complete"""
    if df.empty:
        logger.warning("No partial results to save.")
        return None
    
    # Generate filename if not provided
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"partial_results_{timestamp}.json"
    
    try:
        # Convert DataFrame to list of dictionaries
        records = df.to_dict(orient='records')
        
        # Add error information
        metadata = {
            "status": "partial",
            "timestamp": datetime.now().isoformat(),
            "error": error_msg if error_msg else "Unknown error",
            "count": len(records)
        }
        
        data = {
            "metadata": metadata,
            "results": records
        }
        
        # Save to file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Partial results saved to {filename}")
        return filename
    
    except Exception as e:
        logger.error(f"Error saving partial results: {str(e)}")
        return None

def log_unmapped_fields(job_data, mapped_data, job_source):
    """Log fields that couldn't be mapped to help improve field mapping"""
    if not job_data or not mapped_data:
        return
    
    unmapped_fields = []
    for key in job_data:
        # Skip None values and empty strings
        if job_data[key] is None or (isinstance(job_data[key], str) and not job_data[key].strip()):
            continue
            
        # Check if key was mapped
        mapped = False
        for mapped_key in mapped_data:
            if mapped_key == key or (isinstance(mapped_data[mapped_key], dict) and 
                                     key in mapped_data[mapped_key]):
                mapped = True
                break
        
        if not mapped:
            unmapped_fields.append(key)
    
    if unmapped_fields:
        logger.info(f"Unmapped fields from {job_source}: {', '.join(unmapped_fields)}")

def validate_job_data(job_data):
    """Validate job data for required fields and data types"""
    required_fields = ["job_title", "job_url"]
    
    # Check required fields
    missing_fields = [field for field in required_fields if field not in job_data]
    if missing_fields:
        logger.warning(f"Job data missing required fields: {', '.join(missing_fields)}")
        return False
    
    # Validate data types for specific fields
    if not isinstance(job_data.get("job_title", ""), str):
        logger.warning("job_title must be a string")
        job_data["job_title"] = str(job_data["job_title"]) if job_data["job_title"] is not None else ""
    
    if not isinstance(job_data.get("job_url", ""), str):
        logger.warning("job_url must be a string")
        job_data["job_url"] = str(job_data["job_url"]) if job_data["job_url"] is not None else ""
    
    # Validate date format if present
    if "date_posted" in job_data and job_data["date_posted"] is not None:
        if not isinstance(job_data["date_posted"], (str, datetime)):
            logger.warning("date_posted must be a string or datetime")
            job_data["date_posted"] = str(job_data["date_posted"])
    
    # Validate salary range if present
    if "salary_range" in job_data and job_data["salary_range"] is not None:
        if not isinstance(job_data["salary_range"], dict):
            logger.warning("salary_range must be a dictionary")
            job_data["salary_range"] = None
    
    return True 