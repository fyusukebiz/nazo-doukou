import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(1).max(30),
    twitter: z.string().max(30),
    instagram: z.string().max(30),
    email: z
      .string()
      .min(1, { message: "メールアドレスを入力してください。" })
      .max(100, { message: "100文字以内で入力してください" }),
    password: z
      .string()
      .min(8, { message: "8文字以上で入力してください。" })
      .max(30, { message: "30文字以内で入力してください" })
      .regex(
        /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{8,100}$/i,
        "パスワードは半角英数字混合で入力してください"
      ),
    passwordConfirm: z.string().min(1, "確認用のパスワードを入力してください"),
  })
  .superRefine(({ twitter, instagram, password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        path: ["passwordConfirm"],
        code: "custom",
        message: "パスワードが一致しません",
      });
    }
    if (!twitter && !instagram) {
      ctx.addIssue({
        path: ["twitter"],
        code: "custom",
        message: "少なくともどちらか一方のアカウントIDを入力してください",
      });
    }
  });

export type SignupFormSchema = z.infer<typeof schema>;

export const useSignupFormContext = () => useFormContext<SignupFormSchema>();

type Props = {
  children: ReactNode;
};

export const SignupFormProvider = ({ children }: Props) => {
  const methods = useForm<SignupFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      twitter: "",
      instagram: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
