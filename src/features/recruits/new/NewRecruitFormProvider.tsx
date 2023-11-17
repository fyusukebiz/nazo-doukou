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
      building: z.string().optional(),
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
      .refine((v) => {
        return !isNaN(Number(v));
      }, "数値を入力してください")
      .refine((v) => {
        return !!v && Number(v) > 0;
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

export type NewRecruitFormSchema = z.infer<typeof schema>;

export const useNewRecruitFormContext = () =>
  useFormContext<NewRecruitFormSchema>();

type Props = {
  children: ReactNode;
};

export const defaultPossibleDate = {
  date: null,
  hours: "",
};

export const NewRecruitFormProvider = ({ children }: Props) => {
  const methods = useForm<NewRecruitFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      isSelectType: true,
      manualEventName: "",
      manualLocation: "",
      eventLocation: { value: null, label: "", event: undefined },
      numberOfPeople: "",
      description: "",
      possibleDates: [{ ...defaultPossibleDate, priority: 1 }],
      recruitTags: [],
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
