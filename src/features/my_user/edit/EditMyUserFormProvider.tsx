import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  lastName: z.string().min(1, { message: "空欄です" }),
  firstName: z.string().min(1, { message: "空欄です" }),
  lastNameKana: z
    .string()
    .min(1, { message: "空欄です" })
    .regex(/(?=.*?[\u30A1-\u30FC])[\u30A1-\u30FCs]*/, {
      message: "カタカナを入力してください",
    }),
  firstNameKana: z
    .string()
    .min(1, { message: "空欄です" })
    .regex(/(?=.*?[\u30A1-\u30FC])[\u30A1-\u30FCs]*/, {
      message: "カタカナを入力してください",
    }),
});

export type EditMyUserFormSchema = z.infer<typeof schema>;

export const useEditMyUserFormContext = () =>
  useFormContext<EditMyUserFormSchema>();

type Props = {
  children: ReactNode;
};

export const EditMyUserFormProvider = ({ children }: Props) => {
  const methods = useForm<EditMyUserFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      lastName: "",
      firstName: "",
      lastNameKana: "",
      firstNameKana: "",
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
