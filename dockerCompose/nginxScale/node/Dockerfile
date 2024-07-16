FROM node:latest
WORKDIR /service
COPY package*.json /service
RUN npm install 
COPY . /service 
EXPOSE 3000
CMD ["node", "index.js"]