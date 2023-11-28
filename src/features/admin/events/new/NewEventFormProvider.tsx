import { zodResolver } from "@hookform/resolvers/zod";
import { EventLocationDateType } from "@prisma/client";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(30),
  organization: z.object({ label: z.string(), value: z.string().nullable() }),
  description: z.string().max(1000),
  sourceUrl: z.string(),
  twitterTag: z.string().regex(/^([^#]|^$)/i, "#をつけないでください"),
  twitterContentTag: z.string().regex(/^([^#]|^$)/i, "#をつけないでください"),
  gameTypes: z.object({ id: z.string(), name: z.string() }).array(),
  coverImageFile: z
    .custom<File | null>()
    .refine(
      (file) =>
        !file ||
        file.size <
          Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) * 1000 * 1000,
      {
        message: `ファイルサイズは最大${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MBです`,
      }
    ),
  numberOfPeopleInTeam: z.string(), // 自由記述
  timeRequired: z.string(),
  eventLocations: z
    .object({
      location: z.object({
        value: z
          .string()
          .nullable()
          .transform((value, ctx) => {
            if (value == null) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "開催地を選択してください",
              });
            }
            return value;
          }),
        label: z.string(),
      }),
      building: z.string().max(20),
      description: z.string().max(200),
      dateType: z.nativeEnum(EventLocationDateType),
      startedAt: z.date().nullable(),
      endedAt: z.date().nullable(),
      eventLocationDates: z.object({ date: z.date() }).array(),
    })
    .array(),
});

export type NewEventFormSchema = z.infer<typeof schema>;

export const useNewEventFormContext = () =>
  useFormContext<NewEventFormSchema>();

type Props = {
  children: ReactNode;
};

export const defaultEventLocation = {
  location: { value: null, label: "" },
  dateType: "RANGE" as const,
  startedAt: null,
  endedAt: null,
  building: "",
  description: "",
  eventLocationDates: [],
};

export const NewEventFormProvider = ({ children }: Props) => {
  const methods = useForm<NewEventFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      organization: { label: "", value: null },
      gameTypes: [],
      twitterTag: "",
      twitterContentTag: "",
      description: "",
      sourceUrl: "",
      coverImageFile: null,
      numberOfPeopleInTeam: "",
      timeRequired: "",
      eventLocations: [defaultEventLocation],
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
