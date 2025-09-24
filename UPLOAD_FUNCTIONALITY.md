# Profile Image Upload Functionality

This document describes the profile image upload functionality that has been implemented.

## Backend Implementation

### 1. File Upload Middleware (`src/middlewares/uploadMiddleware.ts`)
- Uses Multer for handling multipart/form-data uploads
- Stores files in `uploads/profile-images/` directory
- Generates unique filenames with timestamps
- Validates file types (images only)
- 5MB file size limit

### 2. Upload Controller (`src/controllers/uploadController.ts`)
- Handles POST requests to `/upload/profile-image`
- Updates user's profilePhotoURL in database
- Returns success response with image URL

### 3. Upload Routes (`src/routes/uploadRoutes.ts`)
- POST `/upload/profile-image` - Upload profile image
- Requires authentication
- Uses multer middleware for file handling

### 4. Database Schema
- `User.profilePhotoURL` field stores the image path/URL
- Max length: 1000 characters

## Frontend Implementation

### 1. API Service (`src/feature/user/slice.ts`)
- `uploadProfileImage(file: File)` function
- Sends FormData with multipart/form-data content type

### 2. EditAdmin Component Updates
- Enhanced file input handling
- Real-time image upload with progress feedback
- Proper image URL construction for display
- Toast notifications for upload status

## Usage

1. User selects an image file using the profile picture upload button
2. File is immediately uploaded to the server
3. Server saves the file and updates the user's profilePhotoURL
4. Frontend displays the uploaded image
5. User can save the form to persist changes

## API Endpoints

### Upload Profile Image
- **POST** `/upload/profile-image`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `multipart/form-data` with `profileImage` field
- **Response**: 
```json
{
  "success": true,
  "data": {
    "profilePhotoURL": "/uploads/profile-images/profile-1234567890-123456789.jpg",
    "user": { ... }
  }
}
```

## File Storage
- Images are stored in `uploads/profile-images/`
- Filename format: `profile-{timestamp}-{random}.{extension}`
- Accessible via static file serving at `/uploads/profile-images/{filename}`

## Security Considerations
- File type validation (images only)
- File size limits (5MB)
- Authentication required
- Unique filenames to prevent conflicts
