# Company Update API Documentation

## Overview
This document describes the Company Update API endpoints that have been added to the pro-service backend.

## Endpoints

### 1. Update Company
**PUT** `/company/{companyId}`

Updates company details by company ID.

#### Authentication
- Requires Bearer token authentication
- User must be authenticated

#### Path Parameters
- `companyId` (string, UUID, required): The ID of the company to update

#### Request Body
```json
{
  "companyName": "Updated Company Name",
  "companyEmail": "updated@company.com",
  "industry": "Technology",
  "companyMobileNumber": "+1234567890",
  "address": "123 Updated Street",
  "city": "Updated City",
  "state": "Updated State",
  "planId": "uuid-of-plan",
  "isActive": true,
  "paymentMethod": "Credit Card"
}
```

All fields are optional. Only include the fields you want to update.

#### Validation Rules
- `companyName`: 1-100 characters
- `companyEmail`: Valid email format, max 255 characters
- `industry`: Max 255 characters
- `companyMobileNumber`: Max 20 characters
- `address`: 1-255 characters
- `city`: 1-255 characters
- `state`: 1-255 characters
- `planId`: Valid UUID format
- `isActive`: Boolean
- `paymentMethod`: Max 20 characters

#### Response

**Success (200)**
```json
{
  "isSuccess": true,
  "message": "Company updated successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "companyName": "Updated Company Name",
    "companyEmail": "updated@company.com",
    "industry": "Technology",
    "companyMobileNumber": "+1234567890",
    "address": "123 Updated Street",
    "city": "Updated City",
    "state": "Updated State",
    "planId": "uuid",
    "isActive": true,
    "paymentDateTime": "2024-01-01T00:00:00.000Z",
    "startDateTime": "2024-01-01T00:00:00.000Z",
    "paymentMethod": "Credit Card",
    "endDateTime": null,
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": "user-id",
    "modifiedDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**
- `400`: Bad request (validation error or missing company ID)
- `404`: Company not found
- `409`: Company email already exists
- `500`: Internal server error

### 2. Get Company by ID
**GET** `/company/{companyId}`

Retrieves company details by company ID.

#### Authentication
- Requires Bearer token authentication
- User must be authenticated

#### Path Parameters
- `companyId` (string, UUID, required): The ID of the company to retrieve

#### Response

**Success (200)**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "companyName": "Company Name",
    "companyEmail": "company@example.com",
    "industry": "Technology",
    "companyMobileNumber": "+1234567890",
    "address": "123 Street",
    "city": "City",
    "state": "State",
    "planId": "uuid",
    "isActive": true,
    "paymentDateTime": "2024-01-01T00:00:00.000Z",
    "startDateTime": "2024-01-01T00:00:00.000Z",
    "paymentMethod": "Credit Card",
    "endDateTime": null,
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": null,
    "modifiedDate": null,
    "subscription": {
      // Subscription details if available
    },
    "user": {
      "id": "uuid",
      "name": "User Name",
      "lastName": "User Last Name",
      "email": "user@example.com",
      "status": "Active"
    }
  }
}
```

**Error Responses**
- `400`: Bad request (missing company ID)
- `404`: Company not found
- `500`: Internal server error

## Business Logic

### Update Company Service
The update company service includes the following business logic:

1. **Existence Check**: Verifies that the company exists before attempting to update
2. **Email Uniqueness**: Ensures that if the email is being updated, it's not already taken by another company
3. **Audit Trail**: Automatically sets `modifiedBy` and `modifiedDate` fields
4. **Partial Updates**: Only updates the fields provided in the request body

### Error Handling
- **404 Not Found**: When the specified company ID doesn't exist
- **409 Conflict**: When trying to update to an email that's already in use by another company
- **400 Bad Request**: When validation fails or required parameters are missing
- **500 Internal Server Error**: For unexpected server errors

## Usage Examples

### cURL Example
```bash
# Update company
curl -X PUT \
  http://localhost:3000/company/123e4567-e89b-12d3-a456-426614174000 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName": "New Company Name",
    "companyEmail": "newemail@company.com",
    "industry": "Healthcare"
  }'

# Get company details
curl -X GET \
  http://localhost:3000/company/123e4567-e89b-12d3-a456-426614174000 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

// Update company
const updateCompany = async (companyId, updateData, token) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/company/${companyId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating company:', error.response.data);
    throw error;
  }
};

// Get company
const getCompany = async (companyId, token) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/company/${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting company:', error.response.data);
    throw error;
  }
};
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT authentication
2. **Authorization**: The API uses the existing authentication middleware
3. **Input Validation**: All inputs are validated using Joi schemas
4. **SQL Injection Protection**: Uses Prisma ORM for safe database operations
5. **Audit Trail**: All updates are tracked with user ID and timestamp

## Dependencies

The company update API uses the following dependencies:
- `express`: Web framework
- `joi`: Input validation
- `@prisma/client`: Database ORM
- `jsonwebtoken`: JWT authentication (via middleware) 