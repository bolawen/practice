FROM node:latest
WORKDIR /server
COPY package*.json /server
RUN npm install
COPY . /server
EXPOSE 4000
CMD ["node","index.js"]