const socket = new WebSocket("ws://localhost:3000");
const inputFileEl = document.getElementById("input-file");

socket.addEventListener("open", ()=>{
    console.log("WebSocket Connection opened");
});

socket.addEventListener("close", ()=>{
    console.log("WebSocket Connection closed");
});

socket.addEventListener("message", (event)=>{
    console.log("WebSocket received from server:", event.data);
});


inputFileEl.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e)=>{
        const arrayBuffer = e.target.result;

        console.log("File readed:", arrayBuffer);
        console.log("WebSocket 正在发送文件");
        socket.send(arrayBuffer);
    }

    reader.onerror = (error) => {
        console.error("Error reading file:", error);
    };

    reader.readAsArrayBuffer(file); 
});