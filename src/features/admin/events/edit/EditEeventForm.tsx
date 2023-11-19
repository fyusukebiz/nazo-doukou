import { LoadingButton } from "@mui/lab";
import { Grid, Box, Button, Chip } from "@mui/material";
import { useCallback, useMemo } from "react";
import { SubmitHandler, useFieldArray, useWatch } from "react-hook-form";
import {
  EditEventFormSchema,
  defaultEventLocation,
  useEditEventFormContext,
} from "./EditEventFormProvider";
import { convertEditEventDataForPatch } from "./convertEditEventDataForPatch";
import { toast } from "react-toastify";
import { usePatchEventByAdmin } from "@/react_queries/admin/events/usePatchEventByAdmin";
import { useRouter } from "next/router";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { usePrefecturesQuery } from "@/react_queries/prefectures/usePrefecturesQuery";
import { CoverImageFileAttachButtonWithLabel } from "./CoverImageFileAttachButtonWithLabel";
import { AiOutlinePlus } from "react-icons/ai";
import { useOrganizationsQuery } from "@/react_queries/organizations/useOrganizationsQuery";
import { grey } from "@mui/material/colors";
import { SingleSelectWithLabelRHF } from "@/components/forms/hook_form/SingleSelectWithLabelRHF";
import { useUploadSignedUrlsQuery } from "@/react_queries/upload_signed_urls";
import axios from "axios";
import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { BiCalendar } from "react-icons/bi";
import { useGameTypesQuery } from "@/react_queries/game_types/useGameTypesQuery";
import imageCompression from "browser-image-compression";

type Props = {
  eventId: string;
};

export const EditEventForm = ({ eventId }: Props) => {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useEditEventFormContext();
  const gameTypes = useWatch({ control, name: "gameTypes" });

  const { patchEventByAdmin } = usePatchEventByAdmin();

  const { data: prefecturesData, status: prefecturesStatus } =
    usePrefecturesQuery();

  const { data: gameTypesData, status: gameTypesStatus } = useGameTypesQuery();

  const {
    fields: eventLocationFields,
    append: appendEventLocation,
    remove: removeEventLocation,
  } = useFieldArray({
    control,
    name: "eventLocations",
  });

  // const { data: organizationsData, status: organizationsStatus } =
  //   useOrganizationsQuery();

  const { refetch: refetchUploadSignedUrls } = useUploadSignedUrlsQuery();

  const locations = useMemo(() => {
    if (prefecturesStatus !== "success") return [];
    return prefecturesData.prefectures
      .map((pref) => pref.locations)
      .flat()
      .map((loc) => ({ value: loc.id, label: loc.name }));
  }, [prefecturesData, prefecturesStatus]);

  const onSubmit: SubmitHandler<EditEventFormSchema> = async (rawData) => {
    // 画像データがあれば事前にアップロード
    let coverImageFileKey: string | undefined;
    if (rawData.coverImageFile) {
      // ファイルを圧縮
      const options = {
        maxSizeMB: 0.3, // 最大ファイルサイズ
        maxWidthOrHeight: 1000, // 最大画像幅もしくは高さ
      };
      const compressedFile = await imageCompression(
        rawData.coverImageFile,
        options
      );
      console.log(`${rawData.coverImageFile.size} => ${compressedFile.size}`);
      // アップロード用のリンク取得
      const urlData = await refetchUploadSignedUrls();
      const upload = urlData.data?.uploads?.[0];
      // アップロード
      if (upload) {
        await axios.put(upload.url, compressedFile, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });
        coverImageFileKey = upload.fileKey;
      } else {
        toast.error("アップロード用のURLを取得できませんでした");
        return;
      }
    }

    // // 送信用にデータを加工
    const dataToPatch = convertEditEventDataForPatch({
      data: rawData,
      coverImageFileKey: coverImageFileKey,
    });
    patchEventByAdmin.mutate(
      { path: { eventId }, body: dataToPatch },
      {
        onSuccess: async (res) => {
          toast.success("更新しました");
          router.back();
        },
      }
    );
  };

  const handleClickGameType = useCallback(
    ({ gameType }: { gameType: { id: string; name: string } }) => {
      const index = gameTypes.findIndex((gt) => gt.id === gameType.id);
      if (index > -1) {
        // 削除
        const newGameTypes = [...gameTypes];
        newGameTypes.splice(index, 1);
        setValue("gameTypes", newGameTypes);
      } else {
        // 追加
        setValue("gameTypes", [...gameTypes, gameType]);
      }
    },
    [gameTypes, setValue]
  );

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="name"
            label="イベント名"
            control={control}
            fullWidth
          />
        </Grid>

        {/* <Grid item xs={12}>
          <SingleSelectWithLabelRHF<
            EditEventFormSchema,
            { label: string; value: string }
          >
            name="organization"
            control={control}
            label="組織"
            placeholder="組織"
            options={organizations}
          />
        </Grid> */}

        <Grid item xs={12}>
          <CoverImageFileAttachButtonWithLabel />
        </Grid>

        {/* <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="description"
            label="詳細"
            control={control}
            multiline
            minRows={5}
            fullWidth
          />
        </Grid> */}

        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="sourceUrl"
            label="ソースURL"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="numberOfPeopleInTeam"
            label="チーム人数"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="timeRequired"
            label="所要時間"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "8px" }}>
            <Box component="label" sx={{ fontWeight: "bold" }}>
              種類
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {gameTypesData?.gameTypes.map((gt) => (
              <Chip
                key={gt.id}
                label={gt.name}
                color="teal"
                variant={
                  gameTypes.find((gameType) => gameType.id === gt.id)
                    ? "filled"
                    : "outlined"
                }
                onClick={() =>
                  handleClickGameType({
                    gameType: gt,
                  })
                }
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="twitterTag"
            label="脱出ゲームのXタグ"
            control={control}
            placeholder="頭に#は不要"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<EditEventFormSchema>
            name="twitterContentTag"
            label="コンテンツのXタグ"
            control={control}
            placeholder="頭に#は不要"
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "5px" }}>
            <Box component="label" sx={{ fontWeight: "bold" }}>
              開催地情報
            </Box>
            <Box sx={{ color: "red", fontSize: "12px" }}>
              ※「開催地を削除する」と、それに紐づいている募集も削除されます！削除前に募集が紐づいてないかを確認してください。
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {eventLocationFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  border: `1px solid ${grey[300]}`,
                  borderRadius: "5px",
                  padding: "20px",
                }}
              >
                <Box sx={{ display: "flex" }}>
                  <Button
                    variant="outlined"
                    color="teal"
                    size="small"
                    sx={{ marginLeft: "auto" }}
                    onClick={() => removeEventLocation(index)}
                  >
                    開催地を削除する
                  </Button>
                </Box>
                <Box>
                  <SingleSelectWithLabelRHF<
                    EditEventFormSchema,
                    { label: string; value: string }
                  >
                    name={`eventLocations.${index}.location`}
                    control={control}
                    label="開催地"
                    placeholder="開催地"
                    options={locations}
                  />
                </Box>
                <InputWithLabelRHF<EditEventFormSchema>
                  name={`eventLocations.${index}.building`}
                  label="建物名"
                  control={control}
                  fullWidth
                />
                <DatePickerWithLabelRHF<EditEventFormSchema>
                  name={`eventLocations.${index}.startedAt`}
                  label="開始日"
                  control={control}
                  endIcon={<BiCalendar size={30} />}
                  isClearable={true}
                />
                <DatePickerWithLabelRHF<EditEventFormSchema>
                  name={`eventLocations.${index}.endedAt`}
                  label="終了日"
                  control={control}
                  endIcon={<BiCalendar size={30} />}
                  isClearable={true}
                />
                <Grid item xs={12}>
                  <InputWithLabelRHF<EditEventFormSchema>
                    name={`eventLocations.${index}.detailedSchedule`}
                    label="スケジュール"
                    control={control}
                    fullWidth
                  />
                </Grid>
                <InputWithLabelRHF<EditEventFormSchema>
                  name={`eventLocations.${index}.description`}
                  label="詳細"
                  control={control}
                  multiline
                  minRows={5}
                  fullWidth
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ marginY: "36px", display: "flex" }}>
            <Button
              variant="outlined"
              color="teal"
              sx={{ marginX: "auto" }}
              startIcon={<AiOutlinePlus />}
              onClick={() => appendEventLocation(defaultEventLocation)}
            >
              開催地を追加する
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", mt: 4 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          color="teal"
          size="large"
          sx={{ width: "100%" }}
          loading={patchEventByAdmin.isPending}
        >
          保存
        </LoadingButton>
      </Box>
    </Box>
  );
};
