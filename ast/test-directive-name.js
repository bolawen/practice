const vueDirectiveNameReg =
  /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i;

function parseVueDirective(name) {
  const match = vueDirectiveNameReg.exec(name);

  // dirName 指令名 
  let dirName =
    match[1] ||
    (name.startsWith(':') ? 'bind' : name.startsWidth('@') ? 'on' : 'slot');

  // arg 指令参数
  let arg;

  if (match[2]) {
    let content = match[2];

    arg = {
      content
    };
  }

  // modifiers 指令修饰符
  const modifiers = match[3] ? match[3].slice(1).split('.') : [];

  return {
    arg,
    modifiers,
    name: dirName,
  };
}

const str1 = 'v-if';
const str2 = 'v-model';
const str3 = 'v-on:click';
const str4 = 'v-on:[event]';
const str5 = 'v-on:click.once';
const result = parseVueDirective(str5);
console.log(result);
