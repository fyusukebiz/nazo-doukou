import { NextPageWithLayout } from "@/pages/_app";
import { Layout } from "@/components/layouts/layout/Layout";

const EditRecruitPage: NextPageWithLayout = () => {
  return <div>test</div>;
};

EditRecruitPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default EditRecruitPage;
