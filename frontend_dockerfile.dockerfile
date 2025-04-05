# Frontend Dockerfile
# filepath: frontend/ai-recruit-flow-main/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]