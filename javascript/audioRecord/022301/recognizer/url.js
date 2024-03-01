function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getServerTime() {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://asr.cloud.tencent.com/server_time', true);
      xhr.send();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(xhr.responseText);
        }
      };
    } catch (error) {
      reject('get tx server time error');
    }
  });
}

async function createTencentASRAuthParams() {
  const time = new Date().getTime();
  const serverTime = await getServerTime();

  const params = {
    engine_model_type: '16k_zh', // 引擎模型类型 16k_zh：中文通用模型
    timestamp: parseInt(serverTime, 10) || Math.round(time / 1000), // 当前 UNIX 时间戳，单位为秒。如果与当前时间相差过大，会引起签名过期错误
    expired: Math.round(time / 1000) + 1 * 60 * 60, // 签名的有效期截止时间 UNIX 时间戳，单位为秒。expired 必须大于 timestamp 且 expired - timestamp 小于90天
    nonce: Math.round(time / 100000), // 随机正整数。用户需自行生成，最长10位
    voice_id: guid(), // 音频流识别全局唯一标识，一个 websocket 连接对应一个，用户自己生成（推荐使用 uuid），最长128位。
    voice_format: 1, // 语音编码方式，可选，默认值为4。1：pcm；4：speex(sp)；6：silk；8：mp3；10：opus（opus 格式音频流封装说明）；12：wav；14：m4a（每个分片须是一个完整的 m4a 音频）；16：aac
    hotword_id: '08003a00000000000000000000000000', // 热词表 id。如不设置该参数，自动生效默认热词表；如果设置了该参数，那么将生效对应的热词表
    needvad: 1, // 0：关闭 vad，1：开启 vad，默认为0。如果语音分片长度超过60秒，用户需开启 vad（人声检测切分功能）
    vad_silence_time: 0.8 * 1000, // 语音断句检测阈值，静音时长超过该阈值会被认为断句（多用在智能客服场景，需配合 needvad = 1 使用），取值范围：240-2000（默认1000），单位 ms，此参数建议不要随意调整，可能会影响识别效果，目前仅支持 8k_zh、8k_zh_finance、16k_zh 引擎模型
    filter_dirty: 1, // 是否过滤脏词（目前支持中文普通话引擎）。默认为0。0：不过滤脏词；1：过滤脏词；2：将脏词替换为“ * ”
    filter_modal: 2, // 是否过滤语气词（目前支持中文普通话引擎）。默认为0。0：不过滤语气词；1：部分过滤；2：严格过滤
    filter_punc: 0, // 是否过滤句末的句号（目前支持中文普通话引擎）。默认为0。0：不过滤句末的句号；1：过滤句末的句号
    convert_num_mode: 1, // 是否进行阿拉伯数字智能转换（目前支持中文普通话引擎）。0：不转换，直接输出中文数字，1：根据场景智能转换为阿拉伯数字，3: 打开数学相关数字转换。默认值为1
    word_info: 2, // 是否显示词级别时间戳。0：不显示；1：显示，不包含标点时间戳，2：显示，包含标点时间戳。支持引擎 8k_en、8k_zh、8k_zh_finance、16k_zh、16k_en、16k_ca、16k_zh-TW、16k_ja、16k_wuu-SH，默认为0
  };

  return params;
}

/**
 * @description: 获取具有腾讯 ASR 鉴权签名的 ASRUrl(一般放在服务端实现)
 * 文档: https://cloud.tencent.com/document/product/1093/48982
 * 1. 对除 signature 之外的所有参数按字典序进行排序，拼接请求 URL （不包含协议部分：wss://）作为签名原文
 * 2. 对签名原文使用 SecretKey 进行 HmacSha1 加密，之后再进行 base64 编码
 * 3. 得到 signature 签名, 进行 urlencode 编码
 * 4. 将签名参数添加到请求 URL 中
 */
async function getTencentAsrAuthSignatureURL() {
  // ……
  // return result.data.url;
}

async function getTencentASRUrl() {
  const signatureParams = await createTencentASRAuthParams();
  const asrUrl = await getTencentAsrAuthSignatureURL(signatureParams);
  return asrUrl; // 格式为: wss://asr.cloud.tencent.com/asr/v2/1303248253?convert_num_mode=1&engine_model_type=16k_zh&expired=1708686737&filter_dirty=1&filter_modal=2&filter_punc=0&hotword_id=08003a00000000000000000000000000&needvad=1&nonce=17086831&secretid=xxxx&t=1708683136899&timestamp=1708683137&vad_silence_time=800&voice_format=1&voice_id=f2c37564-1213-43f5-b84a-2ed8de3f7484&word_info=2&signature=xxx
}
