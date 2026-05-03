# Change alpine to slim
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

EXPOSE 5173

# Vite needs --host to be accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]