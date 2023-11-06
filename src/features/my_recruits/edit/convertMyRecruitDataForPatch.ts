import { EditMyRecruitFormSchema } from "./EditMyRecruitFormProvider";

export const convertMyRecruitDataForPatch = ({
  data,
}: {
  data: EditMyRecruitFormSchema;
}) => {
  return {
    isSelectType: data.isSelectType,
    recruit: {
      ...(data.manualEventName && {
        manualEventName: data.manualEventName,
      }),
      ...(data.manualLocation && {
        manualLocation: data.manualLocation,
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
