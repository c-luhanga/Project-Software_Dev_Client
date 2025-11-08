# File Upload System Implementation Guide

## Overview

Your UniShare application now supports **actual file uploads** instead of just URL storage. This implementation provides a robust, scalable solution for handling image uploads with support for both local development and cloud production environments.

## 🏗️ Architecture

### Components Created

1. **IFileUploadService** - Abstraction interface for file storage
2. **LocalFileUploadService** - Development implementation (stores in `wwwroot/uploads`)
3. **S3FileUploadService** - Production implementation (stores in AWS S3)
4. **New API Endpoint** - `POST /api/items/{id}/upload-images` for actual file uploads
5. **Static File Serving** - Configured to serve uploaded images securely

### Database Integration

The system seamlessly integrates with your existing database structure:
- **ItemImages Table**: Still stores URLs (now pointing to uploaded files)
- **4 Image Limit**: Business rule enforcement maintained
- **Existing API**: `POST /api/items/{id}/images` still works for URL-based images

## 🚀 Usage

### Frontend Integration

#### Option 1: Direct File Upload (Recommended)
```typescript
// New file upload endpoint
const uploadImages = async (itemId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await fetch(`/api/items/${itemId}/upload-images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json(); // Returns array of image URLs
};
```

#### Option 2: Traditional URL Upload (Still Available)
```typescript
// Existing URL-based endpoint
const addImageUrls = async (itemId: number, imageUrls: string[]) => {
  const response = await fetch(`/api/items/${itemId}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ imageUrls })
  });

  return await response.json();
};
```

### React Component Example

```tsx
import React, { useState } from 'react';

interface ImageUploadProps {
  itemId: number;
  onUploadComplete: (urls: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ itemId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validation
    if (selectedFiles.length > 4) {
      alert('Maximum 4 files allowed');
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isImage && isValidSize;
    });

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`/api/items/${itemId}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const imageUrls = await response.json();
      onUploadComplete(imageUrls);
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {files.length > 0 && (
        <div>
          <p>Selected files: {files.map(f => f.name).join(', ')}</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🔧 Backend Configuration

### Development Setup (Local Files)

Your current configuration uses local file storage. Files are stored in:
```
wwwroot/
└── uploads/
    └── items/
        ├── item_1_20241108_143022_a1b2c3d4.jpg
        ├── item_2_20241108_143055_e5f6g7h8.png
        └── ...
```

**Accessible via**: `https://yourdomain.com/uploads/items/filename.jpg`

### Production Setup (AWS S3)

To switch to S3 for production:

#### 1. Install AWS SDK
```bash
cd "Project Solution/UniShareProject.services"
dotnet add package AWSSDK.S3
```

#### 2. Update Program.cs
```csharp
// Replace the LocalFileUploadService registration with:
var environment = builder.Environment;

if (environment.IsDevelopment())
{
    builder.Services.AddScoped<IFileUploadService, LocalFileUploadService>();
}
else
{
    // Configure S3 settings
    builder.Services.Configure<S3FileUploadSettings>(builder.Configuration.GetSection("S3FileUpload"));
    
    // Register AWS S3 client
    builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
    builder.Services.AddAWSService<IAmazonS3>();
    
    // Register S3 file upload service
    builder.Services.AddScoped<IFileUploadService, S3FileUploadService>();
}
```

#### 3. Add S3 Configuration
```json
// appsettings.Production.json
{
  "S3FileUpload": {
    "BucketName": "unishare-images",
    "Region": "us-east-1",
    "CloudFrontDomain": "d123456789.cloudfront.net",
    "UseServerSideEncryption": true,
    "DefaultAcl": "private"
  },
  "AWS": {
    "Profile": "default",
    "Region": "us-east-1"
  }
}
```

#### 4. AWS Infrastructure Setup

**S3 Bucket Policy Example**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowUniShareAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:role/UniShareAppRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::unishare-images/*"
    }
  ]
}
```

**CloudFront Distribution** (optional but recommended):
- Origin: Your S3 bucket
- Viewer Protocol Policy: HTTPS Only
- Caching: Customize based on your needs
- Custom Domain: Configure if desired

## 🔒 Security Features

### File Validation
- **File Type**: Only image files (jpg, png, gif, webp, bmp)
- **File Size**: Maximum 5MB per file
- **File Count**: Maximum 4 images per item
- **Content Type**: Validated against MIME type

### Security Headers
```csharp
// Added automatically for static file serving
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: public, max-age=2592000
```

### Access Control
- **Authentication Required**: All uploads require valid JWT token
- **Authorization**: Only item owner or admin can upload
- **Private Storage**: S3 objects are private by default

## 📊 Monitoring & Performance

### Logging
The system provides comprehensive logging:
```csharp
Logger.LogInformation("Successfully uploaded {Count} files for item {ItemId} by user {ActorId}. Total images: {TotalCount}");
Logger.LogError(ex, "Upload operation failed for item {ItemId} by user {ActorId}");
```

### Performance Optimizations
- **Parallel Uploads**: Multiple files uploaded concurrently
- **CDN Support**: CloudFront integration for faster delivery
- **Caching**: 30-day cache headers for images
- **Cleanup**: Automatic rollback on batch upload failures

## 🧪 Testing

### Manual Testing

#### 1. Test File Upload Endpoint
```bash
# Test with curl
curl -X POST "https://localhost:5001/api/items/1/upload-images" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@test-image1.jpg" \
  -F "files=@test-image2.png"
```

#### 2. Test Validation
```bash
# Test file size limit (should fail)
curl -X POST "https://localhost:5001/api/items/1/upload-images" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@large-file.jpg"

# Test invalid file type (should fail)
curl -X POST "https://localhost:5001/api/items/1/upload-images" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@document.pdf"
```

#### 3. Test Image Access
```bash
# Verify uploaded image is accessible
curl -I "https://localhost:5001/uploads/items/item_1_20241108_143022_a1b2c3d4.jpg"
```

### Unit Testing Examples

```csharp
[Test]
public async Task UploadImageAsync_ValidFile_ReturnsPublicUrl()
{
    // Arrange
    var mockFile = new Mock<IFormFile>();
    mockFile.Setup(f => f.Length).Returns(1024 * 1024); // 1MB
    mockFile.Setup(f => f.ContentType).Returns("image/jpeg");
    mockFile.Setup(f => f.FileName).Returns("test.jpg");
    
    // Act
    var result = await _fileUploadService.UploadImageAsync(mockFile.Object, 1);
    
    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result, Does.StartWith("http"));
}

[Test]
public void UploadImageAsync_FileTooLarge_ThrowsArgumentException()
{
    // Arrange
    var mockFile = new Mock<IFormFile>();
    mockFile.Setup(f => f.Length).Returns(10 * 1024 * 1024); // 10MB
    
    // Act & Assert
    Assert.ThrowsAsync<ArgumentException>(() => 
        _fileUploadService.UploadImageAsync(mockFile.Object, 1));
}
```

## 🔄 Migration Path

### Existing Data
Your existing URL-based images continue to work without any changes. The new system is additive:

1. **Existing items** with URL-based images function normally
2. **New uploads** use the file upload system
3. **Mixed approach** is supported (some images as URLs, some as uploads)

### Frontend Updates
Update your frontend components gradually:

1. **Keep existing URL input** for backward compatibility
2. **Add file upload component** for new functionality
3. **Allow users to choose** between URL and file upload

## 🚨 Troubleshooting

### Common Issues

#### 1. "File upload service not registered"
**Solution**: Ensure `IFileUploadService` is registered in Program.cs:
```csharp
builder.Services.AddScoped<IFileUploadService, LocalFileUploadService>();
```

#### 2. "Static files not served"
**Solution**: Verify static file middleware is configured:
```csharp
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions { /* upload config */ });
```

#### 3. "Images not accessible"
**Solution**: Check that wwwroot/uploads directory exists and has proper permissions.

#### 4. "S3 upload fails"
**Solution**: Verify AWS credentials and S3 bucket permissions.

### Debug Mode
Enable detailed logging in development:
```json
{
  "Logging": {
    "LogLevel": {
      "UniShareProject.services.Implementations": "Debug"
    }
  }
}
```

## 📈 Next Steps

### Immediate Actions
1. **Test the new endpoint** with your frontend
2. **Update your ItemImage component** to handle both URL and uploaded images
3. **Add file upload UI** to your AddImagesDialog component

### Future Enhancements
1. **Image Processing**: Add thumbnail generation, compression
2. **Progressive Upload**: Implement chunk-based uploads for large files
3. **Image Optimization**: WebP conversion, multiple sizes
4. **Content Moderation**: Implement inappropriate content detection
5. **Analytics**: Track upload success rates and performance

### Production Deployment
1. **Set up AWS S3 bucket** with appropriate permissions
2. **Configure CloudFront** for global CDN delivery
3. **Update environment variables** for production
4. **Monitor storage costs** and implement lifecycle policies

---

## 📞 Support

Your image storage system is now production-ready with:
- ✅ **Dual support**: URL-based and file upload
- ✅ **Security**: Comprehensive validation and access control
- ✅ **Scalability**: Local development, cloud production
- ✅ **Performance**: CDN support and caching
- ✅ **Monitoring**: Comprehensive logging and error handling

The implementation follows SOLID principles and is easily extensible for future storage providers (Azure Blob, Google Cloud, etc.).