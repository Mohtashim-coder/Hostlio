# Hostlio Property Listing Backend API Documentation

## Overview

This document describes the backend APIs for Hostlio's property listing system, implementing the workflows defined in the Design Strategy Document.

---

## 1. Property Submission Flow

### Workflow A: Direct Contact (Credit-Based)

1. Owner uploads property (photos + video + geo-tagged photo)
2. **Backend saves with status: `pending`**
3. Admin reviews and approves or rejects
4. **Backend updates status: `live` or `rejected`**
5. Property goes LIVE on platform
6. Tenant browses and finds listing
7. Tenant clicks "Contact Owner"
8. Owner WhatsApp revealed if tenant has credits

---

## 2. API Endpoints

### 2.1 Owner: Create Property Listing

**Endpoint:** `POST /api/properties`

**Authentication:** Required (`x-user-id` header, user must have role: `owner`)

**Request Body:**

```json
{
  "title": "2 BHK Flat in Boring Road",
  "description": "Spacious flat with excellent lighting...",
  "type": "Flat",
  "rent": 12000,
  "deposit": 36000,
  "maintenance_charges": 1200,
  "electricity_bill_per_unit": 6,
  "address": "123 Boring Road",
  "city": "Patna",
  "pincode": "800020",
  "geo_tag_photo": {
    "url": "https://cloudinary-url.com/photo.jpg",
    "geolocation": {
      "latitude": 25.5941,
      "longitude": 85.1376
    }
  },
  "photos": [
    "https://cloudinary-url.com/photo1.jpg",
    "https://cloudinary-url.com/photo2.jpg",
    "https://cloudinary-url.com/photo3.jpg"
  ],
  "video": ["https://cloudinary-url.com/video1.mp4"],
  "availability_date": "2026-05-15",
  "opening_time": "10:00",
  "closing_time": "18:00",
  "owner_whatsapp": "9876543210",
  "bhk_type": "2 BHK",
  "area_sqft": 1200,
  "furnishing": "Semi Furnished",
  "amenities": ["WiFi", "AC", "Parking"],
  "furniture_available": ["Bed", "Table"],
  "preferred_tenants": "Everyone",
  "restrictions": ["No Smoking"],
  "parking": "Both"
}
```

**Required Fields:**

- `title` (string, min 5 chars)
- `description` (string, min 20 chars)
- `type` (enum: Flat, PG, Room, Hostel, Hotel, Godam, Lodge, Office)
- `rent` (number, > 0)
- `deposit` (number, > 0)
- `address` (string, min 5 chars)
- `city` (string)
- `pincode` (string, 6 digits)
- `geo_tag_photo` (object with url and geolocation) **[MANDATORY for fraud prevention]**
- `photos` (array, min 3, max 20) **[Min 3 required]**
- `availability_date` (ISO date string)
- `owner_whatsapp` (string, 10 digits)

**Optional Fields:**

- `maintenance_charges`
- `electricity_bill_per_unit`
- `video` (array, max 2 videos)
- `opening_time`, `closing_time`
- `bhk_type` (for Flats/PGs)
- `area_sqft`
- `furnishing`
- `amenities` (array)
- `furniture_available` (array)
- `preferred_tenants`
- `restrictions` (array)
- `parking`
- `landmarks` (array of landmark objects)

**Response (201):**

```json
{
  "message": "Property submitted successfully for admin verification",
  "property": {
    "id": "507f1f77bcf86cd799439011",
    "status": "pending",
    "title": "2 BHK Flat in Boring Road",
    "city": "Patna",
    "created_at": "2026-04-28T10:30:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed with details
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not an owner

---

### 2.2 List Properties (Public)

**Endpoint:** `GET /api/properties`

**Authentication:** Not required

**Query Parameters:**

- `status` (string, default: "live") - Filter by status
- `city` (string) - Filter by city
- `type` (string) - Filter by property type
- `page` (number, default: 1) - Pagination
- `limit` (number, default: 20) - Results per page

**Example:** `GET /api/properties?city=Patna&type=Flat&status=live&page=1`

**Response:**

```json
{
  "properties": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "2 BHK Flat",
      "description": "...",
      "type": "Flat",
      "rent": 12000,
      "city": "Patna",
      "status": "live",
      "photos": ["url1", "url2", "url3"],
      "amenities": ["WiFi", "AC"]
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Note:** `owner_whatsapp` is hidden from public view. Revealed only after tenant purchases credits.

---

### 2.3 Get Single Property

**Endpoint:** `GET /api/properties/[id]`

**Authentication:** Not required (but owner WhatsApp only visible to authenticated owner or admin)

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "2 BHK Flat in Boring Road",
  "description": "...",
  "type": "Flat",
  "rent": 12000,
  "deposit": 36000,
  "maintenance_charges": 1200,
  "address": "123 Boring Road",
  "city": "Patna",
  "pincode": "800020",
  "photos": ["url1", "url2", "url3"],
  "geo_tag_photo": {
    "url": "https://...",
    "geolocation": {
      "latitude": 25.5941,
      "longitude": 85.1376
    }
  },
  "status": "live",
  "owner_whatsapp": "hidden_unless_auth",
  "amenities": ["WiFi", "AC", "Parking"],
  "created_at": "2026-04-28T10:30:00Z"
}
```

---

### 2.4 Owner: Update Property

**Endpoint:** `PUT /api/properties/[id]`

**Authentication:** Required (owner of the property)

**Request Body:** Same as POST, but only editable fields

**Status Behavior:**

- If status is `pending`: Allows direct update
- If status is `live`: Changes status to `edit_requested` (requires admin re-approval)
- Other statuses: Cannot be edited

**Response:**

```json
{
  "message": "Property updated successfully",
  "property": {
    "id": "507f1f77bcf86cd799439011",
    "status": "edit_requested",
    "title": "2 BHK Flat in Boring Road"
  }
}
```

---

### 2.5 Owner: Delete Property

**Endpoint:** `DELETE /api/properties/[id]`

**Authentication:** Required (owner of the property)

**Restriction:** Only allows deletion of `pending` properties

**Response:**

```json
{
  "message": "Property deleted successfully"
}
```

---

### 2.6 Owner: View Own Listings

**Endpoint:** `GET /api/owner/listings`

**Authentication:** Required

**Query Parameters:**

- `status` (optional) - Filter by status
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**

```json
{
  "properties": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "2 BHK Flat",
      "status": "pending",
      "city": "Patna",
      "rent": 12000,
      "created_at": "2026-04-28T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  },
  "statusCounts": {
    "pending": 2,
    "live": 2,
    "booked": 1,
    "rejected": 0,
    "removed": 0,
    "edit_requested": 0
  }
}
```

---

### 2.7 Admin: View Properties for Verification

**Endpoint:** `GET /api/admin/listings`

**Authentication:** Required (user must have role: `admin`)

**Query Parameters:**

- `status` (default: "pending")
- `city` (optional filter)
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** Same as listing endpoint but includes `owner_whatsapp` and contact details

---

### 2.8 Admin: Approve/Reject Property

**Endpoint:** `PATCH /api/admin/listings`

**Authentication:** Required (admin only)

**Request Body:**

```json
{
  "propertyId": "507f1f77bcf86cd799439011",
  "newStatus": "live",
  "rejectionReason": "Optional - only for rejections"
}
```

**Valid Status Transitions:**

- From `pending` → `live` (approve), `rejected`, `removed`
- From `live` → `booked` (deal closed), `removed` (owner request)
- From `edit_requested` → `live` (re-approve), `rejected`

**Pre-Approval Checks:**

- ✓ Geo-tagged photo must exist with coordinates
- ✓ Minimum 3 photos required
- ✓ All required fields must be filled

**Response (Approval):**

```json
{
  "message": "Property live successfully",
  "property": {
    "id": "507f1f77bcf86cd799439011",
    "status": "live",
    "title": "2 BHK Flat",
    "city": "Patna",
    "approved_at": "2026-04-28T12:00:00Z"
  }
}
```

**Response (Rejection):**

```json
{
  "message": "Property rejected successfully",
  "property": {
    "id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "rejection_reason": "Photos do not match actual property"
  }
}
```

---

## 3. Property Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│ OWNER SUBMITS PROPERTY                                      │
│ Status → "pending"                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌──────────┐
   │ LIVE   │    │REJECTED│    │ REMOVED  │
   │(Approved)   │(Admin) │    │(by Admin)│
   └────┬───┘    └────────┘    └──────────┘
        │
        │ (Tenant makes deal / Owner requests edit)
        ▼
   ┌──────────────┐
   │   BOOKED     │
   │(Deal Closed) │
   └──────────────┘

Edit Request Flow:
┌────────┐
│ LIVE   │
└───┬────┘
    │ Owner requests edit
    ▼
┌──────────────┐
│EDIT_REQUESTED│ (Admin re-reviews)
└───┬──────────┘
    │
    ├──→ LIVE (re-approved)
    └──→ REJECTED (not approved)
```

---

## 4. Data Model

### Property Schema

```typescript
{
  _id: ObjectId,
  owner_id: ObjectId,
  title: String,
  description: String,
  type: Enum, // Flat, PG, Room, Hostel, Hotel, Godam, Lodge, Office
  rent: Number,
  deposit: Number,
  maintenance_charges: Number,
  electricity_bill_per_unit: Number,
  address: String,
  city: String,
  pincode: String,
  geo_tag_photo: {
    url: String,
    geolocation: {
      latitude: Number,
      longitude: Number
    }
  },
  photos: [String],
  video: [String],
  status: Enum, // pending, live, booked, rejected, removed, edit_requested
  rejection_reason: String,
  amenities: [String],
  furnishing: String,
  preferred_tenants: String,
  parking: String,
  contact_unlocks: Number, // Count of times owner contact was revealed
  created_at: Date,
  updated_at: Date,
  approved_at: Date,
  approved_by: ObjectId
}
```

---

## 5. Error Codes

| Code | Meaning           | Example                             |
| ---- | ----------------- | ----------------------------------- |
| 400  | Validation failed | Missing required fields             |
| 401  | Unauthorized      | No auth token                       |
| 403  | Forbidden         | Not owner of property, or not admin |
| 404  | Not found         | Property ID doesn't exist           |
| 500  | Server error      | Database connection failed          |

---

## 6. Best Practices

### For Frontend

1. **Always include geo-tagged photo** - Required for fraud prevention
2. **Validate photos before upload** - Minimum 3, max 20
3. **Store owner WhatsApp securely** - Never expose in local storage
4. **Check status before actions** - Different status = different permissions
5. **Handle rejection reasons** - Display to owner with actionable feedback

### For Admin

1. **Review geo-photo first** - Most fraud prevention measure
2. **Check photo count** - Minimum 3 is enforced
3. **Verify owner contact** - Must be 10-digit valid number
4. **Add rejection reason** - Helps owner improve submission
5. **Approve quickly** - Pending listings impact user trust

### For Backend

1. **Index queries** - Properties are queried by status, city, owner
2. **Soft deletes** - Consider soft delete instead of hard delete
3. **Audit trail** - Log all admin actions
4. **Email notifications** - Send to owner on approval/rejection
5. **Cache live listings** - Popular listings should be cached

---

## 7. Integration Checklist

- [ ] Database indices created (status, city, owner_id)
- [ ] Image upload to Cloudinary working
- [ ] Geolocation capture integrated
- [ ] Owner role verification working
- [ ] Admin role verification working
- [ ] Email notifications configured
- [ ] Error handling comprehensive
- [ ] Rate limiting on creation endpoints
- [ ] Pagination tested
- [ ] Search filters tested

---

## 8. Future Enhancements

- [ ] Bulk property import for owners
- [ ] Property duplicate detection
- [ ] AI-powered fraud detection on photos
- [ ] Price comparison tools
- [ ] Nearby amenities auto-fetch (Google Maps API)
- [ ] Property analytics dashboard
- [ ] Scheduled listing expiry
- [ ] Trending properties ranking

---

**Last Updated:** April 28, 2026  
**API Version:** v1.0  
**Status:** Production Ready
