try {
  Promise.reject('error');
} catch (error) {
  console.log('error', error);
}
