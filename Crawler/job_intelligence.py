import re
import json
import nltk
import requests
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Download NLTK resources for text analysis (uncomment if needed)
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet')

# Google Natural Language API settings
GOOGLE_API_KEY = "YOUR_API_KEY"  # Replace with your actual API key
GOOGLE_NL_API_URL = "https://language.googleapis.com/v1/documents:analyzeEntities"

# Field name synonyms for dynamic field mapping
FIELD_SYNONYMS = {
    # Job title related
    "job_title": ["title", "position", "role", "designation", "job name", "post"],
    "job_level": ["seniority", "level", "grade", "position level", "rank"],
    "job_function": ["department", "functional area", "team", "division"],
    
    # Skills related
    "skills_required": ["skills", "requirements", "qualifications", "tech stack", "technologies", 
                       "technical skills", "competencies", "abilities", "proficiencies"],
    
    # Experience related
    "experience_range": ["experience", "years of experience", "work experience", 
                        "minimum experience", "required experience", "exp."],
    
    # Company related
    "company_name": ["company", "employer", "organization", "firm", "business"],
    "company_industry": ["industry", "sector", "domain", "field"],
    "company_size": ["size", "employees", "headcount", "workforce size", 
                    "number of employees", "company strength", "team size"],
    
    # Location related
    "location": ["place", "city", "area", "region", "state", "country", "address"],
    "remote_work": ["remote", "work from home", "wfh", "telecommute", "virtual", "hybrid"],
    
    # Salary related
    "salary_range": ["salary", "compensation", "pay", "remuneration", "package", "ctc", "stipend"],
    
    # Education related
    "education_required": ["education", "degree", "qualification", "academic requirement", 
                          "educational qualification", "academic qualification"]
}

# Patterns for extracting information
SALARY_PATTERNS = [
    r'(\$[\d,]+\.?\d*)\s*-\s*(\$[\d,]+\.?\d*)',  # $50,000 - $70,000
    r'(\$[\d,]+\.?\d*)\s*to\s*(\$[\d,]+\.?\d*)',  # $50,000 to $70,000
    r'([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)\s*(\w+)',  # 50,000 - 70,000 USD
    r'([\d,]+\.?\d*)\s*to\s*([\d,]+\.?\d*)\s*(\w+)',  # 50,000 to 70,000 USD
    r'([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)\s*lakhs',  # 5 - 8 lakhs (Indian format)
    r'([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)\s*lpa',  # 5 - 8 lpa (lakhs per annum, Indian format)
]

EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*-\s*(\d+)\+?\s*years',  # 2 - 5 years
    r'(\d+)\+?\s*to\s*(\d+)\+?\s*years',  # 2 to 5 years
    r'(\d+)\+?\s*years',  # 5+ years
    r'minimum\s*(\d+)\s*years',  # minimum 3 years
    r'at\s*least\s*(\d+)\s*years',  # at least 3 years
    r'(\d+)\s*\+\s*years',  # 5 + years
    r'(\d+)(?:\s*\+)?\s*yrs?',  # 5+ yrs or 5 yr
    r'(\d+)(?:\s*\+)?\s*yr\.?\s*exp',  # 5+ yr exp
    r'(\d+)(?:\s*\+)?\s*years.{0,30}experience',  # 5+ years of experience
]

JOB_LEVEL_MAPPING = {
    "entry_level": ["entry level", "junior", "fresher", "trainee", "associate", "beginner", "novice", "0-1 year"],
    "mid_level": ["mid level", "intermediate", "experienced", "2-5 years", "3-5 years"],
    "senior_level": ["senior", "lead", "manager", "expert", "principal", "6+ years", "5+ years"],
    "executive": ["director", "head", "chief", "executive", "vp", "vice president", "cxo", "c-level"]
}

def normalize_date_posted(date_str):
    """Convert various date formats to a standard datetime object"""
    if pd.isna(date_str) or date_str is None:
        return None
        
    date_str = str(date_str).lower().strip()
    
    # Handle relative dates
    if "just now" in date_str or "moments ago" in date_str or "recently" in date_str:
        return datetime.now()
    
    if "today" in date_str:
        return datetime.now()
        
    if "yesterday" in date_str:
        return datetime.now() - timedelta(days=1)
        
    if "hour" in date_str or "minute" in date_str:
        # Handle "X hours ago", "X minutes ago"
        numbers = re.findall(r'\d+', date_str)
        if numbers:
            num = int(numbers[0])
            if "hour" in date_str:
                return datetime.now() - timedelta(hours=num)
            else:  # minutes
                return datetime.now() - timedelta(minutes=num)
        return datetime.now() - timedelta(hours=12)  # Approximate if no number found
    
    if "day" in date_str or "days" in date_str:
        numbers = re.findall(r'\d+', date_str)
        if numbers:
            days = int(numbers[0])
            return datetime.now() - timedelta(days=days)
    
    if "week" in date_str:
        numbers = re.findall(r'\d+', date_str)
        if numbers:
            weeks = int(numbers[0])
            return datetime.now() - timedelta(days=weeks*7)
    
    if "month" in date_str:
        numbers = re.findall(r'\d+', date_str)
        if numbers:
            months = int(numbers[0])
            return datetime.now() - timedelta(days=months*30)  # Approximation
    
    # Try to parse standard date formats
    try:
        # Common formats in job listings
        for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y", "%b %d, %Y", "%B %d, %Y", 
                   "%d %b %Y", "%d %B %Y", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S"]:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
    except Exception:
        # If all parsing attempts fail, default to None
        return None
    
    # If we couldn't parse it, return None
    return None

def is_date_within_range(date_obj, days=7):
    """Check if a date is within the specified number of days from now"""
    if date_obj is None:
        return False
        
    cut_off_date = datetime.now() - timedelta(days=days)
    return date_obj >= cut_off_date

def extract_salary_range(text):
    """Extract salary range from job description"""
    if pd.isna(text) or text is None:
        return None
        
    text = str(text).lower()
    
    for pattern in SALARY_PATTERNS:
        matches = re.search(pattern, text)
        if matches:
            groups = matches.groups()
            
            if len(groups) >= 2:
                # Clean the values
                min_salary = re.sub(r'[^\d.]', '', groups[0])
                max_salary = re.sub(r'[^\d.]', '', groups[1])
                
                try:
                    min_salary = float(min_salary)
                    max_salary = float(max_salary)
                    
                    # Determine currency
                    currency = "USD"  # Default
                    if len(groups) > 2 and groups[2]:
                        curr = groups[2].upper()
                        if curr in ["USD", "EUR", "GBP", "INR", "AUD", "CAD"]:
                            currency = curr
                    elif "$" in text:
                        currency = "USD"
                    elif "€" in text:
                        currency = "EUR"
                    elif "£" in text:
                        currency = "GBP"
                    elif "₹" in text or "inr" in text.lower() or "rupee" in text.lower():
                        currency = "INR"
                    
                    # Handle Indian salary formats (lakhs)
                    if "lakh" in text or "lpa" in text:
                        currency = "INR"
                        min_salary = min_salary * 100000  # 1 lakh = 100,000 INR
                        max_salary = max_salary * 100000
                    
                    return {
                        "min_amount": min_salary,
                        "max_amount": max_salary,
                        "currency": currency
                    }
                except (ValueError, TypeError):
                    continue
    
    return None

def extract_experience_range(text):
    """Extract experience requirements from job description"""
    if pd.isna(text) or text is None:
        return None
        
    text = str(text).lower()
    
    for pattern in EXPERIENCE_PATTERNS:
        matches = re.search(pattern, text)
        if matches:
            groups = matches.groups()
            
            if len(groups) >= 1:
                try:
                    min_exp = int(groups[0])
                    
                    if len(groups) >= 2 and groups[1]:
                        max_exp = int(groups[1])
                    else:
                        max_exp = min_exp
                        
                    # If format is X+ years, set max to a reasonable value
                    if "+" in text and max_exp == min_exp:
                        max_exp = min_exp + 5
                        
                    return {
                        "min_years": min_exp,
                        "max_years": max_exp
                    }
                except (ValueError, TypeError):
                    continue
    
    # Check for entry-level keywords
    entry_level_keywords = ["entry level", "fresher", "no experience", "0 years", "0-1 year", "junior", 
                           "trainee", "internship", "graduate"]
    for keyword in entry_level_keywords:
        if keyword in text:
            return {
                "min_years": 0,
                "max_years": 1
            }
    
    return None

def infer_job_level(job_data):
    """Infer job level from title and description"""
    job_level = None
    
    # Check existing job_level field first
    if "job_level" in job_data and job_data["job_level"]:
        return job_data["job_level"]
    
    text_to_check = ""
    if "job_title" in job_data:
        text_to_check += " " + job_data["job_title"].lower()
    if "job_description" in job_data:
        text_to_check += " " + job_data["job_description"].lower()
    
    # Check for level indicators in text
    for level, keywords in JOB_LEVEL_MAPPING.items():
        for keyword in keywords:
            if keyword in text_to_check:
                return level
    
    # If we have experience range, use it to infer level
    if "experience_range" in job_data and job_data["experience_range"]:
        exp_range = job_data["experience_range"]
        min_years = exp_range.get("min_years", 0)
        
        if min_years < 2:
            return "entry_level"
        elif min_years < 5:
            return "mid_level"
        elif min_years < 10:
            return "senior_level"
        else:
            return "executive"
            
    return job_level

def extract_skills(job_data, common_skills=None):
    """Extract skills from job description"""
    if "job_description" not in job_data or not job_data["job_description"]:
        return []
        
    # Use common skills list if provided
    if common_skills is None:
        # Default list of common technical skills
        common_skills = [
            # Programming languages
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust",
            # Web technologies
            "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", "asp.net",
            # Databases
            "sql", "mysql", "postgresql", "mongodb", "oracle", "redis", "cassandra", "elasticsearch",
            # Cloud & DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible", "ci/cd",
            # Data science & ML
            "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "nlp",
            # Other tech
            "rest api", "graphql", "microservices", "git", "agile", "scrum", "jira"
        ]
    
    found_skills = []
    description = job_data["job_description"].lower()
    
    # Extract skills from description based on common skills list
    for skill in common_skills:
        # Use word boundary matching for more accurate detection
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, description, re.IGNORECASE):
            found_skills.append(skill)
    
    # If we already have skills in the job data, combine them
    if "skills_required" in job_data and job_data["skills_required"]:
        existing_skills = job_data["skills_required"]
        if isinstance(existing_skills, list):
            # Combine but avoid duplicates
            all_skills = existing_skills + [s for s in found_skills if s.lower() not in [e.lower() for e in existing_skills]]
            return all_skills
        elif isinstance(existing_skills, str):
            # Split string by commas and combine
            skill_list = [s.strip() for s in existing_skills.split(',')]
            all_skills = skill_list + [s for s in found_skills if s.lower() not in [e.lower() for e in skill_list]]
            return all_skills
    
    return found_skills

def call_google_nlp_api(text, api_key=GOOGLE_API_KEY):
    """Call Google's Natural Language API to analyze entities in text"""
    if not api_key or api_key == "YOUR_API_KEY":
        return None
        
    headers = {
        'Content-Type': 'application/json'
    }
    
    data = {
        'document': {
            'type': 'PLAIN_TEXT',
            'content': text
        },
        'encodingType': 'UTF8'
    }
    
    url = f"{GOOGLE_NL_API_URL}?key={api_key}"
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API call failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error calling Google NLP API: {str(e)}")
        return None

def enhance_job_data(job_data, use_google_api=False):
    """Enhance job data with inferred fields and normalized values"""
    enhanced_data = job_data.copy()
    
    # Normalize date_posted
    if "date_posted" in enhanced_data:
        date_obj = normalize_date_posted(enhanced_data["date_posted"])
        if date_obj:
            enhanced_data["date_posted"] = date_obj
            # Add days_ago field for convenience
            days_ago = (datetime.now() - date_obj).days
            enhanced_data["days_ago"] = days_ago
    
    # Extract or enhance salary information
    if "job_description" in enhanced_data and ("salary_range" not in enhanced_data or not enhanced_data["salary_range"]):
        salary_range = extract_salary_range(enhanced_data["job_description"])
        if salary_range:
            enhanced_data["salary_range"] = salary_range
    
    # Extract or enhance experience information
    if "job_description" in enhanced_data and ("experience_range" not in enhanced_data or not enhanced_data["experience_range"]):
        experience_range = extract_experience_range(enhanced_data["job_description"])
        if experience_range:
            enhanced_data["experience_range"] = experience_range
    
    # Infer job level
    job_level = infer_job_level(enhanced_data)
    if job_level:
        enhanced_data["job_level"] = job_level
    
    # Extract skills
    if "job_description" in enhanced_data:
        skills = extract_skills(enhanced_data)
        if skills:
            enhanced_data["skills_required"] = skills
    
    # Use Google NLP API for additional entity extraction if requested
    if use_google_api and "job_description" in enhanced_data:
        api_result = call_google_nlp_api(enhanced_data["job_description"])
        if api_result and "entities" in api_result:
            # Process entities based on type (ORGANIZATION, LOCATION, etc.)
            orgs = []
            locations = []
            skills = []
            
            for entity in api_result["entities"]:
                entity_type = entity.get("type")
                entity_name = entity.get("name")
                
                if entity_type == "ORGANIZATION" and entity_name:
                    orgs.append(entity_name)
                elif entity_type == "LOCATION" and entity_name:
                    locations.append(entity_name)
                elif entity_type == "SKILL" and entity_name:
                    skills.append(entity_name)
            
            # Add extracted entities to enhanced data
            if orgs and "mentioned_organizations" not in enhanced_data:
                enhanced_data["mentioned_organizations"] = orgs
            
            if locations and "mentioned_locations" not in enhanced_data:
                enhanced_data["mentioned_locations"] = locations
            
            if skills:
                if "skills_required" not in enhanced_data:
                    enhanced_data["skills_required"] = skills
                else:
                    existing_skills = enhanced_data["skills_required"]
                    if isinstance(existing_skills, list):
                        enhanced_data["skills_required"] = existing_skills + [s for s in skills if s not in existing_skills]
    
    return enhanced_data

def filter_jobs_by_date(jobs, days_old):
    """Filter jobs based on how many days ago they were posted"""
    filtered_jobs = []
    
    for job in jobs:
        # Check if date_posted exists and is a datetime object
        if "date_posted" in job:
            date_value = job["date_posted"]
            
            # If it's already a datetime object
            if isinstance(date_value, datetime):
                date_obj = date_value
            # If it's a string, try to normalize it
            elif isinstance(date_value, str):
                date_obj = normalize_date_posted(date_value)
            else:
                date_obj = None
            
            # Include job if date is within range or if we have days_ago field that's within range
            if date_obj and is_date_within_range(date_obj, days_old):
                filtered_jobs.append(job)
            elif "days_ago" in job and job["days_ago"] <= days_old:
                filtered_jobs.append(job)
        # If no date info, include the job
        else:
            filtered_jobs.append(job)
    
    return filtered_jobs 