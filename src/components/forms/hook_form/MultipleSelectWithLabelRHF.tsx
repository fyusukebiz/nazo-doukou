import React, { ComponentPropsWithoutRef, useId } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import Select, { MultiValue } from "react-select";
import { useIsMobileContext } from "@/features/common/IsMobileProvider";
import { Box, FormControl, SxProps } from "@mui/material";

// 今後　MUI Autocompoleteは使用しない
// 理由：モバイル表示の時に、キーボードを非表示にする手段がないため

// onChangeで、RHFのには選択された{ value: value, label: label }の配列がセットされる

// ドロップダウンの型
type Option = { label: string; value: unknown };

type Props<T extends FieldValues, U extends Option = Option> = Omit<
  ComponentPropsWithoutRef<typeof Select<U, true>>,
  "name" | "isMulti"
> & {
  name: FieldPath<T>;
  control: Control<T, any>;
  options: MultiValue<U> | undefined;
  label?: string;
  labelSxProps?: SxProps;
};

export const MultipleSelectWithLabelRHF = <
  T extends FieldValues,
  U extends Option = Option
>(
  props: Props<T, U>
) => {
  const { name, control, options, label, labelSxProps, ...attr } = props;
  const id = useId();
  const { isMobileOrTablet } = useIsMobileContext();

  // インクリメンタルサーチについて
  // デフォルトでは label フィールドが表示対象、 value フィールドが検索対象
  // labelで検索できるようにしたいのでgetOptionValueを使って検索対象をいじる

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState,
      }) => (
        <FormControl fullWidth error={fieldState.invalid}>
          {label && (
            <Box
              component="label"
              htmlFor={id}
              sx={{ marginBottom: "8px", fontWeight: "bold", ...labelSxProps }}
            >
              {label}
            </Box>
          )}
          <Select<U, true>
            ref={ref}
            instanceId={id}
            name={name}
            options={options}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isMulti={true}
            components={{ IndicatorSeparator: undefined }}
            isSearchable={!isMobileOrTablet}
            styles={{
              container: (provided: object) => ({
                ...provided,
                width: "100%",
              }),
              control: (provided: object) => ({
                ...provided,
                height: "48px",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 5 }),
              valueContainer: (provided: object) => ({
                ...provided,
                display: "flex",
                alignItems: "center",
                flexWrap: "nowrap",
                padding: "2px",
              }),
              multiValue: (provided: object) => ({
                ...provided,
                fontSize: "18px",
              }),
              multiValueRemove: (provided: object) => ({
                ...provided,
                ":hover": {
                  backgroundColor: "transparent",
                },
              }),
              placeholder: (provided: object) => ({
                ...provided,
                marginLeft: "8px",
              }),
            }}
            isClearable={false}
            menuPosition={"fixed"}
            noOptionsMessage={() => "選択肢がありません"}
            getOptionValue={(option) => option.label}
            {...attr}
          />
        </FormControl>
      )}
    />
  );
};
