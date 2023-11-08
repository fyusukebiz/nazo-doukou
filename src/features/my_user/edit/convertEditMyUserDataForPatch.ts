import { EditMyUserFormSchema } from "./EditMyUserFormProvider";

export const convertEditMyUserDataForPatch = ({
  data,
  iconImageFileKey,
}: {
  data: EditMyUserFormSchema;
  iconImageFileKey?: string;
}) => {
  return {
    user: {
      name: data.name,
      iconImageFileKey: iconImageFileKey,
      ...(data.sex && { sex: data.sex.value }),
      // ...(data.age && {age: data.age}),
      ...(data.startedAt && { startedAt: data.startedAt.toISOString() }),
      ...(data.description && { description: data.description }),
      ...(data.twitter && { twitter: data.twitter }),
      ...(data.instagram && { instagram: data.instagram }),
    },
    userGameTypes: data.userGameTypes.map((ugt) => ({
      gameTypeId: ugt.gameTypeId,
      likeOrDislike: ugt.likeOrDislike,
    })),
  };
};
