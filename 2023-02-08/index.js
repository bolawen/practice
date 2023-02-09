function groupValue(value, index, flag) {
  const reg = new RegExp(`\\d{1,${index}}(?=(\\d{${index}})+$)`, "g");
  return String(value).replace(reg, function (match, ...args) {
    return match + flag;
  });
}
function formatThousands(value) {
  const strValue = String(value);
  const cacheList = strValue.split(".");
  const int = cacheList[0];
  const fraction = cacheList[1];
  const result = groupValue(int, 3, ",");
  return result + (!!fraction ? "." + fraction : "");
}

const num = 4453232566.9888;
console.log(formatThousands(num));
