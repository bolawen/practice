function isValid(s) {
  if (s.length % 2 !== 0) {
    return false;
  }

  const map = new Map([
    ["}", "{"],
    [")", "("],
    ["]", "["],
  ]);

  const stack = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map.has(char)) {
      if (!stack.length || stack[stack.length - 1] !== map.get(char)) {
        return false;
      }
      stack.pop();
    } else {
      stack.push(char);
    }
  }

  return !stack.length;
}

function isValid(str) {
  if (str.length % 2 !== 0) {
    return false;
  }

  const map = new Map([
    ["}", "{"],
    ["]", "["],
    [")", "("],
  ]);

  const stack = [];

  for (let char of str) {
    if (map.has(char)) {
      if (!stack.length || stack[stack.length - 1] !== map.get(char)) {
        return false;
      }
      stack.pop();
    } else {
      stack.push(char);
    }
  }
}
