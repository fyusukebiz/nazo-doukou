import axios from "axios";

export const getFirebaseDynamicLinksShortUrl = async (url: string) => {
  // 短縮URLを取得 TODO: 2025/8にサービス終了する
  const body = {
    longDynamicLink: `${process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK}?link=${url}`,
    suffix: { option: "SHORT" },
  };
  const shortenUrlData = await axios.post(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.NEXT_PUBLIC_FIREBASE_APIKEY}`,
    body
  );
  const shortUrl = shortenUrlData.data.shortLink;

  return shortUrl;
};
