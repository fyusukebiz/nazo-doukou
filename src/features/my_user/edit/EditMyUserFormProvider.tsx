import { sexOptions } from "@/constants/sexOptions";
import { User } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sex, LikeOrDislike } from "@prisma/client";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  iconImageFile: z
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
  iconImageFileKey: z.string(),
  sex: z.object({ value: z.nativeEnum(Sex), label: z.string() }).nullable(),
  startedAt: z.date().nullable(),
  description: z.string(),
  twitter: z.string(),
  instagram: z.string(),
  userGameTypes: z
    .object({
      gameTypeId: z.string(),
      likeOrDislike: z.nativeEnum(LikeOrDislike),
    })
    .array(),
});

export type EditMyUserFormSchema = z.infer<typeof schema>;

export const useEditMyUserFormContext = () =>
  useFormContext<EditMyUserFormSchema>();

type Props = {
  children: ReactNode;
  myUser: User;
};

export const EditMyUserFormProvider = ({ children, myUser }: Props) => {
  const methods = useForm<EditMyUserFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      name: myUser.name,
      iconImageFile: null,
      iconImageFileKey: "",
      sex: myUser.sex
        ? sexOptions.find((opt) => opt.value === myUser.sex)!
        : null,
      startedAt: myUser.startedAt ? new Date(myUser.startedAt) : null,
      description: myUser.description ?? "",
      twitter: myUser.twitter ?? "",
      instagram: myUser.instagram ?? "",
      userGameTypes: myUser.userGameTypes.map((ugt) => ({
        gameTypeId: ugt.gameTypeId,
        likeOrDislike: ugt.likeOrDislike,
      })),
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
