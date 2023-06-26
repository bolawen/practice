class A {
  a: string;
  b: string;
  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

const a = new A("哈哈", "嘻嘻");
console.log(a);

class B {
  constructor(public a: string, public b: string) {}
}

const b = new B("哈哈", "嘻嘻");
console.log(b);

class C {
  constructor(private a: string, private b: string) {}
}

const c = new C("哈哈", "嘻嘻");
console.log(c);
console.log(c.a);

class D {
  private a: string;
  private b: string;
  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

const d = new D("哈哈", "嘻嘻");
console.log(d);
console.log(d.a);
