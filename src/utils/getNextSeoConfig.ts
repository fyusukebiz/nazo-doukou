export const getNextSeoConfig = ({
  pageProps,
}: {
  pageProps: {
    event?: { name: string; coverImageFileUrl?: string };
  };
}) => ({
  defaultTitle: process.env.NEXT_PUBLIC_SERVICE_NAME,
  description:
    "脱出ゲームや謎解きイベントに一緒に行く人を募集＆応募できるサービスです。投稿した内容はTwitterにも一緒に投稿できます。",
  openGraph: {
    title: !!pageProps.event
      ? pageProps.event.name
      : process.env.NEXT_PUBLIC_SERVICE_NAME,
    type: "website",
    url: process.env.NEXT_PUBLIC_HOST,
    locale: "ja_JP",
    site_name: process.env.NEXT_PUBLIC_SERVICE_NAME,
    description:
      "脱出ゲームや謎解きイベントに一緒に行く人を募集＆応募できるサービスです。投稿した内容はTwitterにも一緒に投稿できます。",
    images: [
      {
        url: !!pageProps.event?.coverImageFileUrl
          ? pageProps.event.coverImageFileUrl
          : process.env.NEXT_PUBLIC_HOST +
            "/default_twitter_ summary_large_image.jpg",
        width: 1200,
        height: 630,
        alt: !!pageProps.event
          ? pageProps.event.name
          : process.env.NEXT_PUBLIC_SERVICE_NAME,
        type: "image/png",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
    handle: "@minnanonazotok",
    site: "@minnanonazotok",
  },
});
