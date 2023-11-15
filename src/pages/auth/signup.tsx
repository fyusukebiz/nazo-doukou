import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";
import { Signup } from "@/features/auth/singup/Signup";

const SignupPage: NextPageWithLayout = () => {
  return <Signup />;
};

SignupPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default SignupPage;
