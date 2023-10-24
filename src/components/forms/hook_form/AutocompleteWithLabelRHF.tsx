import { Autocomplete, Box, FormControl, SxProps, TextField, TextFieldProps } from '@mui/material';
import { orange } from '@mui/material/colors';
import React, { ReactElement, useId } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { ContainedChip } from '@/components/chips/ContainedChip';

type Option = { readonly value: string | number; readonly label: string; color?: string };

type Props<T extends FieldValues, U extends Option> = {
  name: FieldPath<T>;
  control: Control<T, any>;
  labelSxProps?: SxProps;
  options: readonly U[];
  size?: 'small' | 'medium' | 'large';
} & Omit<TextFieldProps, 'name'>;

// Selectと違い、Autocompleteは選択された値を配列で返す

// 今後　MUI Autocompoleteは使用しない
// 理由：モバイル表示の時に、キーボードを非表示にする手段がないため

export const AutocompleteWithLabelRHF = <T extends FieldValues, U extends Option = Option>(
  props: Props<T, U>,
): ReactElement => {
  const { name, control, options, label, labelSxProps, size = 'medium', ...attr } = props;
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState }) => (
        <FormControl fullWidth error={fieldState.invalid}>
          <Box component='label' htmlFor={id} sx={{ marginBottom: '8px', fontWeight: 'bold', ...labelSxProps }}>
            {label}
          </Box>
          <Autocomplete
            id={id}
            value={value || undefined}
            multiple
            fullWidth
            disableCloseOnSelect
            disableClearable
            size={size}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            onChange={(_event, data) => onChange(data)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                {option.color ? (
                  <ContainedChip label={option.label} sx={{ backgroundColor: option.color }} />
                ) : (
                  option.label
                )}
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <ContainedChip
                  label={option.label}
                  sx={{
                    backgroundColor: option.color ?? orange[700],
                    mr: '3px',
                  }}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => <TextField {...params} variant='outlined' {...attr} />}
          />
        </FormControl>
      )}
    />
  );
};
