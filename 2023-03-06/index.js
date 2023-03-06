function Vue() {
  if (!(this instanceof Vue)) {
    console.log(
      "Vue is a constructor and should be called with the `new` keyword"
    );
    return;
  }
  console.log("Vue 实例");
}

Vue();

const vue = new Vue();
