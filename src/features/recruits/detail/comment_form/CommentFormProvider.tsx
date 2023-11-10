import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  message: z.string().max(1000, { message: "1000文字以内で入力してください" }),
});

export type CommentFormSchema = z.infer<typeof schema>;

export const useNewCommentFormContext = () =>
  useFormContext<CommentFormSchema>();

type Props = {
  children: ReactNode;
};

export const CommentFormProvider = ({ children }: Props) => {
  const methods = useForm<CommentFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: { message: "" },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
