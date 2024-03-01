function calculate(data) {
  return data.reduce((prev, curr) => prev + curr, 0);
}

self.addEventListener('message', e => {
  const { data } = e;
  const result = calculate(data);
  self.postMessage(result);
});
