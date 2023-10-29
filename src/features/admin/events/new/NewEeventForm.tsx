import { LoadingButton } from "@mui/lab";
import { Grid, Box, Button } from "@mui/material";
import { memo, useMemo } from "react";
import { SubmitHandler, useFieldArray } from "react-hook-form";
import {
  NewEventFormSchema,
  defaultEventLocationEvent,
  useNewEventFormContext,
} from "./NewEventFormProvider";
import { convertNewEventDataForPost } from "./convertNewEventDataForPost";
import { toast } from "react-toastify";
import { usePostEventByAdmin } from "@/react_queries/admin/events/usePostEventByAdmin";
import { useRouter } from "next/router";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { usePrefecturesQuery } from "@/react_queries/prefectures/usePrefecturesQuery";
import { CoverImageFileAttachButtonWithLabel } from "./CoverImageFileAttachButtonWithLabel";
import { EventDatesForm } from "./EventDatesForm";
import { AiOutlinePlus } from "react-icons/ai";
import { useOrganizationsQuery } from "@/react_queries/organizations/useOrganizationsQuery";
import { grey } from "@mui/material/colors";
import { SingleSelectWithLabelRHF } from "@/components/forms/hook_form/SingleSelectWithLabelRHF";
import { useUploadSignedUrlsQuery } from "@/react_queries/upload_signed_urls";
import axios from "axios";

export const NewEventForm = () => {
  const router = useRouter();
  const { handleSubmit, control } = useNewEventFormContext();
  const { postEventByAdmin } = usePostEventByAdmin();

  const { data: prefecturesData, status: prefecturesStatus } =
    usePrefecturesQuery();

  const {
    fields: eventLocationEventFields,
    append: appendEventLocationEvent,
    remove: removeEventLocationEvent,
  } = useFieldArray({
    control,
    name: "eventLocationEvents",
  });

  const { data: organizationsData, status: organizationsStatus } =
    useOrganizationsQuery();

  const { refetch: refetchUploadSignedUrls } = useUploadSignedUrlsQuery();

  const locations = useMemo(() => {
    if (prefecturesStatus !== "success") return [];
    return prefecturesData.prefectures
      .map((pref) => pref.eventLocations)
      .flat()
      .map((loc) => ({ value: loc.id, label: loc.name }));
  }, [prefecturesData, prefecturesStatus]);

  const organizations = useMemo(() => {
    if (organizationsStatus !== "success") return [];
    return organizationsData.organizations.map((org) => ({
      value: org.id,
      label: org.name,
    }));
  }, [organizationsData, organizationsStatus]);

  const onSubmit: SubmitHandler<NewEventFormSchema> = async (rawData) => {
    console.log("data", rawData);

    // 画像データがあれば事前にアップロード
    let coverImageFileKey: string | undefined;
    if (rawData.coverImageFile) {
      console.log("画像データがあれば事前にアップロード");
      const urlData = await refetchUploadSignedUrls();
      const upload = urlData.data?.uploads?.[0];
      if (upload) {
        await axios.put(upload.url, rawData.coverImageFile, {
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
    const dataToPost = convertNewEventDataForPost({
      data: rawData,
      coverImageFileKey: coverImageFileKey,
    });
    postEventByAdmin.mutate(
      { body: dataToPost },
      {
        onSuccess: async (res) => {
          toast.success("作成しました");
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <InputWithLabelRHF<NewEventFormSchema>
            name="name"
            label="イベント名"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <SingleSelectWithLabelRHF<
            NewEventFormSchema,
            { label: string; value: string }
          >
            name="organization"
            control={control}
            label="組織"
            placeholder="組織"
            options={organizations}
          />
        </Grid>

        <Grid item xs={12}>
          <CoverImageFileAttachButtonWithLabel />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewEventFormSchema>
            name="description"
            label="詳細"
            control={control}
            multiline
            minRows={5}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewEventFormSchema>
            name="sourceUrl"
            label="ソースURL"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewEventFormSchema>
            name="numberOfPeopleInTeam"
            label="チーム人数"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewEventFormSchema>
            name="timeRequired"
            label="所要時間"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "5px" }}>
            <Box component="label" sx={{ fontWeight: "bold" }}>
              開催地情報
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {eventLocationEventFields.map((field, index) => (
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
                    color="primary"
                    size="small"
                    sx={{ marginLeft: "auto" }}
                    onClick={() => removeEventLocationEvent(index)}
                  >
                    開催地を削除する
                  </Button>
                </Box>
                <Box>
                  <SingleSelectWithLabelRHF<
                    NewEventFormSchema,
                    { label: string; value: string }
                  >
                    name={`eventLocationEvents.${index}.eventLocation`}
                    control={control}
                    label="開催地"
                    placeholder="開催地"
                    options={locations}
                  />
                </Box>
                <InputWithLabelRHF<NewEventFormSchema>
                  name={`eventLocationEvents.${index}.description`}
                  label="詳細"
                  control={control}
                  fullWidth
                />
                <EventDatesForm
                  control={control}
                  eventLocationEventIndex={index}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ marginY: "36px", display: "flex" }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ marginX: "auto" }}
              startIcon={<AiOutlinePlus />}
              onClick={() =>
                appendEventLocationEvent(defaultEventLocationEvent)
              }
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
          color="primary"
          size="large"
          sx={{ width: "100%" }}
          loading={postEventByAdmin.isPending}
        >
          保存
        </LoadingButton>
      </Box>
    </Box>
  );
};
