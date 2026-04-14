# ============================================
# Stage 1: Build stage
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for potential build steps)
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 2: Production stage
# ============================================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies and curl for healthcheck
RUN npm ci --only=production && \
    npm cache clean --force && \
    apk add --no-cache curl && \
    rm -rf /tmp/*

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3200/health || exit 1

# Use node directly (no shell wrapper for better signal handling)
CMD ["node", "server.js"]