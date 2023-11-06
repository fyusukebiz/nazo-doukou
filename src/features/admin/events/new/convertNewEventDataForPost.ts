import { NewEventFormSchema } from "./NewEventFormProvider";

export const convertNewEventDataForPost = ({
  data,
  coverImageFileKey,
}: {
  data: NewEventFormSchema;
  coverImageFileKey?: string;
}) => {
  return {
    event: {
      ...(data.organization.value && {
        organizationId: data.organization.value,
      }),
      name: data.name,
      ...(coverImageFileKey && { coverImageFileKey: coverImageFileKey }),
      ...(data.description && { description: data.description }),
      ...(data.sourceUrl && { sourceUrl: data.sourceUrl }),
      ...(data.twitterTag && { twitterTag: data.twitterTag }),
      ...(data.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: data.numberOfPeopleInTeam,
      }),
      gameTypeIds: data.gameTypes.map((gameType) => gameType.value),
      ...(data.timeRequired && { timeRequired: data.timeRequired }),
      eventLocations: data.eventLocations.map((el) => ({
        locationId: el.location.value!, // バリデーションでnullではない
        ...(el.building && { building: el.building }),
        ...(el.startedAt && { startedAt: el.startedAt.toISOString() }),
        ...(el.endedAt && { endedAt: el.endedAt.toISOString() }),
        ...(el.detailedSchedule && { detailedSchedule: el.detailedSchedule }),
        ...(el.description && { description: el.description }),
      })),
    },
  };
};
