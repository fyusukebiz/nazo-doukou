import { SubPageHeader } from "@/components/layouts/SubPageHeader";
import { LoadingSpinner } from "@/components/spinners/LoadingSpinner";
import { useRecruitQuery } from "@/react_queries/recruits/useRecruitQuery";
import { Box, Container } from "@mui/material";
import { useRouter } from "next/router";
import { EditMyRecruitFormProvider } from "./EditMyRecruitFormProvider";
import { EditMyRecruitForm } from "./EditMyRecruitForm";

export const EditMyRecruit = () => {
  const router = useRouter();
  const recruitId = router.query.id as string;

  const { data: recruitData, status: recruitStatus } = useRecruitQuery({
    path: { recruitId },
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "scroll",
      }}
    >
      <SubPageHeader title="マイ募集の編集" />

      <Container sx={{ padding: "16px" }} maxWidth="xl">
        {recruitStatus === "pending" && <LoadingSpinner />}
        {recruitStatus === "success" && (
          <EditMyRecruitFormProvider recruit={recruitData.recruit}>
            <EditMyRecruitForm recruit={recruitData.recruit} />
          </EditMyRecruitFormProvider>
        )}
      </Container>
    </Box>
  );
};
