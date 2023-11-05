import { ForgotPassword } from "@/features/auth/ForgotPassword";
import { NextPageWithLayout } from "../_app";
import { Layout } from "@/components/layouts/layout/Layout";

const ForgotPasswordPage: NextPageWithLayout = () => {
  return <ForgotPassword />;
};

ForgotPasswordPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default ForgotPasswordPage;
