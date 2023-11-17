import { RecruitDetail } from "@/types/recruit";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    isSelectType: z.boolean(),
    manualEventName: z.string().max(30),
    manualLocation: z.string().max(30),
    eventLocation: z.object({
      label: z.string(),
      value: z.string().nullable(),
      event: z
        .object({
          id: z.string(),
          twitterTag: z.string().optional(),
          twitterContentTag: z.string().optional(),
        })
        .optional(),
    }),
    numberOfPeople: z
      .string()
      .min(1)
      .refine((v) => {
        return !isNaN(Number(v));
      }, "数値を入力してください")
      .refine((v) => {
        return Number(v) > 0;
      }, "1以上の値を入力してください"),
    description: z.string().min(10).max(200),
    possibleDates: z
      .object({
        date: z
          .date()
          .nullable()
          .transform((value, ctx) => {
            if (value == null)
              ctx.addIssue({
                code: "custom",
                message: `日付を入力してください`,
              });
            return value;
          }),
        hours: z.string().min(1).max(15),
        priority: z.number().min(1),
      })
      .array()
      .min(1)
      .max(2),
    recruitTags: z.object({ id: z.string(), name: z.string() }).array(),
  })
  .superRefine((val, ctx) => {
    if (val.isSelectType && !val.eventLocation.value) {
      ctx.addIssue({
        path: ["eventLocation"],
        code: "custom",
        message: "イベントが未入力です。",
      });
    }

    if (!val.isSelectType && !val.manualLocation) {
      ctx.addIssue({
        path: ["manualLocation"],
        code: "custom",
        message: "開催場所を記載してください",
      });
    }

    if (!val.isSelectType && !val.manualEventName) {
      ctx.addIssue({
        path: ["manualEventName"],
        code: "custom",
        message: "イベント名を記載してください",
      });
    }
  });

export type EditMyRecruitFormSchema = z.infer<typeof schema>;

export const useEditMyRecruitFormContext = () =>
  useFormContext<EditMyRecruitFormSchema>();

export const defaultPossibleDate = {
  date: null,
  hours: "",
};

type Props = {
  children: ReactNode;
  recruit: RecruitDetail;
};

export const EditMyRecruitFormProvider = ({ children, recruit }: Props) => {
  const methods = useForm<EditMyRecruitFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      isSelectType: !!recruit.eventLocation,
      manualEventName: recruit.manualEventName || "",
      manualLocation: recruit.manualLocation || "",
      eventLocation: recruit.eventLocation
        ? {
            value: recruit.eventLocation.id,
            label: `${recruit.eventLocation.event.name}(${recruit.eventLocation.location.name})`,
            event: {
              id: recruit.eventLocation.event.id,
              ...(recruit.eventLocation.event.twitterTag && {
                twitterTag: recruit.eventLocation.event.twitterTag,
              }),
              ...(recruit.eventLocation.event.twitterContentTag && {
                twitterContentTag:
                  recruit.eventLocation.event.twitterContentTag,
              }),
            },
          }
        : { value: null, label: "" },
      numberOfPeople: recruit.numberOfPeople?.toString() || "",
      description: recruit.description || "",
      possibleDates: recruit.possibleDates.map((date) => ({
        date: new Date(date.date),
        hours: date.hours || "",
        priority: date.priority,
      })),
      recruitTags: recruit.recruitTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
