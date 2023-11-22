import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  eventName: z.string(),
  locations: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  gameTypes: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .array(),
  date: z.date().nullable(),
});

export type EventLocationSearchFormSchema = z.infer<typeof schema>;

export const useEventLocationSearchFormContext = () =>
  useFormContext<EventLocationSearchFormSchema>();

export const defaultEventLocationSearchFormValues = {
  eventName: "",
  locations: [],
  gameTypes: [],
  date: null,
};

type Props = {
  children: ReactNode;
};

export const EventLocationSearchFormProvider = ({ children }: Props) => {
  const methods = useForm<EventLocationSearchFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: defaultEventLocationSearchFormValues,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
