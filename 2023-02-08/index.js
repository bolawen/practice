function Person(){

}
Person.prototype[Symbol.toStringTag] = "Person";
const person = new Person();

console.log(Object.prototype.toString.call(person));