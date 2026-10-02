# 1. Use the official lightweight Node.js 20 image as our base environment
FROM node:20-alpine

# 2. Set the working directory inside the virtual container container
WORKDIR /app

# 3. Copy package files first to leverage Docker's caching system for dependencies
COPY package*.json ./

# 4. Install only production dependencies cleanly
RUN apk add --no-cache openssl
RUN npm ci

# 5. Copy the Prisma schema explicitly so the client can build
COPY prisma ./prisma/

# 6. Generate the Prisma Client tailored for this container environment
RUN npx prisma generate

# 7. Copy the rest of your backend source code files
COPY . .

# 8. Compile TypeScript to JavaScript
RUN npm run build

# 9. Expose the port your Express server listens on
EXPOSE 5000

# 10. Run the compiled JS directly (no ts-node, no nodemon)
CMD ["node", "dist/server.js"]

