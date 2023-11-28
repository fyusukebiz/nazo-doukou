import { Control, useFieldArray } from "react-hook-form";
import { NewEventFormSchema } from "./NewEventFormProvider";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { format, isSameDay } from "date-fns";
import { blue, teal } from "@mui/material/colors";

type Props = {
  control: Control<NewEventFormSchema, any>;
  eventLocationIndex: number;
};

export const EventLocationDateInputsRHF = (props: Props) => {
  const { control, eventLocationIndex } = props;

  const {
    fields: eventLocationDateFields,
    append: appendEventLocationDate,
    remove: removeEventLocationDate,
  } = useFieldArray({
    control,
    name: `eventLocations.${eventLocationIndex}.eventLocationDates`,
  });

  return (
    <FullCalendar
      locales={allLocales}
      locale="ja"
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      firstDay={1} // 月曜始まり
      timeZone="Asia/Tokyo"
      contentHeight="auto"
      selectable={true}
      events={[
        ...eventLocationDateFields.map((eld) => ({
          start: format(new Date(eld.date), "yyy-MM-dd"),
          display: "background",
          color: teal[500] as string,
        })),
        { title: "今日", start: format(new Date(), "yyy-MM-dd") },
      ]}
      eventBackgroundColor={blue[200]}
      eventBorderColor={blue[200]}
      eventTextColor={blue[700]}
      dateClick={(e) => {
        const index = eventLocationDateFields.findIndex((elDate) =>
          isSameDay(elDate.date, e.date)
        );
        if (index > -1) {
          removeEventLocationDate(index);
        } else {
          appendEventLocationDate({ date: e.date });
        }
      }}
    />
  );
};
