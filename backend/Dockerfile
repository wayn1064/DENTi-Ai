FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma Client if prisma schema exists
RUN if [ -d "prisma" ]; then npx prisma generate; fi

# Build the app (assuming there is a build script, e.g. tsc)
RUN npm run build --if-present

# Start the application on the provided PORT or default 5001
ENV PORT=5001
CMD ["npm", "start"]
