# Stage 1: Build the Angular application
FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve the Angular application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/chat-application.client/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf