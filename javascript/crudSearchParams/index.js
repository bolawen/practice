function supportsURL() {
  return typeof URL !== "undefined";
}

function supportsSearchParams() {
  return typeof URLSearchParams !== "undefined";
}

function normalizeUrl(url) {
  if (supportsURL()) {
    try {
      const urlObj = new URL(url || window.location.href);
      return {
        href: urlObj.href,
        protocol: urlObj.protocol,
        host: urlObj.host,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
      };
    } catch (error) {
      return null;
    }
  } else {
    const a = document.createElement("a");
    a.href = url || window.location.href;

    return {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash,
    };
  }
}

function handleUrlParams(action, key, value, url) {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    console.error("Invalid URL:", url);
    return null;
  }

  let baseUrl = normalizedUrl.href.split("?")[0];
  let queryParams = normalizedUrl.search.slice(1).split("&");
  let urlParams;

  if (supportsSearchParams()) {
    urlParams = new URLSearchParams(normalizedUrl.search);

    switch (action) {
      case "add":
      case "update":
        if (value !== null && value !== undefined) {
          urlParams.set(key, value);
        }
        break;
      case "delete":
        urlParams.delete(key);
        break;
      default:
        break;
    }

    queryParams = Array.from(urlParams.keys()).map(
      (key) => `${key}=${urlParams.get(key)}`
    );
  } else {
    switch (action) {
      case "add":
      case "update":
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
        if (!paramFound && value !== null && value !== undefined) {
          queryParams.push(`${key}=${value}`);
        }
        break;
      case "delete":
        queryParams = queryParams.filter((param) => {
          let pair = param.split("=");
          return pair[0] !== key;
        });
        break;
      default:
        break;
    }
  }

  queryParams = queryParams.filter((param) => {
    const [paramKey, paramValue] = param.split("=");
    return paramKey && paramValue !== undefined;
  });

  const updatedParams =
    queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  const hashPart = normalizedUrl.hash || "";
  return `${baseUrl}${updatedParams}${hashPart}`;
}

function addQueryParam(key, value, url) {
  return handleUrlParams("add", key, value, url);
}

function updateQueryParam(key, value, url) {
  return handleUrlParams("update", key, value, url);
}

function deleteQueryParam(key, url) {
  return handleUrlParams("delete", key, url);
}

function getQueryParamValue(key, url) {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    console.error("Invalid URL:", url);
    return null;
  }

  if (supportsSearchParams()) {
    const urlParams = new URLSearchParams(normalizedUrl.search);
    return urlParams.get(key);
  }

  const queryParams = normalizedUrl.search.slice(1).split("&");
  for (let i = 0; i < queryParams.length; i++) {
    let pair = queryParams[i].split("=");
    if (pair[0] === key) {
      return pair[1];
    }
  }
  return null;
}

const name = getQueryParamValue("name");
console.log("name:", name);
const addUrl = addQueryParam("name", "John");
console.log("addUrl:", addUrl);
const updateUrl = updateQueryParam("name", "Jane");
console.log("updateUrl:", updateUrl);
const addUrl1 = addQueryParam("age", "25");
console.log("addUrl1:", addUrl1);
const deleteUrl = deleteQueryParam("name");
console.log("deleteUrl:", deleteUrl);

const name1 = getQueryParamValue("name", "http://localhost:3000?name=John");
console.log("name1", name1);
const addUrl2 = addQueryParam("name", "John", "http://localhost:3000");
console.log("addUrl2:", addUrl2);
const updateUrl1 = updateQueryParam(
  "name",
  "Jane",
  "http://localhost:3000?name=John&age=25"
);
console.log("updateUrl1:", updateUrl1);
