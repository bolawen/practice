const endTagEndCharReg = /[\t\r\n\f\s/>]/;

function startsWith(source, searchString) {
  return source.startsWith(searchString);
}

/**
 * @description: 判断是否为 xx 的结束标签
 */
function startsWithEndTagOpen(source, tag) {
  return (
    startsWith(source, '</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
    endTagEndCharReg.test(source[2 + tag.length] || '>')
  );
}

console.log('示例一', startsWithEndTagOpen('</div >', 'div'));
