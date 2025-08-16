# Job Search API Authentication Setup

This document explains how to set up authentication for the Job Search API to ensure only authenticated users can search for jobs.

## Overview

The Job Search API now requires authentication via JWT tokens from Supabase. Users must be logged in to search for jobs, and all search requests must include a valid Bearer token in the Authorization header.

## Backend Setup

### 1. Environment Variables

Set the following environment variables in your backend:

```bash
# Supabase Configuration
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
SUPABASE_URL=https://your-project.supabase.co
```

### 2. Install Dependencies

Make sure you have the required dependencies:

```bash
pip install -r requirements.txt
```

The key dependency for authentication is:
- `PyJWT>=2.8.0` - For JWT token verification

### 3. JWT Secret

To get your Supabase JWT secret:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `JWT Secret` value
4. Set it as the `SUPABASE_JWT_SECRET` environment variable

## Frontend Setup

### 1. Authentication Context

The frontend already includes an `AuthContext` that manages user authentication state. Users must be logged in to access the search functionality.

### 2. Protected Routes

The Search page is now wrapped with a `ProtectedRoute` component that:
- Checks if the user is authenticated
- Shows a login prompt for unauthenticated users
- Redirects to the login page if needed

### 3. API Calls

All job search API calls now automatically include the user's authentication token:

```typescript
// The searchJobs function automatically includes auth headers
const response = await fetch('/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify(searchParams),
});
```

## API Endpoints

### Protected Endpoints

The following endpoints now require authentication:

- `POST /api/search` - Search for jobs
- `GET /api/search` - Search for jobs (GET method)

### Public Endpoints

These endpoints remain public:

- `GET /api/health` - Health check
- `GET /api/sites` - List supported job sites

## Authentication Flow

1. **User Login**: User logs in through the frontend authentication system
2. **Token Generation**: Supabase generates a JWT token for the user
3. **Search Request**: When searching for jobs, the frontend includes the token
4. **Token Verification**: Backend verifies the JWT token
5. **Request Processing**: If valid, the job search proceeds; if invalid, returns 401

## Error Handling

### Authentication Errors

The API returns the following error responses for authentication issues:

- `401 Unauthorized` - Missing or invalid token
- `401 Token Expired` - Token has expired
- `401 Invalid Token` - Malformed or invalid token

### Frontend Error Handling

The frontend automatically handles authentication errors by:
- Showing appropriate error messages
- Redirecting unauthenticated users to login
- Providing clear feedback about authentication requirements

## Security Considerations

### JWT Verification

- Tokens are verified on every request
- Expired tokens are automatically rejected
- Token issuer is verified against your Supabase URL

### Production Recommendations

1. **Use HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit JWT secrets to version control
3. **Token Expiry**: Set appropriate token expiry times in Supabase
4. **Rate Limiting**: Consider implementing rate limiting for search endpoints

## Testing Authentication

### Test with Valid Token

```bash
curl -X POST https://your-api.com/api/search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"search": "software engineer", "location": "New York"}'
```

### Test without Token

```bash
curl -X POST https://your-api.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"search": "software engineer", "location": "New York"}'
```

This should return a 401 Unauthorized response.

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Ensure the user is logged in
   - Check that the JWT token is being sent in the Authorization header

2. **"Invalid token" error**
   - Verify your `SUPABASE_JWT_SECRET` is correct
   - Check that the token hasn't expired
   - Ensure the token is from your Supabase project

3. **"Token expired" error**
   - The user needs to log in again to get a fresh token
   - Check your Supabase JWT expiry settings

### Debug Mode

Enable debug logging by setting the log level in your backend:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Support

If you encounter issues with authentication setup:

1. Check the backend logs for detailed error messages
2. Verify your environment variables are set correctly
3. Ensure your Supabase project is properly configured
4. Check that the frontend is sending the correct Authorization header
