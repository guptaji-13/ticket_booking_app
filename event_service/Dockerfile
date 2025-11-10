# =========================
# Event Service Dockerfile
# =========================

FROM node:20-alpine

WORKDIR /app

# Copy package files first (for caching)
COPY ./event_service/package*.json ./

RUN npm install

# Copy source
COPY ./event_service .

# copy shared protos
COPY ../protos /protos

# Expose service port
EXPOSE 3001

# Default command
CMD ["npm", "run", "dev"]
