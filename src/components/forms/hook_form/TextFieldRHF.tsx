import { TextField, TextFieldProps } from '@mui/material';
import { ReactElement, useId } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';

type Props<T extends FieldValues> = { name: FieldPath<T>; control: Control<T, any> } & Omit<TextFieldProps, 'name'>;

export const TextFieldRHF = <T extends FieldValues>(props: Props<T>): ReactElement => {
  const { name, control, ...attr } = props;

  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          id={id}
          variant='outlined'
          fullWidth
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          {...attr}
        />
      )}
    />
  );
};
