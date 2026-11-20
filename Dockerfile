FROM node:20-alpine
WORKDIR /app
COPY server.js /app/server.js
COPY index.html /app/index.html
ENV PORT=8080
EXPOSE 8080
CMD ["node","/app/server.js"]
