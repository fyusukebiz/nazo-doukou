import { NewRecruitFormSchema } from "./NewRecruitFormProvider";

export const convertNewRecruitDataForPost = ({
  data,
}: {
  data: NewRecruitFormSchema;
}) => {
  return {
    isSelectType: data.isSelectType,
    recruit: {
      ...(data.manualEventName && {
        manualEventName: data.manualEventName,
      }),
      ...(data.manualEventLocation && {
        manualEventLocation: data.manualEventLocation,
      }),
      ...(data.eventLocation.value && {
        eventLocationId: data.eventLocation.value,
      }),
      ...(data.numberOfPeople && {
        numberOfPeople: Number(data.numberOfPeople) as number,
      }),
      ...(data.description && {
        description: data.description,
      }),
    },
    recruitTagIds: data.recruitTags.map((tag) => tag.value),
    possibleDates: data.possibleDates.map((date) => ({
      date: date.date!.toISOString(),
      ...(date.priority && { priority: Number(date.priority) as number }),
    })),
  };
};
