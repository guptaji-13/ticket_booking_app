# =========================
# Search Service Dockerfile
# =========================

FROM node:20-alpine

WORKDIR /app

# Copy package files first (for caching)
COPY ./search_service/package*.json ./
RUN npm install

# Copy source
COPY ./search_service .

# Expose service port
EXPOSE 3002

# Default command
CMD ["npm", "run", "dev"]
