export const toCircled = (num: number) => {
  if (num <= 20) {
    const base = "①".charCodeAt(0);
    return String.fromCharCode(base + num - 1);
  }
  if (num <= 35) {
    const base = "㉑".charCodeAt(0);
    return String.fromCharCode(base + num - 21);
  }
  const base = "㊱".charCodeAt(0);
  return String.fromCharCode(base + num - 36);
};
