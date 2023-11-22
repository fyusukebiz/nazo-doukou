import { EditMyUserFormSchema } from "./EditMyUserFormProvider";

export const convertEditMyUserDataForPatch = ({
  data,
  newIconImageFileKey,
}: {
  data: EditMyUserFormSchema;
  newIconImageFileKey?: string;
}) => {
  return {
    user: {
      name: data.name,
      iconImageFileKey: newIconImageFileKey
        ? newIconImageFileKey
        : data.iconImageFileKey,
      ...(data.sex && { sex: data.sex.value }),
      // ...(data.age && {age: data.age}),
      ...(data.startedAt && { startedAt: data.startedAt.toISOString() }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.twitter && { twitter: data.twitter.trim() }),
      ...(data.instagram && { instagram: data.instagram.trim() }),
    },
    userGameTypes: data.userGameTypes.map((ugt) => ({
      gameTypeId: ugt.gameTypeId,
      likeOrDislike: ugt.likeOrDislike,
    })),
    strongAreaIds: data.strongAreas.map((area) => area.id),
  };
};
