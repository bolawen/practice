function createNameElement(isme, name) {
  const nammeEl = document.createElement("strong");
  nammeEl.innerText = isme ? `:${name}` : `${name}:`;
  return nammeEl;
}

function createMessageContentElement(type, message) {
  switch (type) {
    case "text":
      return document.createTextNode(message);
    case "image":
      const img = document.createElement("img");
      img.src = message;
      img.style.maxWidth = "200px";
      return img;
    case "audio":
      const audio = document.createElement("audio");
      audio.src = message;
      audio.controls = true;
      return audio;
    default:
      return document.createTextNode("未知消息类型");
  }
}

export default class Dialogue {
  constructor(params) {
    const { role, senderId, containerMap } = params;

    this.role = role;
    this.senderId = senderId;

    // WebSocket
    this.socket = null;

    // 消息列表
    this.messagesList = [];

    // 录制功能
    this.recordedBlobs = [];
    this.mediaRecorder = null;

    // 容器配置
    this.containerMap = containerMap;
  }

  start() {
    this.socket = new WebSocket(
      `ws://localhost:3000?role=${this.role}&user-id=${this.senderId}`
    );

    this.socket.onopen = () => {
      this.handleSocketOpen();
    };

    this.socket.onmessage = (event) => {
      this.handleSocketMessage(event);
    };

    this.socket.onclose = () => {
      this.handleSocketClose();
    };

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const {
      sendTextBtnEl,
      sendImageBtnEl,
      startRecordEl,
      stopRecordEl,
      sendRecordEl,
    } = this.containerMap || {};
    sendTextBtnEl?.addEventListener("click", this.sendText.bind(this));
    sendImageBtnEl?.addEventListener("click", this.sendImage.bind(this));
    startRecordEl?.addEventListener("click", this.startRecord.bind(this));
    stopRecordEl?.addEventListener("click", this.stopRecord.bind(this));
    sendRecordEl?.addEventListener("click", this.sendRecord.bind(this));
  }

  handleSocketOpen() {
    console.log(`${this.role} WebSocket Connected`);
  }

  handleSocketClose() {
    console.log(`${this.role} WebSocket Closed`);
  }

  handleSocketMessage(event) {
    const message = JSON.parse(event.data);

    this.receiveMessage(message);
  }

  receiveMessage(message) {
    const { type, userId, supportId } = message;

    switch (type) {
      case "connected":
        this.receiverId = supportId;
        break;
      case "new_user":
        this.receiverId = userId;
        break;
      default:
        break;
    }

    const normalizedName =
      message.senderId ||
      message.recipientId ||
      message.supportId ||
      message.userId;

    this.appendMessageElement({
      isme: false,
      type: message.type,
      name: normalizedName,
      message: message.text,
    });
    this.messagesList.push({
      isme: false,
      type: message.type,
      name: normalizedName,
      message: message.text,
    });
  }

  sendMessage(type, message) {
    this.socket.send(
      JSON.stringify({ type, text: message, recipientId: this.receiverId })
    );
    this.appendMessageElement({
      type,
      message,
      name: "我",
      isme: true,
    });
    this.messagesList.push({
      type,
      message,
      name: "我",
      isme: true,
    });
  }

  appendMessageElement(params) {
    const { name, isme, type, message } = params;
    const { dialogueContainerEl } = this.containerMap;

    if (!dialogueContainerEl) {
      return console.log("dialogueContainerEl not found");
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = "message";

    switch (type) {
      case "connected":
      case "new_user":
        messageDiv.classList.add("header-message");

        const innerHTMLMap = {
          user: `<p>客服 ${name} 已连接</p>`,
          support: `<p>用户 ${name} 已连接</p>`,
        };

        messageDiv.innerHTML = innerHTMLMap[this.role];
        break;
      case "text":
      case "image":
      case "audio":
        messageDiv.classList.add(`${type}-message`);
        messageDiv.classList.add(isme ? "self-message" : "other-message");
        const nameElement = createNameElement(isme, name);
        const messageContentElement = createMessageContentElement(
          type,
          message
        );

        if (isme) {
          messageDiv.appendChild(messageContentElement);
          messageDiv.appendChild(nameElement);
        } else {
          messageDiv.appendChild(nameElement);
          messageDiv.appendChild(messageContentElement);
        }

        break;
      default:
        console.log("未知类型");
    }

    dialogueContainerEl.appendChild(messageDiv);

    setTimeout(() => {
      dialogueContainerEl.scrollTop = dialogueContainerEl.scrollHeight;
    });
  }

  sendText() {
    const { textInputEl } = this.containerMap;

    if (!textInputEl) {
      return console.log("textInputEl not found");
    }

    const text = textInputEl.value;
    this.sendMessage("text", text);
    textInputEl.value = "";
  }

  sendImage() {
    const { imageInputEl } = this.containerMap;

    if (!imageInputEl) {
      return console.log("imageInputEl not found");
    }

    const fileInput = imageInputEl;
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.sendMessage("image", reader.result);
      imageInputEl.value = "";
    };

    if (file) reader.readAsDataURL(file);
  }

  async prepareRecord() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
  }

  async startRecord() {
    await this.prepareRecord();
    this.mediaRecorder.start();
  }

  async stopRecord() {
    this.mediaRecorder.stop();
    this.recordedBlobs = [];
  }

  async sendRecord() {
    const audioBlob = new Blob(this.recordedBlobs);
    const reader = new FileReader();
    reader.onload = () => {
      this.sendMessage(
        "audio",
        reader.result.replace("data:application/octet-stream", "data:audio/wav")
      );
    };
    reader.readAsDataURL(audioBlob);
  }
}
