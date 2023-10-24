import { FormControl, OutlinedInput, InputProps, FormHelperText, Box, SxProps } from '@mui/material';
import { ReactElement, useId } from 'react';
import { Control, Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  control: Control<T, any>;
  labelSxProps?: SxProps;
} & Omit<InputProps, 'name'>;

export const InputWithLabelRHF = <T extends FieldValues>(props: Props<T>): ReactElement => {
  const { name, label, control, labelSxProps, inputProps, sx, ...attr } = props;
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth error={fieldState.invalid}>
          <Box component='label' htmlFor={id} sx={{ marginBottom: '8px', fontWeight: 'bold', ...labelSxProps }}>
            {label}
          </Box>
          <OutlinedInput
            id={id}
            {...field}
            fullWidth
            sx={{ padding: 0, ...sx }}
            inputProps={{
              style: { padding: '12.5px 14px' },
              ...inputProps,
            }}
            {...attr}
          />
          <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};
