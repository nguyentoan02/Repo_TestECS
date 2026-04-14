# Backend API

A RESTful API built with Express.js and MySQL for managing authors and books. This backend service provides CRUD operations for authors and books with proper error handling, logging, and database connection pooling.

## Features

- RESTful API endpoints for Authors and Books
- MySQL database with connection pooling
- Structured logging using Pino
- CORS enabled for cross-origin requests
- Health check endpoint for monitoring
- Error handling middleware
- Environment-based configuration
- Docker containerization support

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 4.x
- **Database**: MySQL 2
- **Logging**: Pino with pino-http and pino-pretty
- **Container**: Docker with multi-stage build

## Project Structure

```
backend/
├── app.js                 # Express application setup
├── server.js              # Server entry point
├── configs/
│   ├── db.js             # MySQL connection pool configuration
│   └── logger.js         # Pino logger configuration
├── controllers/
│   ├── AuthorsController.js
│   └── BooksController.js
├── routes/
│   └── index.js          # API route definitions
├── db.sql                # Database schema and seed data
├── Dockerfile            # Multi-stage Docker build
└── package.json
```

## API Endpoints

### Authors

- `GET /api/authors` - Get all authors
- `POST /api/authors` - Create a new author
- `PUT /api/authors/:id` - Update an author by ID
- `DELETE /api/authors/:id` - Delete an author by ID

### Books

- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book by ID
- `DELETE /api/books/:id` - Delete a book by ID

### Health Check

- `GET /health` - Health check endpoint (returns 200 OK)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3200
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=appuser
DB_PASSWORD=your_password
DB_NAME=react_node_app
DB_CONN_LIMIT=10
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
   - Create a MySQL database
   - Run the SQL script:
```bash
mysql -u root -p < db.sql
```

3. Configure environment variables (create `.env` file)

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3200`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run serve` - Start with PM2 process manager

## Docker

### Build the Docker image:

```bash
docker build -t backend-api .
```

### Run the container:

```bash
docker run -p 3200:3200 \
  -e DB_HOST=your_db_host \
  -e DB_PORT=3306 \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=your_db_name \
  backend-api
```

The Dockerfile uses a multi-stage build for optimized image size and includes:
- Health check configuration
- Non-root user for security
- Production dependencies only

## Database Schema

### Author Table

- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(255))
- `birthday` (DATE)
- `bio` (TEXT)
- `createdAt` (DATE)
- `updatedAt` (DATE)

### Book Table

- `id` (INT, Primary Key, Auto Increment)
- `title` (VARCHAR(255))
- `releaseDate` (DATE)
- `description` (TEXT)
- `pages` (INT)
- `createdAt` (DATE)
- `updatedAt` (DATE)
- `authorId` (INT, Foreign Key to Author.id)

## Logging

The application uses Pino for structured logging. Logs include:
- HTTP request/response logging via pino-http
- Error logging with context
- Database connection status

## Error Handling

The application includes centralized error handling middleware that:
- Logs errors with request context
- Returns appropriate HTTP status codes
- Provides error messages in JSON format

## Production Considerations

- Database connection pooling is configured for optimal performance
- Health check endpoint is available for load balancer health checks
- Docker image is optimized with multi-stage builds
- Non-root user is used in Docker container for security
- Environment variables should be managed securely (e.g., AWS Secrets Manager)
