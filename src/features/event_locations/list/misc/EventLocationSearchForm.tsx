import { Box, Grid } from "@mui/material";
import React from "react";
import {
  EventLocationSearchFormSchema,
  useEventLocationSearchFormContext,
} from "./EventLocationSearchFormProvider";
import { InputWithLabelRHF } from "@/components/forms/hook_form/InputWithLabelRHF";
import { MultipleSelectWithLabelRHF } from "@/components/forms/hook_form/MultipleSelectWithLabelRHF";
import { DatePickerWithLabelRHF } from "@/components/forms/hook_form/DatePickerRHFWithLabel";
import { BiCalendar } from "react-icons/bi";

type Props = {
  gameTypeOpts: { value: string; label: string }[];
  locationOpts: { value: string; label: string }[];
  onSubmit: () => void;
};

export const EventLocationSearchForm = (props: Props) => {
  const { gameTypeOpts, locationOpts, onSubmit } = props;
  const { handleSubmit, control } = useEventLocationSearchFormContext();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing="24px" sx={{ height: "100%" }}>
        <Grid item xs={12}>
          <InputWithLabelRHF<EventLocationSearchFormSchema>
            name="eventName"
            label="イベント名"
            control={control}
            placeholder="イベント名"
          />
        </Grid>
        <Grid item xs={12}>
          <MultipleSelectWithLabelRHF<
            EventLocationSearchFormSchema,
            { label: string; value: string }
          >
            name="gameTypes"
            label="種類"
            control={control}
            placeholder="種類"
            options={gameTypeOpts}
          />
        </Grid>
        <Grid item xs={12}>
          <MultipleSelectWithLabelRHF<
            EventLocationSearchFormSchema,
            { label: string; value: string }
          >
            name="locations"
            label="エリア"
            control={control}
            placeholder="エリア"
            options={locationOpts}
          />
        </Grid>
        <Grid item xs={12}>
          <DatePickerWithLabelRHF<EventLocationSearchFormSchema>
            name="selectedDate"
            label="日付"
            control={control}
            placeholder="日付"
            isClearable
            endIcon={<BiCalendar size={30} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
