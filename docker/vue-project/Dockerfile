# 阶段一、构建阶段 使用 Node.js 官方镜像安装依赖并构建 Vue.js 应用。
# 1.1 使用 Node.js 镜像作为构建阶段的基础镜像
# 1.2 设置工作目录为 /app
# 1.3 将 package.json 和 package-lock.json 复制到 /app 目录
# 1.4 安装项目依赖
# 1.5 将项目文件复制到 /app 目录
# 1.6 运行 npm run build 构建 Vue.js 应用
FROM node:latest as nodeBuilder
WORKDIR /app
COPY package*.json /app 
RUN npm install 
COPY . /app
RUN npm run build 

# 阶段二、运行阶段 使用 Nginx 官方镜像作为基础镜像，将构建的文件复制到 Nginx 静态文件目录。
# 2.1 使用 Nginx 镜像作为运行阶段的基础镜像
# 2.2 将构建阶段生成的 dist 目录下的文件复制到 Nginx 静态文件目录
# 2.3 将自定义的 nginx.conf 配置文件复制到 Nginx 配置文件目录
# 2.4 暴露 80 端口并启动 Nginx 服务
# 2.5 使用 nginx -g "daemon off;" 命令启动 Nginx 服务
FROM nginx:latest
COPY --from=nodeBuilder /app/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/nginx/conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]