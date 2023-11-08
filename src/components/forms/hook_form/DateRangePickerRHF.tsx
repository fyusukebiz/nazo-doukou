import {
  InputAdornment,
  InputAdornmentProps,
  OutlinedInput,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ja from "date-fns";
import React, { ComponentPropsWithoutRef, ReactNode, useId } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { ReactDatepickerCustomHeader } from "./DatePickerRHFWithLabel";

registerLocale("ja", ja);

type Props<T extends FieldValues> = { name: FieldPath<T> } & Omit<
  ComponentPropsWithoutRef<typeof DatePicker>,
  "name" | "onChange" | "placeholderText" | "className"
> & {
    name: FieldPath<T>;
    control: Control<T, any>;
    startIcon?: ReactNode;
    startIconProps?: InputAdornmentProps;
    endIcon?: ReactNode;
    endIconProps?: InputAdornmentProps;
    placeholder?: string;
    color?: string;
    backgroundColor?: string;
    wrapperClassName?: string;
    calendarClassName?: string;
  };

export const DateRangePickerRHF = <T extends FieldValues>(props: Props<T>) => {
  const {
    name,
    control,
    startIcon,
    startIconProps,
    endIcon,
    endIconProps,
    placeholder,
    isClearable,
    wrapperClassName,
    calendarClassName,
  } = props;

  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <DatePicker
          // ref={ref}
          onChange={onChange}
          onBlur={onBlur}
          dateFormat="yyyy/MM/dd"
          selected={value[0]}
          startDate={value[0]}
          endDate={value[1]}
          wrapperClassName={wrapperClassName}
          calendarClassName={calendarClassName}
          locale={ja}
          calendarStartDay={1} // 月曜始まり
          renderCustomHeader={ReactDatepickerCustomHeader}
          selectsRange
          isClearable={isClearable}
          autoComplete="off"
          customInput={
            <OutlinedInput
              ref={ref}
              id={id}
              fullWidth
              inputProps={{
                style: { padding: "12.5px 0px" },
              }}
              sx={{ px: "8px" }}
              placeholder={placeholder}
              startAdornment={
                <InputAdornment
                  position="start"
                  className="react-datepicker-left-icon"
                  color={grey[100]}
                  {...startIconProps}
                >
                  {startIcon}
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment
                  position="end"
                  className="react-datepicker-rigth-icon"
                  color={grey[100]}
                  {...endIconProps}
                >
                  {endIcon}
                </InputAdornment>
              }
            />
          }
        />
      )}
    />
  );
};
