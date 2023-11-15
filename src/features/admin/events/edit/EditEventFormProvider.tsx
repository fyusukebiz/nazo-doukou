import { EventDetail } from "@/types/event";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(30),
  twitterTag: z.string(),
  description: z.string().max(1000),
  sourceUrl: z.string(),
  numberOfPeopleInTeam: z.string(), // 自由記述
  timeRequired: z.string(),
  coverImageFileUrl: z.string(),
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

  organization: z.object({ label: z.string(), value: z.string().nullable() }),
  gameTypes: z.object({ label: z.string(), value: z.string() }).array(),
  eventLocations: z
    .object({
      location: z.object({
        value: z
          .string()
          .nullable()
          .transform((value, ctx) => {
            if (value == null)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "開催地を選択してください",
              });
            return value;
          }),
        label: z.string(),
      }),
      building: z.string().max(12),
      description: z.string().max(200),
      startedAt: z.date().nullable(),
      endedAt: z.date().nullable(),
      detailedSchedule: z.string().max(100),
    })
    .array(),
});

export type EditEventFormSchema = z.infer<typeof schema>;

export const useEditEventFormContext = () =>
  useFormContext<EditEventFormSchema>();

type Props = {
  children: ReactNode;
  event: EventDetail;
};

export const defaultEventLocation = {
  location: { value: null, label: "" },
  startedAt: null,
  endedAt: null,
  building: "",
  detailedSchedule: "",
  description: "",
};

export const EditEventFormProvider = ({ children, event }: Props) => {
  const methods = useForm<EditEventFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      name: event.name,
      twitterTag: event.twitterTag ?? "",
      description: event.description ?? "",
      sourceUrl: event.sourceUrl ?? "",
      numberOfPeopleInTeam: event.numberOfPeopleInTeam ?? "",
      timeRequired: event.timeRequired ?? "",
      coverImageFileUrl: event.coverImageFileUrl ?? "",
      coverImageFile: null,
      organization: event.organization
        ? { label: event.organization.name, value: event.organization.id }
        : { label: "未選択", value: null },
      eventLocations: event.eventLocations.map((el) => ({
        location: {
          value: el.location.id,
          label: el.location.name,
        },
        building: el.building ?? "",
        description: el.description ?? "",
        startedAt: el.startedAt ? new Date(el.startedAt) : null,
        endedAt: el.endedAt ? new Date(el.endedAt) : null,
        detailedSchedule: el.detailedSchedule ?? "",
      })),
      gameTypes: event.gameTypes.map((type) => ({
        label: type.name,
        value: type.id,
      })),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
