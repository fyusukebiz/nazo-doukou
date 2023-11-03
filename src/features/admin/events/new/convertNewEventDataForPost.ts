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
      eventLocationEvents: data.eventLocationEvents.map((ele) => ({
        eventLocationId: ele.eventLocation.value!, // バリデーションでnullではない
        ...(ele.building && { building: ele.building }),
        ...(ele.startedAt && { startedAt: ele.startedAt.toISOString() }),
        ...(ele.endedAt && { endedAt: ele.endedAt.toISOString() }),
        ...(ele.detailedSchedule && { detailedSchedule: ele.detailedSchedule }),
        ...(ele.description && { description: ele.description }),
      })),
    },
  };
};
