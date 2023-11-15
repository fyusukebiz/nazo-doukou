import { LoadingButton } from "@mui/lab";
import { Grid, Box, Chip } from "@mui/material";
import { useRouter } from "next/router";
import { SubmitHandler, useWatch } from "react-hook-form";
import {
  EditMyUserFormSchema,
  useEditMyUserFormContext,
} from "./EditMyUserFormProvider";
import { usePatchMyUser } from "@/react_queries/my_user/usePatchMyUser";
import { UserDetail } from "@/types/user";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { SingleSelectWithLabelRHF } from "@/components/forms/hook_form/SingleSelectWithLabelRHF";
import { sexOptions } from "@/constants/sexOptions";
import { BiCalendar } from "react-icons/bi";
import { useGameTypesQuery } from "@/react_queries/game_types/useGameTypesQuery";
import { LikeOrDislike } from "@prisma/client";
import { Avatar } from "./Avatar";
import { useCallback } from "react";
import { useUploadSignedUrlsQuery } from "@/react_queries/upload_signed_urls";
import axios from "axios";
import { toast } from "react-toastify";
import { convertEditMyUserDataForPatch } from "./convertEditMyUserDataForPatch";
import { MonthYearPickerWithLabelRHF } from "@/components/forms/hook_form/MonthYearPickerRHFWithLabel";
import { useStrongAreasQuery } from "@/react_queries/strong_areas/useStrongAreasQuery";

type Props = {
  myUser: UserDetail;
};

export const EditMyUserForm = ({ myUser }: Props) => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useEditMyUserFormContext();
  const userGameTypes = useWatch({ control, name: "userGameTypes" });
  const myStrongAreas = useWatch({ control, name: "strongAreas" });

  const { patchMyUser } = usePatchMyUser();
  const router = useRouter();
  const { data: gameTypesData, status: gameTypesStatus } = useGameTypesQuery();
  const { data: strongAreasData, status: strongAreasStatus } =
    useStrongAreasQuery();
  const { refetch: refetchUploadSignedUrls } = useUploadSignedUrlsQuery();
  // console.log(errors);
  const onSubmit: SubmitHandler<EditMyUserFormSchema> = async (rawData) => {
    // 画像データがあれば事前にアップロード
    let iconImageFileKey: string | undefined;
    if (rawData.iconImageFile) {
      const urlData = await refetchUploadSignedUrls();
      const upload = urlData.data?.uploads?.[0];
      if (upload) {
        await axios.put(upload.url, rawData.iconImageFile, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });
        iconImageFileKey = upload.fileKey;
      } else {
        toast.error("アップロード用のURLを取得できませんでした");
        return;
      }
    }
    // // 送信用にデータを加工
    const dataToPatch = convertEditMyUserDataForPatch({
      data: rawData,
      iconImageFileKey: iconImageFileKey,
    });

    patchMyUser.mutate(
      { body: dataToPatch },
      {
        onSuccess: async (res) => {
          toast.success("更新しました");
        },
      }
    );
  };

  const handleClickGameType = useCallback(
    ({
      gameTypeId,
      likeOrDislike,
    }: {
      gameTypeId: string;
      likeOrDislike: LikeOrDislike;
    }) => {
      if (gameTypesStatus !== "success") return;
      const index = userGameTypes.findIndex(
        (ugt) => ugt.gameTypeId === gameTypeId
      );
      if (index > -1) {
        const userGameType = userGameTypes[index];
        if (userGameType.likeOrDislike === likeOrDislike) {
          // 削除
          const newUserGameTypes = [...userGameTypes];
          newUserGameTypes.splice(index, 1);
          setValue(`userGameTypes`, newUserGameTypes);
        } else {
          // 上書き
          setValue(`userGameTypes.${index}.likeOrDislike`, likeOrDislike);
        }
      } else {
        // 未選択なら挿入
        const newUserGameTypes = [...userGameTypes];
        newUserGameTypes.push({ gameTypeId, likeOrDislike });
        setValue(`userGameTypes`, newUserGameTypes);
      }
    },
    [gameTypesStatus, setValue, userGameTypes]
  );

  const handleClickStrongArea = useCallback(
    ({ strongArea }: { strongArea: { id: string; name: string } }) => {
      const index = myStrongAreas.findIndex(
        (area) => area.id === strongArea.id
      );
      if (index > -1) {
        // 削除
        const newStrongAreas = [...myStrongAreas];
        newStrongAreas.splice(index, 1);
        setValue("strongAreas", newStrongAreas);
      } else {
        // 追加
        setValue("strongAreas", [...myStrongAreas, strongArea]);
      }
    },
    [myStrongAreas, setValue]
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <InputWithLabelRHF<EditMyUserFormSchema>
            name="name"
            control={control}
            label="名前"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "8px", fontWeight: "bold" }}>アイコン</Box>
          <Avatar initialAvatarUrl={myUser.iconImageUrl} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ width: "150px" }}>
            <SingleSelectWithLabelRHF<
              EditMyUserFormSchema,
              { label: string; value: string }
            >
              name="sex"
              control={control}
              label="性別"
              placeholder="性別"
              options={sexOptions}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "end" }}>
            <Box sx={{ width: "200px" }}>
              <MonthYearPickerWithLabelRHF<EditMyUserFormSchema>
                name="startedAt"
                label="謎解き歴"
                control={control}
                endIcon={<BiCalendar size={30} />}
                isClearable={true}
              />
            </Box>
            <Box sx={{ marginLeft: "10px", marginBottom: "15px" }}>
              ぐらいから
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditMyUserFormSchema>
            name="twitter"
            control={control}
            label="Xユーザー名"
            placeholder="@不要"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditMyUserFormSchema>
            name="instagram"
            control={control}
            label="インスタアカウント名"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "8px", fontWeight: "bold" }}>
            <Box component="label">好きなゲーム</Box>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {gameTypesData?.gameTypes.map((gt) => (
              <Chip
                key={gt.id}
                label={gt.name}
                color="teal"
                variant={
                  userGameTypes.find((ugt) => ugt.gameTypeId === gt.id)
                    ?.likeOrDislike === "LIKE"
                    ? "filled"
                    : "outlined"
                }
                onClick={() =>
                  handleClickGameType({
                    gameTypeId: gt.id,
                    likeOrDislike: "LIKE",
                  })
                }
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "8px", fontWeight: "bold" }}>
            <Box component="label">得意なこと</Box>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {strongAreasData?.strongAreas.map((area) => (
              <Chip
                key={area.id}
                label={area.name}
                color="teal"
                variant={
                  myStrongAreas.find((myArea) => myArea.id === area.id)
                    ? "filled"
                    : "outlined"
                }
                onClick={() =>
                  handleClickStrongArea({
                    strongArea: area,
                  })
                }
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditMyUserFormSchema>
            name="description"
            control={control}
            label="自由記入欄"
            multiline
            minRows={5}
            fullWidth
          />
        </Grid>

        <Box sx={{ display: "flex", width: "100%", mt: 4 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            color="teal"
            size="large"
            sx={{ width: 200, mx: "auto" }}
            loading={patchMyUser.isPending}
          >
            保存
          </LoadingButton>
        </Box>
      </Grid>
    </Box>
  );
};
