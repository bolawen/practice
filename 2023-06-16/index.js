import fs from "fs";
import fetch from "node-fetch"
import FormData from "form-data";

async function uploadImage(fileData){
    const formData = new FormData();
    formData.append("type", "image/png");
    formData.append("path", `statics/images/`);
    formData.append("bucket", "cdn-cn-1303248253");
    formData.append("site", "腾讯云");
    formData.append("file", fileData.file);
    return await fetch("http://devops.umu.work/api/object_upload", {
      method: "POST",
      body: formData,
      headers: {
        cookie: "session_id=1cd26e76-fe0c-41ed-8ec2-daa3664155d6",
      },
    });
}

async function upload(fileData){
    const { type } = fileData;
    if(type === "image"){
        const response = await uploadImage(fileData);
        const data = await response.json();
        console.log(data);
    }
}

const fileData = {
  type: "image",
  file: fs.createReadStream(
    "/Users/zhangwenqiang/Pictures/assessment-poster.png"
  ),
};

upload(fileData).catch((error)=>{
    console.log(`上传失败, 失败原因为: ${error}`);
});



