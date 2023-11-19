import { EditEventFormSchema } from "./EditEventFormProvider";

export const convertEditEventDataForPatch = ({
  data,
  coverImageFileKey,
}: {
  data: EditEventFormSchema;
  coverImageFileKey?: string;
}) => {
  return {
    event: {
      ...(data.organization.value && {
        organizationId: data.organization.value,
      }),
      name: data.name,
      ...(coverImageFileKey && { coverImageFileKey: coverImageFileKey }),
      ...(data.description && { description: data.description.trim() }),
      ...(data.sourceUrl && { sourceUrl: data.sourceUrl.trim() }),
      ...(data.twitterTag && { twitterTag: data.twitterTag.trim() }),
      ...(data.twitterContentTag && {
        twitterContentTag: data.twitterContentTag.trim(),
      }),
      ...(data.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: data.numberOfPeopleInTeam.trim(),
      }),
      gameTypeIds: data.gameTypes.map((gameType) => gameType.id),
      ...(data.timeRequired && { timeRequired: data.timeRequired.trim() }),
      eventLocations: data.eventLocations.map((el) => ({
        ...(el.id && { id: el.id }), // 新規作成ならidが入らない
        locationId: el.location.value!, // バリデーションでnullではない
        ...(el.building && { building: el.building.trim() }),
        ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
        ...(el.endedAt && { endedAt: el.endedAt.toISOString() }),
        ...(el.detailedSchedule && {
          detailedSchedule: el.detailedSchedule.trim(),
        }),
        ...(el.description && { description: el.description.trim() }),
      })),
    },
  };
};
