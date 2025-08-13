FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]