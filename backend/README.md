# KumbhYatra Emergency SOS Backend API

A robust, production-ready backend API for handling emergency SOS incidents during the Kumbh Yatra festival.

## 🚀 Quick Start

### Installation & Setup
```bash
cd backend
npm install
npm run dev    # Development with nodemon
# OR
npm start      # Production
```

The server will start on `http://localhost:3001`

## 📋 API Endpoints

### 1. POST /api/sos
**Create a new SOS incident**

```bash
curl -X POST http://localhost:3001/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical",
    "severity": "high",
    "message": "Heart attack patient needs immediate help",
    "location": {
      "lat": 29.9457,
      "lng": 78.1642,
      "text": "Near Har Ki Pauri, Gate 3"
    },
    "userId": "user-123"
  }'
```

**Request Body:**
- `type` (required): `medical`, `security`, `fire`, `lost_person`, `crowd_control`, `other`
- `severity` (required): `low`, `medium`, `high`, `critical`
- `message` (optional): Description of the emergency (max 1000 chars)
- `location` (required):
  - `lat` (required): Latitude (-90 to 90)
  - `lng` (required): Longitude (-180 to 180)
  - `text` (optional): Human-readable location (max 500 chars)
- `userId` (optional): ID of the person reporting (max 100 chars)
- `incidentId` (optional): Custom incident ID for deduplication

**Response:**
```json
{
  "ok": true,
  "incident": {
    "incidentId": "uuid-generated-id",
    "type": "medical",
    "severity": "high",
    "message": "Heart attack patient needs immediate help",
    "location": {
      "lat": 29.9457,
      "lng": 78.1642,
      "text": "Near Har Ki Pauri, Gate 3"
    },
    "userId": "user-123",
    "status": "reported",
    "createdAt": "2025-09-06T10:30:00.000Z",
    "updatedAt": "2025-09-06T10:30:00.000Z",
    "statusHistory": [
      {
        "status": "reported",
        "timestamp": "2025-09-06T10:30:00.000Z",
        "updatedBy": "system"
      }
    ],
    "assignedTo": null,
    "priority": 12
  }
}
```

### 2. GET /api/sos
**Get all SOS incidents with filtering and pagination**

```bash
# Get all incidents
curl http://localhost:3001/api/sos

# Filter by user
curl "http://localhost:3001/api/sos?userId=user-123"

# Filter by status
curl "http://localhost:3001/api/sos?status=reported"

# Filter by type and severity
curl "http://localhost:3001/api/sos?type=medical&severity=critical"

# Pagination
curl "http://localhost:3001/api/sos?limit=10&offset=0"
```

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (`reported`, `acknowledged`, `in_progress`, `resolved`, `cancelled`)
- `type` (optional): Filter by incident type
- `severity` (optional): Filter by severity level
- `limit` (optional): Number of results (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "ok": true,
  "incidents": [...],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "stats": {
    "total": 25,
    "byStatus": {
      "reported": 5,
      "acknowledged": 8,
      "in_progress": 7,
      "resolved": 5
    },
    "byType": {
      "medical": 10,
      "security": 8,
      "lost_person": 7
    },
    "bySeverity": {
      "critical": 3,
      "high": 8,
      "medium": 10,
      "low": 4
    },
    "recent": 5
  }
}
```

### 3. GET /api/sos/:id
**Get a single SOS incident by ID**

```bash
curl http://localhost:3001/api/sos/uuid-incident-id
```

**Response:**
```json
{
  "ok": true,
  "incident": {
    "incidentId": "uuid-incident-id",
    "type": "medical",
    "severity": "high",
    "message": "Heart attack patient needs immediate help",
    "location": {...},
    "userId": "user-123",
    "status": "in_progress",
    "createdAt": "2025-09-06T10:30:00.000Z",
    "updatedAt": "2025-09-06T10:35:00.000Z",
    "statusHistory": [
      {
        "status": "reported",
        "timestamp": "2025-09-06T10:30:00.000Z",
        "updatedBy": "system"
      },
      {
        "status": "acknowledged",
        "timestamp": "2025-09-06T10:32:00.000Z",
        "updatedBy": "admin-user"
      },
      {
        "status": "in_progress",
        "timestamp": "2025-09-06T10:35:00.000Z",
        "updatedBy": "responder-123"
      }
    ],
    "assignedTo": "responder-123",
    "priority": 12
  }
}
```

### 4. PATCH /api/sos/:id
**Update SOS incident status**

```bash
curl -X PATCH http://localhost:3001/api/sos/uuid-incident-id \
  -H "Content-Type: application/json" \
  -d '{
    "status": "acknowledged",
    "updatedBy": "admin-user",
    "assignedTo": "responder-123"
  }'
```

**Request Body:**
- `status` (required): New status (`acknowledged`, `in_progress`, `resolved`, `cancelled`)
- `updatedBy` (optional): ID of person making the update (default: "admin")
- `assignedTo` (optional): Assign incident to a responder
- `message` (optional): Update the incident message

**Status Transition Rules:**
- `reported` → `acknowledged`, `cancelled`
- `acknowledged` → `in_progress`, `cancelled`
- `in_progress` → `resolved`, `cancelled`
- `resolved` → (final state)
- `cancelled` → (final state)

**Response:**
```json
{
  "ok": true,
  "incident": {
    // Updated incident object with new status and history
  }
}
```

### 5. GET /api/sos-stats
**Get SOS statistics (admin endpoint)**

```bash
curl http://localhost:3001/api/sos-stats
```

### 6. DELETE /api/sos/:id
**Delete SOS incident (admin endpoint)**

```bash
curl -X DELETE http://localhost:3001/api/sos/uuid-incident-id
```

## 🔒 Security Features

### Rate Limiting
- **SOS Creation**: 5 requests per minute per IP
- **General API**: 30 requests per minute per IP

### Input Validation
- All inputs are validated using express-validator
- Comprehensive error messages for invalid data
- SQL injection and XSS protection

### CORS Configuration
- Enabled for multiple localhost ports (3000, 8080-8084, 5173)
- Configurable origins for production deployment

## 💾 Data Persistence

### In-Memory Storage
- Fast access and manipulation
- All data stored in memory during runtime

### File Persistence
- Automatic backup to `backend/data/sos-incidents.json`
- Data survives server restarts
- JSON format for easy debugging

### Deduplication
- Prevents duplicate incidents with same `incidentId`
- Returns existing incident if duplicate detected

## 🏗️ Architecture

### Project Structure
```
backend/
├── server.js              # Main server file
├── package.json            # Dependencies
├── models/
│   └── sosModel.js         # SOS data models and storage
├── routes/
│   └── sosRoutes.js        # API endpoints
├── middleware/
│   └── validation.js       # Input validation
└── data/
    └── sos-incidents.json  # Persistent storage
```

### Key Components

1. **SOSIncident Class**: Data model with validation and business logic
2. **SOSStorage Class**: In-memory storage with file persistence
3. **Express Routes**: RESTful API endpoints
4. **Validation Middleware**: Input sanitization and validation
5. **Rate Limiting**: Abuse prevention

## 🧪 Testing

### Manual Testing Examples

```bash
# Create incident
curl -X POST http://localhost:3001/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical",
    "severity": "critical",
    "message": "Emergency medical assistance needed",
    "location": {"lat": 29.9457, "lng": 78.1642, "text": "Gate 3"},
    "userId": "test-user"
  }'

# List incidents
curl "http://localhost:3001/api/sos?limit=5"

# Update status
curl -X PATCH http://localhost:3001/api/sos/INCIDENT_ID \
  -H "Content-Type: application/json" \
  -d '{"status": "acknowledged", "updatedBy": "admin"}'
```

### Frontend Integration

The backend is designed to work seamlessly with the Kumbh Yatra frontend SOS component. The API contracts match exactly with the expected frontend behavior.

## 🚀 Deployment

### Environment Variables
```bash
PORT=3001                    # Server port
NODE_ENV=production          # Environment
```

### Production Considerations
- Use process manager (PM2) for production
- Set up proper logging (Winston)
- Configure database (PostgreSQL/MongoDB) for production
- Set up monitoring and alerts
- Configure reverse proxy (Nginx)

## 📊 Monitoring

The backend includes:
- Request logging with Morgan
- Error tracking
- Health check endpoint (`/health`)
- Statistics endpoint (`/api/sos-stats`)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.
