import { EditMyUser } from "@/features/my_user/edit/EditMyUser";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  // ログインしていない場合はアクセス不可
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function EditMyUserPage() {
  return <EditMyUser />;
}
