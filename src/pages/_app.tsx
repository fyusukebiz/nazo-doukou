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
import nextSeoConfig from "../../next-seo.config";
import Head from "next/head";

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
      <DefaultSeo {...nextSeoConfig} />
      <ThemeProvider theme={MuiTheme}>
        <FirebaseAuthProvider>
          <QueryClientProvider client={customQueryClient}>
            <IsMobileProvider>
              <RouterHistoryProvider>
                <Head>
                  {/* TODO: 不要なら削除 */}
                  {/* Twitter用 next-seoだと反映されないため, _document.tsxだと重複する */}
                  {/* <meta
                    name="twitter:title"
                    content={process.env.NEXT_PUBLIC_SERVICE_NAME}
                  />
                  <meta
                    name="twitter:description"
                    content={
                      "脱出ゲームや謎解きイベントに一緒に行く人を募集＆応募できるサービスです。投稿した内容はTwitterにも一緒に投稿できます。"
                    }
                  />
                  <meta
                    name="twitter:image"
                    content={process.env.NEXT_PUBLIC_HOST + "/service_logo.png"}
                  /> */}
                </Head>
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
