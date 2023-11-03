import { Layout } from "@/components/layouts/layout/Layout";
import { Events } from "@/features/admin/events/list/Events";
import { NextPageWithLayout } from "@/pages/_app";
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

const EventsPage: NextPageWithLayout = () => {
  return <Events />;
};

EventsPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EventsPage;
