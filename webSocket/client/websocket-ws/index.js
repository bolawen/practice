const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    console.log('WebSocket 连接成功');
    socket.send('Hello WebSocket');
}

socket.onmessage = (event) => {
    console.log('接收到服务端消息: %s', event.data);
}

socket.onclose = () => {
    console.log('WebSocket 连接关闭');
}
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };