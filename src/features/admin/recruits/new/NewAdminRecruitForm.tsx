import { LoadingButton } from "@mui/lab";
import {
  Grid,
  Box,
  Button,
  Stack,
  Switch,
  IconButton,
  Checkbox,
  Chip,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useWatch } from "react-hook-form";
import {
  NewAdminRecruitFormSchema,
  defaultPossibleDate,
  useNewAdminRecruitFormContext,
} from "./NewAdminRecruitFormProvider";
import { convertNewRecruitDataForPost } from "./convertNewRecruitDataForPost";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { AiOutlinePlus } from "react-icons/ai";
import { SingleSelectWithLabelRHF } from "@/components/forms/hook_form/SingleSelectWithLabelRHF";
import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { BiCalendar } from "react-icons/bi";
import { useRecruitTagsQuery } from "@/react_queries/recruit_tags/useRecruitTagsQuery";
import { useEventLocationOptionsQuery } from "@/react_queries/event_locations/useEventLocationOptionsQuery";
import { FaTrash } from "react-icons/fa";
import { grey } from "@mui/material/colors";
import { makeTwitterTextForRecruit } from "./makeTwitterTextForRecruit";
import { usePostRecruitByAdmin } from "@/react_queries/admin/recruits/usePostRecruitByAdmin";
import axios from "axios";
import { getFirebaseDynamicLinksShortUrl } from "@/utils/getFirebaseDynamicLinksShortUrl";

export const NewAdminRecruitForm = () => {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useNewAdminRecruitFormContext();

  const isSelectType = useWatch({ control, name: "isSelectType" });
  const myRecruitTags = useWatch({ control, name: "recruitTags" });
  const possibleDates = useWatch({ control, name: "possibleDates" });

  const [willPostToTwitter, setWillPostToTwitter] = useState(true);

  const { postRecruitByAdmin } = usePostRecruitByAdmin();

  const { data: eventLocationOptsData, status: eventLocationOptsStatus } =
    useEventLocationOptionsQuery();

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

  const eventLocations = useMemo(() => {
    if (eventLocationOptsStatus !== "success") return [];
    return eventLocationOptsData.eventLocationOptions.map((opt) => ({
      value: opt.id,
      label: `${opt.name}(${opt.location})`,
      event: opt.event,
    }));
  }, [eventLocationOptsData, eventLocationOptsStatus]);

  const onSubmit: SubmitHandler<NewAdminRecruitFormSchema> = async (
    rawData
  ) => {
    // 送信用にデータを加工
    const dataToPost = convertNewRecruitDataForPost({
      data: rawData,
    });
    postRecruitByAdmin.mutate(
      { body: dataToPost },
      {
        onSuccess: async (res) => {
          toast.success("作成しました");
          router.push("/admin/recruits");
          if (willPostToTwitter) {
            const url = `${process.env.NEXT_PUBLIC_HOST}/recruits/${res.recruitId}`;
            const shortUrl = await getFirebaseDynamicLinksShortUrl(url);
            const text = makeTwitterTextForRecruit({
              isSelectType,
              rawData,
              url: shortUrl,
            });
            const urlSearchParam = new URLSearchParams();
            urlSearchParam.set("text", text);

            window.open(
              `https://twitter.com/intent/tweet?${urlSearchParam.toString()}`,
              "_blank"
            );
          }
        },
      }
    );
  };

  const handleClickRecruitTag = useCallback(
    ({ recruitTag }: { recruitTag: { id: string; name: string } }) => {
      const index = myRecruitTags.findIndex((tag) => tag.id === recruitTag.id);
      if (index > -1) {
        // 削除
        const newMyRecruitTags = [...myRecruitTags];
        newMyRecruitTags.splice(index, 1);
        setValue("recruitTags", newMyRecruitTags);
      } else {
        // 追加
        setValue("recruitTags", [...myRecruitTags, recruitTag]);
      }
    },
    [myRecruitTags, setValue]
  );

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
              color="teal"
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
              NewAdminRecruitFormSchema,
              {
                label: string;
                value: string;
                event: {
                  id: string;
                  twitterTag?: string;
                  twitterContentTag?: string;
                };
              }
            >
              name="eventLocation"
              control={control}
              placeholder="イベント"
              options={eventLocations}
              isSearchable={true}
            />
          </Grid>
        ) : (
          <>
            <Grid item xs={12}>
              <InputWithLabelRHF<NewAdminRecruitFormSchema>
                name="manualEventName"
                label="イベント名"
                control={control}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <InputWithLabelRHF<NewAdminRecruitFormSchema>
                name="manualLocation"
                label="開催場所"
                control={control}
                fullWidth
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <InputWithLabelRHF<NewAdminRecruitFormSchema>
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
                <Box
                  sx={{ marginRight: "5px", wordBreak: "keep-all" }}
                >{`第${field.priority}`}</Box>
                <Box
                  sx={{ marginRight: "10px", width: "170px", flexShrink: 0 }}
                >
                  <DatePickerWithLabelRHF<NewAdminRecruitFormSchema>
                    name={`possibleDates.${index}.date`}
                    control={control}
                    endIcon={<BiCalendar size={25} />}
                    isClearable
                  />
                </Box>
                <Box sx={{ flexGrow: 1, marginRight: "10px" }}>
                  <InputWithLabelRHF<NewAdminRecruitFormSchema>
                    sx={{ flexGrow: "1" }}
                    placeholder="時間"
                    name={`possibleDates.${index}.hours`}
                    control={control}
                  />
                </Box>
                {index !== 0 ? (
                  <IconButton
                    sx={{ marginLeft: "auto", padding: "0px", width: "20px" }}
                    onClick={() => removePossibleDate(index)}
                  >
                    <FaTrash size={20} />
                  </IconButton>
                ) : (
                  <Box
                    sx={{ width: "20px", height: "30px", flexShrink: 0 }}
                  ></Box>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ marginTop: "20px", display: "flex" }}>
            <Button
              variant="outlined"
              color="teal"
              sx={{ marginX: "auto" }}
              startIcon={<AiOutlinePlus />}
              onClick={() =>
                appendPossibleDate({
                  ...defaultPossibleDate,
                  priority: possibleDates.length + 1,
                })
              }
              disabled={possibleDates.length > 1}
            >
              候補日を追加する
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ marginBottom: "8px" }}>
            <Box component="label" sx={{ fontWeight: "bold" }}>
              募集タグ
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {recruitTagsData?.recruitTags.map((rt) => (
              <Chip
                key={rt.id}
                label={rt.name}
                color="teal"
                variant={
                  myRecruitTags.find((myRt) => myRt.id === rt.id)
                    ? "filled"
                    : "outlined"
                }
                onClick={() =>
                  handleClickRecruitTag({
                    recruitTag: rt,
                  })
                }
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <InputWithLabelRHF<NewAdminRecruitFormSchema>
            name="description"
            label="詳細"
            placeholder="募集開始時のメンバー構成など"
            control={control}
            multiline
            minRows={5}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              color="teal"
              checked={willPostToTwitter}
              onChange={(e) => setWillPostToTwitter(e.target.checked)}
            />
            <Box component="label" sx={{ fontWeight: "bold" }}>
              X（旧Twitter）に投稿する
            </Box>
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
          loading={postRecruitByAdmin.isPending}
        >
          保存
        </LoadingButton>
      </Box>
    </Box>
  );
};
