import { LoadingButton } from "@mui/lab";
import { Grid, Box } from "@mui/material";
import { useRouter } from "next/router";
import { memo } from "react";
import { SubmitHandler } from "react-hook-form";
import {
  EditMyUserFormSchema,
  useEditMyUserFormContext,
} from "./EditMyUserFormProvider";
import { usePatchMyUser } from "@/react_queries/my_user/usePatchMyUser";
import { TextFieldRHF } from "@/components/forms/hook_form/TextFieldRHF";
import { useSession } from "next-auth/react";

export const EditMyUserForm = memo(() => {
  const { handleSubmit, control } = useEditMyUserFormContext();
  const { patchMyUser } = usePatchMyUser();
  const router = useRouter();
  const { update } = useSession();

  const onSubmit: SubmitHandler<EditMyUserFormSchema> = async (data) => {
    patchMyUser.mutate(
      { body: { user: data } },
      {
        onSuccess: async (res) => {
          await update();
          router.push("/videos");
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        {/* <Grid item xs={12} sm={6}>
          <TextFieldRHF<EditMyUserFormSchema>
            name="lastName"
            control={control}
            label="姓"
            fullWidth
          />
        </Grid> */}
      </Grid>
      <Box sx={{ display: "flex", width: "100%", mt: 4 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          sx={{ width: 200, mx: "auto" }}
          loading={patchMyUser.isIdle}
        >
          保存
        </LoadingButton>
      </Box>
    </Box>
  );
});
