import { Switch, SwitchProps } from '@mui/material';
import { ReactElement, useId } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';

type Props<T extends FieldValues> = { name: FieldPath<T>; control: Control<T, any> } & Omit<SwitchProps, 'name'>;

export const SwitchRHF = <T extends FieldValues>(props: Props<T>): ReactElement => {
  const { name, control, ...attr } = props;

  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, ...fieldRest } }) => <Switch {...fieldRest} id={id} checked={value} {...attr} />}
    />
  );
};
