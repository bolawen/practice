const socket = new WebSocket("ws://localhost:3000");
const inputFileEl = document.getElementById("input-file");

socket.addEventListener("open", () => {
  console.log("WebSocket Connection opened");
});

socket.addEventListener("close", () => {
  console.log("WebSocket Connection closed");
});

socket.addEventListener("message", (event) => {
  console.log("WebSocket received from server:", event.data);
});

async function uploadFileForFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log("File uploaded by file:", data);
}

async function uploadFileForBlob(blob) {
  const formData = new FormData();
  formData.append("blob", blob);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log("File uploaded by blob:", data);
}

async function uploadFileForBuffer(buffer) {
  const formData = new FormData();
  formData.append("buffer", buffer);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log("File uploaded by buffer:", data);
}

async function uploadFileForBase64(base64) {
  const formData = new FormData();
  formData.append("base64", base64);

  const response = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log("File uploaded by base64:", data);
}

// inputFileEl.addEventListener("change", (event) => {
//   const file = event.target.files[0];
//   uploadFileForFile(file);
// });

// inputFileEl.addEventListener("change", async (event) => {
//   const file = event.target.files[0];
//   const buffer = new Uint8Array(await file.arrayBuffer());
//   const blob = new Blob([buffer]);
//   uploadFileForBlob(blob);
// });

// inputFileEl.addEventListener("change", async (event) => {
//   const file = event.target.files[0];
//   const buffer = new Uint8Array(await file.arrayBuffer());
//   uploadFileForBuffer(buffer);
// });

inputFileEl.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async (event) => {
    const base64 = event.target.result;
    uploadFileForBase64(base64);
  };

  reader.readAsDataURL(file);
});
