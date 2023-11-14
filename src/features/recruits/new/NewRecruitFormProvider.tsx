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
    }),
    numberOfPeople: z.string().refine((v) => {
      return !v || !isNaN(Number(v));
    }, "数値を入力してください"),
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
        priority: z.string().refine((v) => {
          return !v || !isNaN(Number(v));
        }, "数値を入力してください"),
      })
      .array()
      .min(1)
      .max(5),
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

export type NewRecruitFormSchema = z.infer<typeof schema>;

export const useNewRecruitFormContext = () =>
  useFormContext<NewRecruitFormSchema>();

type Props = {
  children: ReactNode;
};

export const defaultPossibleDate = {
  date: null,
  priority: "",
};

export const NewRecruitFormProvider = ({ children }: Props) => {
  const methods = useForm<NewRecruitFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      isSelectType: true,
      manualEventName: "",
      manualLocation: "",
      eventLocation: { value: null, label: "" },
      numberOfPeople: "",
      description: "",
      possibleDates: [defaultPossibleDate],
      recruitTags: [],
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
