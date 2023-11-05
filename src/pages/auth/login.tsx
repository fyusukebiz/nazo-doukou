import { Login } from "@/features/auth/Login";
import { NextPageWithLayout } from "../_app";
import { Layout } from "@/components/layouts/layout/Layout";

const LoginPage: NextPageWithLayout = () => {
  return <Login />;
};

LoginPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default LoginPage;
