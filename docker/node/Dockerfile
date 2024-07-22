FROM node:latest
WORKDIR /app
COPY . /app 
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --retries=3 CMD curl -f http://localhost:3000 || exit 1
CMD ["node","index.js"]