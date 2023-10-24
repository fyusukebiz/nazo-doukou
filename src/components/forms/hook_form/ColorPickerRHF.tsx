import { SwatchesPicker, SwatchesPickerProps } from 'react-color';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = { name: FieldPath<T>; control: Control<T, any> } & SwatchesPickerProps;

export const ColorPickerRHF = <T extends FieldValues>(props: Props<T>) => {
  const { name, control, ...attr } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange } }) => <SwatchesPicker onChange={(value) => onChange(value.hex)} {...attr} />}
    />
  );
};
