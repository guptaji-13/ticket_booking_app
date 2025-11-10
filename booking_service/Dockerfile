# =========================
# Booking Service Dockerfile
# =========================

FROM node:20-alpine

WORKDIR /app

# Copy package files first (for caching)
COPY ./booking_service/package*.json ./
RUN npm install

# Copy source
COPY ./booking_service .

# copy shared protos
COPY ../protos /protos

# Expose service port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
