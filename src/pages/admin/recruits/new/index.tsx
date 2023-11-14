import { GetServerSideProps } from "next";
import { getCookie } from "cookies-next";
import { verifyIdToken } from "@/libs/firebaseClient";
import prisma from "@/libs/prisma";
import { FirebaseAuthGuard } from "@/components/guards/FirebaseAuthGuard";
import { NewAdminRecruit } from "@/features/admin/recruits/new/NewAdminRecruit";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const currentFbUserIdToken = getCookie("currentFbUserIdToken", { req, res });

  // ログインしていない場合はアクセス不可
  if (!currentFbUserIdToken) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  // Firebase Authで認証情報が正しいかをチェックする
  const fbAuthRes = await verifyIdToken(currentFbUserIdToken);
  if (!fbAuthRes.ok) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  const data = await fbAuthRes.json();
  const fbUser = data.users[0];
  const fbUid = fbUser.localId;

  // メール認証が終わっているかをチェックする
  if (!fbUser.emailVerified) {
    return {
      redirect: {
        destination: "/auth/verify",
        permanent: false,
      },
    };
  }

  // DBからUserを取得
  const user = await prisma.user.findUnique({ where: { fbUid } });

  if (!user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  // roleチェック
  if (user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/recruits",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function NewAdminRecruitPage() {
  return (
    <FirebaseAuthGuard>
      <NewAdminRecruit />
    </FirebaseAuthGuard>
  );
}
