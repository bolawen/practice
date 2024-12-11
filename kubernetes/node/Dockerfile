FROM registry.cn-hangzhou.aliyuncs.com/bolawen/node:22.7.0-linux-arm64
WORKDIR /server
COPY package*.json /server 
RUN npm install --registry=https://registry.npmmirror.com
COPY . /server 

ENV APP_ENV=test
ENV APP_PORT=3000
ENV DB_PASSWORD=defaultpassword

EXPOSE 3000
CMD ["node","index.js"]