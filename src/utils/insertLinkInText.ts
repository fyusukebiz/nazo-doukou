export const insertLinkInText = (text: string) => {
  const regexp_url =
    /(https?|ftp):\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+/g;
  var regexp_makeLink = function (url: string) {
    return (
      '<a href="' + url + '" target="_blank" rel="noopener">' + url + "</a>"
    );
  };
  if (text.match(regexp_url) != null) {
    const urlAllMatches = text.match(regexp_url);
    if (urlAllMatches) {
      const urlMatches = new Set(urlAllMatches);
      urlMatches.forEach((url) => {
        text = text.replaceAll(url, regexp_makeLink(url));
      });
    }
  }
  return text;
};
