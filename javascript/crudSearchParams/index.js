function addQueryParam(key, value) {
  if (window.URLSearchParams) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set(key, value);

    let newUrl = `${window.location.pathname}?${urlParams.toString()}${
      window.location.hash
    }`;

    // 更新当前页面的 URL
    window.history.replaceState({}, "", newUrl);
  } else {
    // 如果不支持 URLSearchParams，手动处理 URL 查询参数字符串
    let baseUrl = window.location.href.split("?")[0];
    let queryParams = window.location.search.slice(1);
    let updatedParams = queryParams
      ? `${queryParams}&${key}=${value}`
      : `${key}=${value}`;
    let newUrl = `${baseUrl}?${updatedParams}${window.location.hash}`;
    window.history.replaceState({}, "", newUrl);
  }
}

function updateQueryParam(key, value) {
  if (window.URLSearchParams) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set(key, value);

    // 构建新的 URL
    let updatedUrl = `${window.location.pathname}?${urlParams.toString()}${
      window.location.hash
    }`;

    // 更新当前页面的 URL
    window.history.replaceState({}, "", updatedUrl);
  } else {
    // 如果不支持 URLSearchParams，手动处理 URL 查询参数字符串
    let baseUrl = window.location.href.split("?")[0];
    let queryParams = window.location.search.slice(1).split("&");
    let paramFound = false;

    for (let i = 0; i < queryParams.length; i++) {
      let pair = queryParams[i].split("=");
      if (pair[0] === key) {
        pair[1] = value;
        queryParams[i] = pair.join("=");
        paramFound = true;
        break;
      }
    }

    if (!paramFound) {
      queryParams.push(`${key}=${value}`);
    }

    let updatedParams = queryParams.join("&");
    let updatedUrl = `${baseUrl}?${updatedParams}${window.location.hash}`;
    window.history.replaceState({}, "", updatedUrl);
  }
}

function deleteQueryParam(key) {
  if (window.URLSearchParams) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.delete(key);

    // 构建新的 URL
    let updatedUrl = `${window.location.pathname}?${urlParams.toString()}${
      window.location.hash
    }`;

    // 更新当前页面的 URL
    window.history.replaceState({}, "", updatedUrl);
  } else {
    // 如果不支持 URLSearchParams，手动处理 URL 查询参数字符串
    let baseUrl = window.location.href.split("?")[0];
    let queryParams = window.location.search
      .slice(1)
      .split("&")
      .filter((param) => {
        let pair = param.split("=");
        return pair[0] !== key;
      });

    let updatedParams = queryParams.length > 0 ? queryParams.join("&") : "";
    let updatedUrl = `${baseUrl}${updatedParams ? `?${updatedParams}` : ""}${
      window.location.hash
    }`;
    window.history.replaceState({}, "", updatedUrl);
  }
}

function getQueryParamValue(key) {
  if (window.URLSearchParams) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  } else {
    // 如果不支持 URLSearchParams，手动处理 URL 查询参数字符串
    let queryParams = window.location.search.slice(1).split("&");
    for (let i = 0; i < queryParams.length; i++) {
      let pair = queryParams[i].split("=");
      if (pair[0] === key) {
        return pair[1];
      }
    }
    return null;
  }
}
