## Backend Improvements Needed for Image Support

### 1. Add ThumbnailUrl to ItemDto

**File**: `UniShareProject.services/Models/ItemDTOs.cs`

Add this property to the `ItemDto` class:

```csharp
/// <summary>
/// First image URL for thumbnail display (optional)
/// </summary>
[Description("First image URL for thumbnail display")]
public string? ThumbnailUrl { get; set; }

/// <summary>
/// All image URLs for the item (optional, for detailed views)
/// </summary>
[Description("All image URLs for the item")]
public List<string>? Images { get; set; }
```

### 2. Update AutoMapper Profile

**File**: `UniShareProject.services/Mapping/UniShareProfile.cs`

Add custom mapping logic to populate images:

```csharp
// In UniShareProfile constructor, update Item -> ItemDto mapping:
CreateMap<Item, ItemDto>()
    .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ItemID))
    .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryID))
    .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category))
    .ForMember(dest => dest.ConditionId, opt => opt.MapFrom(src => src.ConditionID))
    .ForMember(dest => dest.StatusId, opt => opt.MapFrom(src => src.StatusID))
    .ForMember(dest => dest.SellerId, opt => opt.MapFrom(src => src.SellerID))
    .ForMember(dest => dest.ThumbnailUrl, opt => opt.MapFrom(src => 
        src.Images != null && src.Images.Any() ? src.Images.First().ImageUrl : null))
    .ForMember(dest => dest.Images, opt => opt.MapFrom(src => 
        src.Images != null ? src.Images.Select(img => img.ImageUrl).ToList() : new List<string>()));
```

### 3. Update Repository Queries to Include Images

**File**: `UniShareProject.Repository/Implementations/ItemRepository.cs`

Ensure search queries include images:

```csharp
// Update SearchAsync method to include images
public async Task<PagedResult<Item>> SearchAsync(int? categoryId, byte? statusId, byte? conditionId, string? q, PageSpec page, CancellationToken ct)
{
    // ... existing code ...
    
    // Update the query to include images
    var query = @"
        SELECT i.*, img.ImageID, img.ImageURL
        FROM dbo.Items i
        LEFT JOIN dbo.ItemImages img ON i.ItemID = img.ItemID
        WHERE (@CategoryId IS NULL OR i.CategoryID = @CategoryId)
        AND (@StatusId IS NULL OR i.StatusID = @StatusId)
        AND (@ConditionId IS NULL OR i.ConditionID = @ConditionId)
        AND (@SearchQuery IS NULL OR i.Title LIKE @SearchQuery OR i.Description LIKE @SearchQuery)
        ORDER BY i.PostedDate DESC
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
    
    // Use QueryAsync with proper object mapping to handle images
}
```

### 4. Alternative: Service-Level Image Loading

**File**: `UniShareProject.services/Implementations/ItemService.cs`

If repository changes are complex, add image loading in the service:

```csharp
public async Task<PagedResultDto<ItemDto>> SearchAsync(SearchItemsRequest req, CancellationToken ct)
{
    var pageSpec = req.ToPageSpec();
    var pagedResult = await _itemRepository.SearchAsync(
        req.CategoryId, 
        req.StatusId, 
        req.ConditionId, 
        req.Q, 
        pageSpec, 
        ct);
    
    var itemDtos = _mapper.Map<IEnumerable<ItemDto>>(pagedResult.Items);
    
    // Load thumbnails for each item
    foreach (var itemDto in itemDtos)
    {
        var images = await _itemImageRepository.GetUrlsAsync(itemDto.Id, ct);
        itemDto.ThumbnailUrl = images.FirstOrDefault();
        itemDto.Images = images.ToList();
    }
    
    return new PagedResultDto<ItemDto>(
        itemDtos,
        pagedResult.Total,
        pagedResult.Page,
        pagedResult.PageSize,
        pagedResult.TotalPages,
        pagedResult.HasNextPage,
        pagedResult.HasPreviousPage
    );
}
```

### 5. Update Get Single Item Endpoint

**File**: `UniShareProject.services/Implementations/ItemService.cs`

```csharp
public async Task<ItemDto?> GetAsync(int id, CancellationToken ct)
{
    var item = await _itemRepository.GetByIdAsync(id, ct);
    if (item == null) return null;
    
    var itemDto = _mapper.Map<ItemDto>(item);
    
    // Load images
    var images = await _itemImageRepository.GetUrlsAsync(id, ct);
    itemDto.ThumbnailUrl = images.FirstOrDefault();
    itemDto.Images = images.ToList();
    
    return itemDto;
}
```

## Quick Win: Use Service-Level Approach

The easiest approach is #4 - loading images in the service layer. This requires minimal changes and doesn't affect the repository or database queries.