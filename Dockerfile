# Build stage for client
FROM node:18-alpine as client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build stage for server
FROM node:18-alpine as server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built client files
COPY --from=client-build /app/client/build ./client/build

# Copy server files and dependencies
COPY --from=server-build /app/server ./server
COPY --from=server-build /app/server/node_modules ./server/node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_PORT=3000

# Expose ports
EXPOSE 5000
EXPOSE 3000

# Start the server
WORKDIR /app/server
CMD ["node", "index.js"] 