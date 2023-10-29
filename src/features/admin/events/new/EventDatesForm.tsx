import { Box, Button, Divider } from "@mui/material";
import { Control, useFieldArray } from "react-hook-form";
import { NewEventFormSchema, defaultEventDate } from "./NewEventFormProvider";
import { AiOutlinePlus } from "react-icons/ai";
import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { BiCalendar } from "react-icons/bi";
import { grey } from "@mui/material/colors";

type Props = {
  control: Control<NewEventFormSchema, any>;
  eventLocationEventIndex: number;
};

export const EventDatesForm = ({ control, eventLocationEventIndex }: Props) => {
  const {
    fields: newEventDateFields,
    append: appendEventDate,
    remove: removeEventDate,
  } = useFieldArray({
    control,
    name: `eventLocationEvents.${eventLocationEventIndex}.eventDates`,
  });

  return (
    <Box
      sx={{
        border: `1px dashed ${grey[300]}`,
        borderRadius: "5px",
        padding: "20px",
      }}
    >
      {newEventDateFields.map((field, index) => (
        <Box key={field.id} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex" }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ marginLeft: "auto" }}
              onClick={() => removeEventDate(index)}
            >
              日付を削除する
            </Button>
          </Box>
          <DatePickerWithLabelRHF<NewEventFormSchema>
            name={`eventLocationEvents.${eventLocationEventIndex}.eventDates.${index}.date`}
            label="日付"
            control={control}
            endIcon={<BiCalendar size={30} />}
            minDate={new Date()}
          />
          <Divider
            sx={{ marginY: "20px", border: `1px dashed ${grey[300]}` }}
          />
        </Box>
      ))}
      <Box sx={{ marginTop: "10px", display: "flex" }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ marginX: "auto" }}
          startIcon={<AiOutlinePlus />}
          onClick={() => appendEventDate(defaultEventDate)}
        >
          日付を追加する
        </Button>
      </Box>
    </Box>
  );
};
