import { LoadingButton } from "@mui/lab";
import {
  Grid,
  Box,
  Button,
  Stack,
  Switch,
  IconButton,
  Chip,
} from "@mui/material";
import { useCallback, useMemo } from "react";
import { SubmitHandler, useFieldArray, useWatch } from "react-hook-form";
import {
  EditAdminRecruitFormSchema,
  defaultPossibleDate,
  useEditAdminRecruitFormContext,
} from "./EditAdminRecruitFormProvider";
import { convertAdminRecruitDataForPatch } from "./convertAdminRecruitDataForPatch";
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
import { RecruitDetail } from "@/types/recruit";
import { usePatchRecruitByAdmin } from "@/react_queries/admin/recruits/usePatchRecruitByAdmin";
import { useDeleteRecruitByAdmin } from "@/react_queries/admin/recruits/useDeleteRecruitByAdmin";

type Props = {
  recruit: RecruitDetail;
};

export const EditAdminRecruitForm = ({ recruit }: Props) => {
  const router = useRouter();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useEditAdminRecruitFormContext();

  const isSelectType = useWatch({ control, name: "isSelectType" });
  const myRecruitTags = useWatch({ control, name: "recruitTags" });
  const possibleDates = useWatch({ control, name: "possibleDates" });

  const { patchRecruitByAdmin } = usePatchRecruitByAdmin();

  const { deleteRecruitByAdmin } = useDeleteRecruitByAdmin();

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

  const onSubmit: SubmitHandler<EditAdminRecruitFormSchema> = async (
    rawData
  ) => {
    // // 送信用にデータを加工
    const dataToPatch = convertAdminRecruitDataForPatch({
      data: rawData,
    });
    patchRecruitByAdmin.mutate(
      { path: { recruitId: recruit.id }, body: dataToPatch },
      {
        onSuccess: async (res) => {
          toast.success("更新しました");
          router.push("/admin/recruits");
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

  const handleClickDelete = () => {
    const result = window.confirm("募集を削除しますか？");
    if (!result) return;

    deleteRecruitByAdmin.mutate(
      { path: { recruitId: recruit.id } },
      {
        onSuccess: () => {
          router.back();
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
              EditAdminRecruitFormSchema,
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
              <InputWithLabelRHF<EditAdminRecruitFormSchema>
                name="manualEventName"
                label="イベント名"
                control={control}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <InputWithLabelRHF<EditAdminRecruitFormSchema>
                name="manualLocation"
                label="開催場所"
                control={control}
                fullWidth
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <InputWithLabelRHF<EditAdminRecruitFormSchema>
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
                  <DatePickerWithLabelRHF<EditAdminRecruitFormSchema>
                    name={`possibleDates.${index}.date`}
                    control={control}
                    endIcon={<BiCalendar size={25} />}
                    isClearable
                  />
                </Box>
                <Box sx={{ flexGrow: 1, marginRight: "10px" }}>
                  <InputWithLabelRHF<EditAdminRecruitFormSchema>
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
          <InputWithLabelRHF<EditAdminRecruitFormSchema>
            name="description"
            label="詳細"
            placeholder="募集開始時のメンバー構成、など"
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
          color="teal"
          size="large"
          sx={{ width: "100%" }}
          loading={patchRecruitByAdmin.isPending}
        >
          保存
        </LoadingButton>
      </Box>

      <Box sx={{ display: "flex", marginTop: "10px" }}>
        <Button
          sx={{ marginLeft: "auto", color: grey[500] }}
          size="small"
          onClick={handleClickDelete}
        >
          削除
        </Button>
      </Box>
    </Box>
  );
};
