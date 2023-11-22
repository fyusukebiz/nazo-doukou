import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { Control, useFieldArray } from "react-hook-form";
import { BiCalendar } from "react-icons/bi";
import { Box, Button, IconButton } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { EditEventFormSchema } from "./EditEventFormProvider";

type Props = {
  control: Control<EditEventFormSchema, any>;
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
    <>
      <Box sx={{ display: "flex" }}>
        <Button
          color="teal"
          variant="contained"
          sx={{ marginLeft: "auto" }}
          onClick={() => appendEventLocationDate({ date: null })}
        >
          追加
        </Button>
      </Box>
      {eventLocationDateFields.map((field, eventLocationDateIndex) => (
        <Box
          key={eventLocationDateIndex}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <DatePickerWithLabelRHF<EditEventFormSchema>
            key={field.id}
            name={`eventLocations.${eventLocationIndex}.eventLocationDates.${eventLocationDateIndex}.date`}
            control={control}
            endIcon={<BiCalendar size={30} />}
          />
          {eventLocationDateIndex !== 0 ? (
            <IconButton
              sx={{ marginLeft: "20px", padding: "0px", width: "20px" }}
              onClick={() => removeEventLocationDate(eventLocationDateIndex)}
            >
              <FaTrash size={20} />
            </IconButton>
          ) : (
            <Box
              sx={{
                marginLeft: "20px",
                width: "20px",
                height: "30px",
                flexShrink: 0,
              }}
            ></Box>
          )}
        </Box>
      ))}
    </>
  );
};
