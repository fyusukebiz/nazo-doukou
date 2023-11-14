import { EditAdminRecruitFormSchema } from "./EditAdminRecruitFormProvider";

export const convertAdminRecruitDataForPatch = ({
  data,
}: {
  data: EditAdminRecruitFormSchema;
}) => {
  return {
    isSelectType: data.isSelectType,
    recruit: {
      ...(data.manualEventName && {
        manualEventName: data.manualEventName.trim(),
      }),
      ...(data.manualLocation && {
        manualLocation: data.manualLocation.trim(),
      }),
      ...(data.eventLocation.value && {
        eventLocationId: data.eventLocation.value,
      }),
      ...(data.numberOfPeople && {
        numberOfPeople: Number(data.numberOfPeople) as number,
      }),
      ...(data.description && {
        description: data.description.trim(),
      }),
    },
    recruitTagIds: data.recruitTags.map((tag) => tag.id),
    possibleDates: data.possibleDates.map((date) => ({
      date: date.date!.toISOString(),
      ...(date.priority && { priority: Number(date.priority) as number }),
    })),
  };
};
