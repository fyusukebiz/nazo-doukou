import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { Box, Container } from "@mui/material";
import { useRouter } from "next/router";
import { EditAdminRecruitFormProvider } from "./EditAdminRecruitFormProvider";
import { EditAdminRecruitForm } from "./EditAdminRecruitForm";
import { useRecruitQueryByAdmin } from "@/react_queries/admin/recruits/useRecruitQueryByAdmin";

export const EditAdminRecruit = () => {
  const router = useRouter();
  const recruitId = router.query.id as string;

  const { data: recruitData, status: recruitStatus } = useRecruitQueryByAdmin({
    path: { recruitId },
  });

  return (
    <Box sx={{ height: "100%", overflowY: "scroll" }}>
      <SubPageHeader title="管理者作成の募集の編集" />
      {recruitStatus === "pending" && <LoadingSpinner />}
      {recruitStatus === "success" && (
        <Container sx={{ padding: "16px" }} maxWidth="xl">
          <EditAdminRecruitFormProvider recruit={recruitData.recruit}>
            <EditAdminRecruitForm recruit={recruitData.recruit} />
          </EditAdminRecruitFormProvider>
        </Container>
      )}
    </Box>
  );
};
