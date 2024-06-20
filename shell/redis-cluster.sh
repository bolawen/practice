#!/usr/bin/env bash

BASE_DIR=~/docker/redis-cluster
ANNOUNCE_IP=192.168.0.101

# 使用绝对路径来确保路径解析正确
BASE_DIR=$(cd ~ && mkdir -p docker/redis-cluster && cd docker/redis-cluster && pwd)

for port in $(seq 8001 8006); do
  NODE_DIR=${BASE_DIR}/node-${port}
  CONF_DIR=${NODE_DIR}/conf
  CONF_FILE=${CONF_DIR}/redis.conf
  DATA_DIR=${NODE_DIR}/data

  mkdir -p "${CONF_DIR}" "${DATA_DIR}"

  # 使用单引号和双引号混合，确保变量正确展开
  cat <<EOF >"${CONF_FILE}"
port ${port}
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip ${ANNOUNCE_IP}
cluster-announce-port ${port}
cluster-announce-bus-port 1${port}
appendonly yes
EOF

  # 使用绝对路径，以确保 Docker 能正确解析路径
  docker run -d --name redis-${port} \
    -p ${port}:${port} -p 1${port}:1${port} \
    -v "${DATA_DIR}:/data" \
    -v "${CONF_FILE}:/etc/redis/redis.conf" \
    redis:latest redis-server /etc/redis/redis.conf
done
