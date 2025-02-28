import { sexOptions } from "@/constants/sexOptions";
import { UserDetail } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sex, LikeOrDislike } from "@prisma/client";
import { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(20),
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
  twitter: z.string().regex(/^([^@]|^$)/i, "@をつけないでください"),
  instagram: z.string(),
  userGameTypes: z
    .object({
      gameTypeId: z.string(),
      likeOrDislike: z.nativeEnum(LikeOrDislike),
    })
    .array(),
  strongAreas: z.object({ id: z.string(), name: z.string() }).array(), // TODO: よくない
});

export type EditMyUserFormSchema = z.infer<typeof schema>;

export const useEditMyUserFormContext = () =>
  useFormContext<EditMyUserFormSchema>();

type Props = {
  children: ReactNode;
  myUser: UserDetail;
};

export const EditMyUserFormProvider = ({ children, myUser }: Props) => {
  const methods = useForm<EditMyUserFormSchema>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
    defaultValues: {
      name: myUser.name,
      iconImageFile: null,
      iconImageFileKey: myUser.iconImageFileKey || "",
      sex: myUser.sex
        ? sexOptions.find((opt) => opt.value === myUser.sex)!
        : null,
      startedAt: myUser.startedAt ? new Date(myUser.startedAt) : null,
      description: myUser.description ?? "",
      twitter: myUser.twitter ?? "",
      instagram: myUser.instagram ?? "",
      userGameTypes:
        myUser.userGameTypes?.map((ugt) => ({
          gameTypeId: ugt.gameType.id,
          likeOrDislike: ugt.likeOrDislike,
        })) ?? [],
      strongAreas:
        myUser.userStrongAreas?.map((usa) => ({
          id: usa.strongArea.id,
          name: usa.strongArea.name,
        })) ?? [],
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
