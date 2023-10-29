import {
  Box,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputAdornmentProps,
  InputBaseComponentProps,
  OutlinedInput,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { SxProps } from "@mui/system";
// eslint-disable-next-line import/no-duplicates
import { getMonth, getYear } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import ja from "date-fns/locale/ja";
import React, { ComponentPropsWithoutRef, ReactNode, useId } from "react";
import DatePicker, {
  ReactDatePickerCustomHeaderProps,
  registerLocale,
} from "react-datepicker";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

registerLocale("ja", ja);

/* CustomHeader */
const CustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
}: ReactDatePickerCustomHeaderProps) => (
  <div className="datepicker__header">
    <button
      type="button"
      className="datepicker__button-prev"
      onClick={decreaseMonth}
      style={{ marginRight: "10px" }}
    >
      {"<"}
    </button>
    <span className="datepicker__header-date">
      <span className="datepicker__header-date__year">{getYear(date)}年</span>
      <span className="datepicker__header-date__month">
        {getMonth(date) + 1}月
      </span>
    </span>
    <button
      type="button"
      className="datepicker__button-next"
      onClick={increaseMonth}
      style={{ marginLeft: "10px" }}
    >
      {">"}
    </button>
  </div>
);

type Props<T extends FieldValues> = Omit<
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
  inputProps?: InputBaseComponentProps;
  label: string;
  labelSxProps?: SxProps;
};

export const DatePickerWithLabelRHF = <T extends FieldValues>(
  props: Props<T>
) => {
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
    inputProps,
    minDate,
    label,
    labelSxProps,
  } = props;

  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState }) => (
        <FormControl fullWidth error={fieldState.invalid}>
          <Box
            component="label"
            htmlFor={id}
            sx={{ marginBottom: "8px", fontWeight: "bold", ...labelSxProps }}
          >
            {label}
          </Box>
          <DatePicker
            onChange={onChange}
            onBlur={onBlur}
            onFocus={(e) => e.target.blur()}
            dateFormat="yyyy/MM/dd"
            selected={value}
            isClearable={isClearable}
            wrapperClassName={wrapperClassName}
            calendarClassName={calendarClassName}
            locale={ja}
            calendarStartDay={1} // 月曜始まり
            renderCustomHeader={CustomHeader}
            autoComplete="off"
            minDate={minDate}
            popperProps={{ strategy: "fixed" }}
            customInput={
              <OutlinedInput
                ref={ref}
                id={id}
                fullWidth
                placeholder={placeholder}
                inputProps={{
                  style: { padding: "12.5px 0px" },
                  ...inputProps,
                }}
                sx={{ px: "8px" }}
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
          <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};
