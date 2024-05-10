import { exceptionFromError } from "./eventbuilder.js";
import { defaultStackParser as parser } from "./stack-parsers.js";

window.addEventListener("error", (event) => {
  const { error } = event;
  const ex = exceptionFromError(parser, error);
  console.log("ex", ex);
});
