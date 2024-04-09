function lengthOfLongestSubstring(str) {
  const set = new Set();
  const length = str.length;

  let right = -1;
  let result = 0;

  for (let i = 0; i < length; i++) {
    if (i !== 0) {
      set.delete(s[i - 1]);
    }

    while (right + 1 < length && !set.has(str[right + 1])) {
      set.add(str[right + 1]);
      right++;
    }

    result = Math.max(result, right - i + 1);
  }

  return result;
}

function lengthOfLongestSubstring(str) {
  let right = -1;
  const result = 0;
  const set = new Set();

  for (let i = 0; i < str.length; i++) {
    if (i !== 0) {
      set.delete(str[i - 1]);
    }

    while (right + 1 < str.length && !set.has(str[right + 1])) {
      set.add(str[right + 1]);
      right++;
    }

    result = Math.max(result, right - i + 1);
  }

  return result;
}
