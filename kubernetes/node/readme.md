## 日志管理

## Pv Pvc 配置

创建 PersistentVolume 和 PersistentVolumeClaim： 为了确保容器的日志在节点重启或迁移时能够持久化存储，你需要在 Kubernetes 中配置一个 PersistentVolume（PV）和 PersistentVolumeClaim（PVC）。PV 可以使用 NFS、GlusterFS、Ceph 或本地存储等方式。

```js
apiVersion: v1
kind: PersistentVolume
metadata:
  name: backend-server-logs-pv 
spec: 
  capacity:
    storage: 5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  hostPath: 
    path: /mnt/logs


apiVersion: v1
kind: PersistentVolumeClaim
metadata: 
  name: backend-server-logs-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      STORAGE: 5Gi
```

### Deployment 配置

在部署文件中，挂载 PVC 到容器中指定的日志目录。

```js
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node-service
  template:
    metadata:
      labels:
        app: node-service
    spec:
      containers:
      - name: node-service
        image: your-node-app-image
        ports:
        - containerPort: 3000
        volumeMounts:
        - name: logs-volume
          mountPath: /logs  # 容器中日志的存储路径
      volumes:
      - name: logs-volume
        persistentVolumeClaim:
          claimName: logs-pvc  # 使用 PVC 持久化日志
```

### 在 Node.js 应用中配置日志路径

在 Node.js 应用中配置日志路径： 确保 Node.js 应用的日志库（如 winston）将日志写入 /logs 目录。

```js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({ filename: '/logs/app.log' })  // 日志路径映射到 PVC 持久化存储
  ]
});

logger.info('This is a log message');
```

### 使用 Logrotate 管理日志文件大小和数量

logrotate 是一个用于管理日志文件的工具，它可以自动轮转、压缩、删除和邮件通知。它通常用于日志文件较大的系统或应用程序，可以帮助系统管理员减少磁盘空间的占用，并保持日志文件的整洁和可管理性。

Logrotate 的功能：

轮转（Rotate）：当日志文件达到指定大小时，会创建一个新的日志文件，并将当前日志文件重命名为备份文件。
压缩（Compress）：轮转后的旧日志文件会进行压缩，减少磁盘空间的占用。
删除（Remove）：删除历史日志文件，保留一定数量的日志文件，防止占满磁盘空间。
邮件通知（Mail）：在日志文件轮转时发送通知邮件。

使用 Logrotate 管理日志文件大小和数量： 使用 logrotate 来限制日志文件的大小和数量。logrotate 可以定期轮换日志文件，保留一定数量的历史日志文件，并删除过旧的文件。

Logrotate 安装与基本配置： 在大多数 Linux 系统中，logrotate 是预装的。如果没有安装，可以通过包管理器进行安装：

```js
# Debian/Ubuntu 系列
sudo apt-get install logrotate

# RedHat/CentOS 系列
sudo yum install logrotate
```

基本配置文件: Logrotate 的配置文件通常分为两个部分：

主配置文件：通常位于 /etc/logrotate.conf，控制全局设置。

单个日志文件配置：通常位于 /etc/logrotate.d/ 目录下，每个应用或服务的日志都有一个独立的配置文件。

在 logrotate 中，app-logrotate.conf 文件（例如 /etc/logrotate.d/app-logrotate.conf）是你为应用程序或服务单独配置的日志轮转规则文件。这个文件通常位于 /etc/logrotate.d/ 目录下，用来为特定应用或日志文件定义轮转行为。这个文件并不是自动创建的，你需要手动创建或通过应用的安装过程（如果安装脚本有相关配置的话）创建它。

1. 创建一个新的文件 /etc/logrotate.d/app-logrotate.conf，并在其中指定该应用日志的轮转规则。

```js
sudo vim /etc/logrotate.d/app-logrotate.conf
```

配置文件内容示例：

```js
# /etc/logrotate.d/app-logrotate.conf

/var/log/app/*.log {
    daily                 # 日志每天轮转一次
    rotate 7              # 保留最近 7 个日志文件
    compress              # 压缩旧日志文件
    delaycompress         # 延迟压缩，保留最后一个未压缩的日志文件
    missingok             # 如果日志文件不存在，则忽略
    notifempty            # 如果日志文件为空，不进行轮转
    create 0644 root root # 轮转后的日志文件权限和属主
    postrotate            # 轮转后执行的命令
        # 执行应用的日志重载命令（如果需要）
        systemctl reload app  # 重新加载应用，通知应用日志已轮转
    endscript
}
```

配置项说明
/var/log/app/*.log：你需要根据实际情况指定日志文件的路径。* 通配符表示所有日志文件。例如，所有 *.log 文件都会被轮转。
daily：日志文件每天轮转一次。你也可以设置为 weekly 或 monthly，根据实际需求。
rotate 7：保留最近的 7 个日志文件。旧的日志文件会被删除。可以根据需求调整为其他数字。
compress：将轮转后的日志文件压缩。压缩格式通常是 .gz，可以节省磁盘空间。
delaycompress：延迟压缩。即不压缩最后一个轮转的日志文件，等下次轮转时才压缩。
missingok：如果日志文件丢失，logrotate 会忽略，不报错。
notifempty：如果日志文件为空，则不进行轮转。
create 0644 root root：为新创建的日志文件设置权限和属主，确保应用能正常写入。
postrotate：指定在日志轮转后执行的命令。这通常用于通知服务（如 Nginx、Node.js 应用）重新加载日志文件，防止应用写入到已被轮转的日志文件。


在 Kubernetes 中使用 logrotate

如果你在 Kubernetes 环境中使用 logrotate，通常需要通过 initContainer 或者 CronJob 定期执行 logrotate 命令。你可以将 app-logrotate.conf 文件作为 ConfigMap 或者直接挂载到容器中，并定期执行 logrotate。通过 Kubernetes 的 ConfigMap，你可以将 logrotate 配置文件挂载到容器中，从而实现对应用程序日志的定期轮转管理。具体步骤包括：

1. 创建 logrotate 配置文件，并将其存储在 ConfigMap 中。
2. 将 ConfigMap 挂载到容器中，使容器能够读取该配置文件。
3. 使用 CronJob 定期执行 logrotate 命令，确保日志文件按预定规则进行轮转。

这样，你就可以在 Kubernetes 中自动管理应用程序的日志，并避免日志文件过大占用过多磁盘空间。

接下来，我们将这个 logrotate 配置文件存储到 Kubernetes ConfigMap 中。假设文件路径是 /etc/logrotate.d/app-logrotate.conf，你可以通过以下 YAML 文件创建 ConfigMap。

创建一个名为 logrotate-config 的 ConfigMap：

```js
apiVersion: v1
kind: ConfigMap
metadata:
  name: logrotate-config
  namespace: default
data:
  app-logrotate.conf: |
    /var/log/app/*.log {
        daily
        rotate 7
        compress
        delaycompress
        missingok
        notifempty
        create 0644 root root
        postrotate
            systemctl reload app
        endscript
    }
```

使用以下命令创建 ConfigMap：

```js
kubectl apply -f logrotate-configmap.yaml
```

此时，ConfigMap 将在 Kubernetes 集群中创建，并包含 app-logrotate.conf 文件的内容。

将 ConfigMap 挂载到容器中

在 Kubernetes 中，你可以将 ConfigMap 挂载到容器的文件系统中。修改你的 Deployment 或 Pod 配置文件，将 logrotate 配置文件挂载到容器内的指定路径。

假设你的容器中需要将 logrotate 配置文件挂载到 /etc/logrotate.d/ 目录下，可以在 Deployment 配置中添加 volumes 和 volumeMounts 字段。

```js
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node-service
  template:
    metadata:
      labels:
        app: node-service
    spec:
      containers:
      - name: node-service
        image: your-node-app-image
        volumeMounts:
        - name: logrotate-config-volume
          mountPath: /etc/logrotate.d  # 将 ConfigMap 挂载到容器的 /etc/logrotate.d 目录
      volumes:
      - name: logrotate-config-volume
        configMap:
          name: logrotate-config  # 挂载的 ConfigMap 名称
```

在上面的例子中，logrotate-config ConfigMap 被挂载到容器的 /etc/logrotate.d/ 目录下。容器启动后，它将能够使用这个配置文件进行日志轮转。

使用 CronJob 定期执行 logrotate：为了定期执行 logrotate，你可以使用 Kubernetes CronJob 来自动运行 logrotate 命令。假设我们希望每天午夜执行一次日志轮转。


```js
apiVersion: batch/v1
kind: CronJob
metadata:
  name: logrotate-cron
spec:
  schedule: "0 0 * * *"  # 每天午夜执行一次
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: logrotate
            image: busybox
            command:
              - "/bin/sh"
              - "-c"
              - "logrotate /etc/logrotate.d/app-logrotate.conf"  # 执行 logrotate 命令
          restartPolicy: OnFailure
```

在这个配置中，logrotate-cron 每天午夜执行一次日志轮转，并使用容器中挂载的 /etc/logrotate.d/app-logrotate.conf 配置文件。

步骤 5: 部署和验证
应用 ConfigMap 和 CronJob 配置：

bash
复制代码
kubectl apply -f logrotate-configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f cronjob.yaml
检查 CronJob 是否运行：

查看 logrotate 的 CronJob 是否按预期执行：

bash
复制代码
kubectl get cronjob logrotate-cron
你还可以查看 CronJob 执行的日志，验证 logrotate 是否正常运行：

bash
复制代码
kubectl logs -l job-name=<job-name>  # 查看 CronJob 相关的 pod 日志


### 查看日志

tail -n 10 /mnt/logs/app.log  # 查看 app.log 文件的最后 10 行

sudo tail -n 10 /mnt/logs/app.log