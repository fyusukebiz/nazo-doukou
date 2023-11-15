import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";
import { Signup } from "@/features/auth/singup/Signup";
import { verifyIdToken } from "@/libs/firebaseClient";
import { GetServerSideProps } from "next";
import { getCookie } from "cookies-next";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const currentFbUserIdToken = getCookie("currentFbUserIdToken", { req, res });

  // ログインしていない場合は何もしない
  if (!currentFbUserIdToken) {
    return { props: {} };
  }

  // Firebase Authで認証情報が間違っていれば何もしない
  const fbAuthRes = await verifyIdToken(currentFbUserIdToken);
  if (!fbAuthRes.ok) {
    return { props: {} };
  }
  const data = await fbAuthRes.json();
  const fbUser = data.users[0];
  const fbUid = fbUser.localId;

  // メール認証が終わっていなければ何もしない
  if (!fbUser.emailVerified) {
    return { props: {} };
  }

  // currentFbUserIdTokenがあって、emailVerified=trueなら、リダイレクト
  return {
    redirect: {
      destination: "/recruits",
      permanent: false,
    },
  };
};

const SignupPage: NextPageWithLayout = () => {
  return <Signup />;
};

SignupPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default SignupPage;
