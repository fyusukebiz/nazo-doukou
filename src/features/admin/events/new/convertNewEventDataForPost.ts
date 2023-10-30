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
      ...(data.numberOfPeopleInTeam && {
        numberOfPeopleInTeam: data.numberOfPeopleInTeam,
      }),
      ...(data.timeRequired && { timeRequired: data.timeRequired }),
      eventLocationEvents: data.eventLocationEvents.map((ele) => ({
        ...(ele.building && { building: ele.building }),
        ...(ele.startedAt && { startedAt: ele.startedAt.toISOString() }),
        ...(ele.endedAt && { endedAt: ele.endedAt.toISOString() }),
        ...(ele.description && { description: ele.description }),
        eventLocationId: ele.eventLocation.value!, // zodでバリデーションずみ
        ...(ele.eventDates && {
          eventDates: ele.eventDates.map((ed) => ({
            date: ed.date!.toISOString(), // zodでバリデーションずみ
          })),
        }),
      })),
    },
  };
};
