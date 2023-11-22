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
      ...(data.description && { description: data.description.trim() }),
      ...(data.sourceUrl && { sourceUrl: data.sourceUrl.trim() }),
      ...(data.twitterTag && { twitterTag: data.twitterTag.trim() }),
      ...(data.twitterContentTag && {
        twitterContentTag: data.twitterContentTag.trim(),
      }),
      ...(data.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: data.numberOfPeopleInTeam,
      }),
      gameTypeIds: data.gameTypes.map((gameType) => gameType.id),
      ...(data.timeRequired && { timeRequired: data.timeRequired.trim() }),
      eventLocations: data.eventLocations.map((el) => ({
        locationId: el.location.value!, // バリデーションでnullではない
        dateType: el.dateType,
        ...(el.building && { building: el.building.trim() }),
        ...(el.dateType === "RANGE" &&
          el.startedAt && { startedAt: el.startedAt.toISOString() }),
        ...(el.dateType === "RANGE" &&
          el.endedAt && { endedAt: el.endedAt.toISOString() }),
        ...(el.detailedSchedule && {
          detailedSchedule: el.detailedSchedule.trim(),
        }),
        eventLocationDates:
          el.dateType === "INDIVISUAL"
            ? el.eventLocationDates
                .filter((eld): eld is { date: Date } => !!eld.date)
                .map((eld) => eld.date.toISOString())
            : [],
        ...(el.description && { description: el.description.trim() }),
      })),
    },
  };
};
