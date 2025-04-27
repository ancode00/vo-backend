# 1. Use Node.js official image
FROM node:18

# 2. Create app directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install app dependencies
RUN npm install

# 5. Copy the entire project
COPY . .

# 6. Build the NestJS project (Optional - if using start:prod)
RUN npm run build

# 7. Your app binds to port 3000
EXPOSE 3000

# 8. Define command to run the app
CMD ["npm", "run", "start:prod"]


