import { LoadingButton } from "@mui/lab";
import { Grid, Box, Button, Stack, Switch, IconButton } from "@mui/material";
import { useMemo } from "react";
import { SubmitHandler, useFieldArray, useWatch } from "react-hook-form";
import {
  NewRecruitFormSchema,
  defaultPossibleDate,
  useNewRecruitFormContext,
} from "./NewRecruitFormProvider";
import { convertNewRecruitDataForPost } from "./convertNewRecruitDataForPost";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { AiOutlinePlus } from "react-icons/ai";
import { SingleSelectWithLabelRHF } from "@/components/forms/hook_form/SingleSelectWithLabelRHF";
import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { BiCalendar } from "react-icons/bi";
import { MultipleSelectWithLabelRHF } from "@/components/forms/hook_form/MultipleSelectWithLabelRHF";
import { usePostRecruit } from "@/react_queries/recruits/usePostRecruit";
import { useRecruitTagsQuery } from "@/react_queries/recruit_tags/useRecruitTagsQuery";
import { useEventLocationEventOptionsQuery } from "@/react_queries/event_location_events/useEventLocationEventOptionsQuery";
import { FaTrash } from "react-icons/fa";
import { grey } from "@mui/material/colors";

export const NewRecruitForm = () => {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useNewRecruitFormContext();

  const isSelectType = useWatch({ control, name: "isSelectType" });

  const { postRecruit } = usePostRecruit();
  console.log(errors);

  const {
    data: eventLocationEventOptsData,
    status: eventLocationEventOptsStatus,
  } = useEventLocationEventOptionsQuery();

  const { data: recruitTagsData, status: recruitTagsStatus } =
    useRecruitTagsQuery();

  const {
    fields: possibleDateFields,
    append: appendPossibleDate,
    remove: removePossibleDate,
  } = useFieldArray({
    control,
    name: "possibleDates",
  });

  const eventLocationEvents = useMemo(() => {
    if (eventLocationEventOptsStatus !== "success") return [];
    return eventLocationEventOptsData.eventLocationEventOptions.map((opt) => ({
      value: opt.id,
      label: `${opt.name}(${opt.location})`,
    }));
  }, [eventLocationEventOptsData, eventLocationEventOptsStatus]);

  const recruitTags = useMemo(
    () =>
      recruitTagsData?.recruitTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      })) ?? [],
    [recruitTagsData]
  );

  const onSubmit: SubmitHandler<NewRecruitFormSchema> = async (rawData) => {
    console.log("data", rawData);

    // // 送信用にデータを加工
    const dataToPost = convertNewRecruitDataForPost({
      data: rawData,
    });
    postRecruit.mutate(
      { body: dataToPost },
      {
        onSuccess: async (res) => {
          router.push("/recruits");
          toast.success("作成しました");
        },
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box>
            <Box
              component="label"
              sx={{ marginBottom: "8px", fontWeight: "bold" }}
            >
              イベント
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box>入力</Box>
            <Switch
              checked={isSelectType}
              onChange={(e) => setValue("isSelectType", e.target.checked)}
            />
            <Box>選択</Box>
          </Stack>
          <Box sx={{ fontSize: "14px", color: grey }}>
            ※選択肢にイベントがない場合は、入力に切り替えて記載ください
          </Box>
        </Grid>

        {isSelectType ? (
          <Grid item xs={12}>
            <SingleSelectWithLabelRHF<
              NewRecruitFormSchema,
              { label: string; value: string }
            >
              name="eventLocationEvent"
              control={control}
              label="イベント"
              placeholder="イベント"
              options={eventLocationEvents}
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12}>
              <InputWithLabelRHF<NewRecruitFormSchema>
                name="manualEventName"
                label="イベント名"
                control={control}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <InputWithLabelRHF<NewRecruitFormSchema>
                name="manualEventLocation"
                label="開催場所"
                control={control}
                fullWidth
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <InputWithLabelRHF<NewRecruitFormSchema>
            // inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            type="number"
            name="numberOfPeople"
            label="募集人数"
            control={control}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "5px" }}>
            <Box component="label" sx={{ fontWeight: "bold" }}>
              候補日
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {possibleDateFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box sx={{ marginRight: "15px" }}>
                  <DatePickerWithLabelRHF<NewRecruitFormSchema>
                    name={`possibleDates.${index}.date`}
                    control={control}
                    endIcon={<BiCalendar size={30} />}
                  />
                </Box>
                <Box sx={{ width: "100px", marginRight: "15px" }}>
                  <InputWithLabelRHF<NewRecruitFormSchema>
                    type="number"
                    inputProps={{
                      // inputMode: "numeric",
                      // pattern: "[0-9]*",
                      width: "100px",
                    }}
                    placeholder="優先度"
                    name={`possibleDates.${index}.priority`}
                    control={control}
                  />
                </Box>
                <IconButton
                  sx={{ marginLeft: "auto" }}
                  onClick={() => removePossibleDate(index)}
                >
                  <FaTrash />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box sx={{ marginTop: "20px", display: "flex" }}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ marginX: "auto" }}
              startIcon={<AiOutlinePlus />}
              onClick={() => appendPossibleDate(defaultPossibleDate)}
            >
              候補日を追加する
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <MultipleSelectWithLabelRHF<
            NewRecruitFormSchema,
            { label: string; value: string }
          >
            name="recruitTags"
            control={control}
            label="募集タグ"
            placeholder="募集タグ"
            options={recruitTags}
          />
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewRecruitFormSchema>
            name="description"
            label="詳細"
            control={control}
            multiline
            minRows={5}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", mt: 4 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ width: "100%" }}
          loading={postRecruit.isPending}
        >
          保存
        </LoadingButton>
      </Box>
    </Box>
  );
};
