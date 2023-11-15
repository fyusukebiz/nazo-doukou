import { RecruitDetail } from "@/types/recruit";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    isSelectType: z.boolean(),
    manualEventName: z.string(),
    manualLocation: z.string(),
    eventLocation: z.object({
      label: z.string(),
      value: z.string().nullable(),
    }),
    numberOfPeople: z
      .string()
      .min(1)
      .refine((v) => {
        return !isNaN(Number(v));
      }, "数値を入力してください"),
    description: z.string().min(10).max(1000),
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
        priority: z.string().refine((v) => {
          return !v || !isNaN(Number(v));
        }, "数値を入力してください"),
      })
      .array()
      .min(1),
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

export type EditAdminRecruitFormSchema = z.infer<typeof schema>;

export const useEditAdminRecruitFormContext = () =>
  useFormContext<EditAdminRecruitFormSchema>();

type Props = {
  children: ReactNode;
  recruit: RecruitDetail;
};

export const defaultPossibleDate = {
  date: null,
  priority: "",
};

export const EditAdminRecruitFormProvider = ({ children, recruit }: Props) => {
  const methods = useForm<EditAdminRecruitFormSchema>({
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
          }
        : { value: null, label: "" },
      numberOfPeople: recruit.numberOfPeople?.toString() || "",
      description: recruit.description || "",
      possibleDates: recruit.possibleDates.map((date) => ({
        date: new Date(date.date),
        priority: date.priority?.toString() || "",
      })),
      recruitTags: recruit.recruitTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
