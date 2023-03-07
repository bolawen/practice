function parseSearchString(url) {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  return Object.fromEntries(searchParams);
}
const result = parseSearchString("http://example.com?a=0&b=1&c=2");
console.log(result);
