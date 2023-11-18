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
import { getNextSeoConfig } from "../utils/getNextSeoConfig";

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

  // WORKAROUND: NextSeoでog:image,og:titleを上書きしても、Twitterなどに反映されない（ブラウザ上では反映されているように見える）
  // https://zenn.dev/sarutabiko/scraps/8241caad6594ab
  // これは、Twitterなどは、一発目でfetchしたhtmlのみを見て判断しているため
  // e.g) curl http://localhost:3000/recruits/clp3zjnhm000psake1huif475
  // => DefaultSeoで設定した値しか見えない、NextSeoで上書きされない。
  // よって、DefaultSeoを直接書き直す必要がある
  // getServerSidePropsの値はpagePropsに入るのでこれを利用する

  return (
    <>
      <DefaultSeo {...getNextSeoConfig({ pageProps: pageProps as any })} />
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
