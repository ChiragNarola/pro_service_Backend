# Inventory Categories API Documentation

This document describes the API endpoints for managing inventory categories in the system.

## Base URL
All endpoints are prefixed with `/company/{companyId}/inventory/categories`

## Authentication
All endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Categories
**GET** `/company/{companyId}/inventory/categories`

Retrieves a paginated list of inventory categories for a specific company.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Electronics",
        "description": "Electronic devices and components",
        "status": true,
        "companyId": "uuid",
        "createdBy": "user-id",
        "createdDate": "2024-01-01T00:00:00.000Z",
        "modifiedBy": null,
        "modifiedDate": null,
        "deletedBy": null,
        "deletedDate": null,
        "isDeleted": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Category by ID
**GET** `/company/{companyId}/inventory/categories/{categoryId}`

Retrieves a specific inventory category by its ID.

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "description": "Electronic devices and components",
    "status": true,
    "companyId": "uuid",
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": null,
    "modifiedDate": null,
    "deletedBy": null,
    "deletedDate": null,
    "isDeleted": false
  }
}
```

### 3. Create New Category
**POST** `/company/{companyId}/inventory/categories`

Creates a new inventory category.

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and components",
  "status": true
}
```

**Validation Rules:**
- `name`: Required, max 100 characters
- `description`: Optional, max 100 characters
- `status`: Optional boolean (default: true)

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "description": "Electronic devices and components",
    "status": true,
    "companyId": "uuid",
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": null,
    "modifiedDate": null,
    "deletedBy": null,
    "deletedDate": null,
    "isDeleted": false
  }
}
```

### 4. Update Category
**PUT** `/company/{companyId}/inventory/categories/{categoryId}`

Updates an existing inventory category.

**Request Body:**
```json
{
  "name": "Updated Electronics",
  "description": "Updated description",
  "status": false
}
```

**Validation Rules:**
- `name`: Optional, max 100 characters
- `description`: Optional, max 100 characters
- `status`: Optional boolean

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "Updated Electronics",
    "description": "Updated description",
    "status": false,
    "companyId": "uuid",
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": "user-id",
    "modifiedDate": "2024-01-01T12:00:00.000Z",
    "deletedBy": null,
    "deletedDate": null,
    "isDeleted": false
  }
}
```

### 5. Delete Category
**DELETE** `/company/{companyId}/inventory/categories/{categoryId}`

Soft deletes an inventory category (marks as deleted but doesn't remove from database).

**Response:**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "description": "Electronic devices and components",
    "status": true,
    "companyId": "uuid",
    "createdBy": "user-id",
    "createdDate": "2024-01-01T00:00:00.000Z",
    "modifiedBy": "user-id",
    "modifiedDate": "2024-01-01T12:00:00.000Z",
    "deletedBy": "user-id",
    "deletedDate": "2024-01-01T12:00:00.000Z",
    "isDeleted": true
  }
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "isSuccess": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "isSuccess": false,
  "message": "Unauthorized access"
}
```

**404 Not Found:**
```json
{
  "isSuccess": false,
  "message": "Category not found"
}
```

**500 Internal Server Error:**
```json
{
  "isSuccess": false,
  "message": "Error creating inventory category"
}
```

## Frontend Integration

The frontend API functions are available in `src/feature/inventory/api.ts`:

```typescript
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/feature/inventory/api';

// Usage examples:
const categories = await getCategories(companyId, 1, 10);
const category = await getCategoryById(companyId, categoryId);
const newCategory = await createCategory(companyId, { name: "Electronics", description: "Electronic devices" });
const updatedCategory = await updateCategory(companyId, categoryId, { status: false });
await deleteCategory(companyId, categoryId);
```

## Database Schema

The inventory categories are stored in the `InventoryCategory` table with the following structure:

- `id`: UUID primary key
- `companyId`: UUID foreign key to CompanyDetail
- `name`: VARCHAR(100) - Category name (unique per company)
- `description`: VARCHAR(100) - Optional description
- `status`: BOOLEAN - Active/inactive status
- `createdBy`: VARCHAR(100) - User who created the category
- `createdDate`: DATETIME - Creation timestamp
- `modifiedBy`: VARCHAR(100) - User who last modified
- `modifiedDate`: DATETIME - Last modification timestamp
- `deletedBy`: VARCHAR(100) - User who deleted (soft delete)
- `deletedDate`: DATETIME - Deletion timestamp
- `isDeleted`: BOOLEAN - Soft delete flag
