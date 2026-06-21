const text = "바랍니다.\n---";
console.log(text.replace(/([^\n])\n---(\n|$)/g, '$1\n\n---$2'));

const text2 = "바랍니다.\n\n---";
console.log(text2.replace(/([^\n])\n---(\n|$)/g, '$1\n\n---$2'));
