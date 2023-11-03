import { EditEvent } from "@/features/admin/events/edit/EditEvent";
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

  if (session.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/events",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function EventPage() {
  return <EditEvent />;
}
