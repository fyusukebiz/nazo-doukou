import { ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import "@/styles/global.scss";
import { ReactElement, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { IsMobileProvider } from "@/features/common/IsMobileProvider";
import { useCustomQueryClient } from "@/hooks/useCustomQueryClient";
import { MuiTheme } from "@/styles/MuiTheme";
import { NextPage } from "next";
import { QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/custom-react-datepicker.scss";
import { init as i18nextInit, t as i18nextT } from "i18next";
import { makeZodI18nMap } from "zod-i18n-map";
import translation from "@/libs/zod-i18n-map/ja/zod.json";
import { z } from "zod";
import { RouterHistoryProvider } from "@/features/common/RouterHistoryProvider";
import { Noto_Sans_JP } from "next/font/google";
import { initializeFirebaseApp } from "@/libs/firebaseClient";
import { FirebaseAuthProvider } from "@/components/providers/FirebaseAuthProvider";
import { DefaultSeo } from "next-seo";

const notoJp = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

i18nextInit({
  lng: "ja",
  resources: {
    ja: { zod: translation },
  },
});
z.setErrorMap(makeZodI18nMap({ t: i18nextT }));

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<P = {}> = AppProps<P> & {
  Component: NextPageWithLayout<P>;
};

// firebaseクライアントの初期化
initializeFirebaseApp();

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const customQueryClient = useCustomQueryClient();

  return (
    <>
      <DefaultSeo
        defaultTitle="謎同行"
        description="脱出ゲームや謎解きイベントに一緒に行く人を募集＆応募できるサービスです。投稿した内容はTwitterにも一緒に投稿できます。"
        openGraph={{
          type: "website",
          title: "謎同行",
          description:
            "脱出ゲームや謎解きイベントに一緒に行く人を募集＆応募できるサービスです。投稿した内容はTwitterにも一緒に投稿できます。",
          site_name: "謎同行",
          url: process.env.NEXT_PUBLIC_HOST,
          images: [
            {
              url: process.env.NEXT_PUBLIC_HOST + "/service_logo.png",
              width: 800,
              height: 600,
              alt: "謎同行",
              type: "image/png",
            },
          ],
        }}
        twitter={{
          handle: "@minnanonazotok", // コンテンツ作成者のTwitterID
          site: "@minnanonazotok", // WebサイトのTwitterID
          cardType: "summary",
        }}
      />
      <ThemeProvider theme={MuiTheme}>
        <FirebaseAuthProvider>
          <QueryClientProvider client={customQueryClient}>
            <IsMobileProvider>
              <RouterHistoryProvider>
                <main className={notoJp.className} style={{ height: "100%" }}>
                  {getLayout(
                    <>
                      <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        pauseOnHover
                      />
                      <Component {...pageProps} />
                    </>
                  )}
                </main>
              </RouterHistoryProvider>
            </IsMobileProvider>
          </QueryClientProvider>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </>
  );
}
