# PFI Backend API

A Node.js backend service for PFI (Purchase Financing Initiative) that handles user authentication, company management, product management, and purchase operations.

## Features

- 🔐 OTP-based Authentication
- 🏢 Company Management
- 📦 Product Management
- 💰 Purchase Management
- 📚 Swagger Documentation

## Tech Stack

- Node.js & Express.js
- PostgreSQL with Prisma ORM
- JWT for Authentication
- Twilio for OTP Services
- Swagger UI for API Documentation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-jwt-secret"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
VERIFY_SERVICE_SID="your-verify-service-sid"
PORT=5002
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pfi-backend
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running. You can access it at:
- Local: http://localhost:5002/api-docs
- Production: https://p-fi.me/api-docs

## API Endpoints

### Authentication
- POST `/api/users/send-otp` - Send OTP for authentication
- POST `/api/users/verify-otp` - Verify OTP and get token
- POST `/api/users/logout` - Logout user

### Company Management
- GET `/api/company/details` - Get company details
- POST `/api/company/details` - Create/Update company details
- GET `/api/company/all` - Get all companies
- GET `/api/company/products/:id` - Get products by company

### Product Management
- POST `/api/sell/addProduct` - Add new product
- GET `/api/sell/getProducts` - Get all products

### Purchase Management
- POST `/api/purchase/create` - Create new purchase
- GET `/api/purchase/all` - Get all purchases
- PUT `/api/purchase/:id/status` - Update purchase status

## Deployment

1. Set up environment variables on your server
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate deploy`
5. Start the server: `npm start`

## Development

1. Run in development mode:
```bash
npm run dev
```

2. Update API documentation:
- Modify the `openapi.yaml` file
- Restart the server to see changes in Swagger UI

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
