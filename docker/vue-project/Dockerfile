# 指定node镜像
FROM node as builder

# 指定工作目录
WORKDIR /vue-project

# 代码复制到容器中
ADD . /vue-project

# 安装依赖
RUN npm install

# 打包
RUN npm run build

# RUN ls

# 指定nginx镜像
FROM nginx

# 复制打包后的代码到nginx容器中
COPY --from=builder /vue-project/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80
