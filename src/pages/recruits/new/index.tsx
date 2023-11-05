import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";

const NewRecruitPage: NextPageWithLayout = () => {
  return <div>test</div>;
};

NewRecruitPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default NewRecruitPage;
