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
import { Roboto } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
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

export default function App({
  Component,
  pageProps,
}: AppPropsWithLayout<{ session: Session }>) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const customQueryClient = useCustomQueryClient();

  return (
    <ThemeProvider theme={MuiTheme}>
      <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={customQueryClient}>
          <IsMobileProvider>
            <RouterHistoryProvider>
              <main className={roboto.className} style={{ height: "100%" }}>
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
      </SessionProvider>
    </ThemeProvider>
  );
}
