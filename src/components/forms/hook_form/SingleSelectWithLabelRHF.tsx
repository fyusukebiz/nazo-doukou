import { useIsMobileContext } from '@/features/common/IsMobileProvider';
import { Box, FormControl, SxProps } from '@mui/material';
import React, { ComponentPropsWithoutRef, useId } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import Select, { SingleValue } from 'react-select';

// 今後　MUI Autocompoleteは使用しない
// 理由：モバイル表示の時に、キーボードを非表示にする手段がないため

// onChangeで、RFHのには選択された{ value: value, label: label})がセットされる

// ドロップダウンのベースの型
type Option = { label: string; value: unknown };

type Props<T extends FieldValues, U extends Option = Option> = Omit<
  ComponentPropsWithoutRef<typeof Select<U, false>>,
  'name' | 'isMulti'
> & {
  name: FieldPath<T>;
  control: Control<T, any>;
  label: string;
  labelSxProps?: SxProps;
  AfterChange?: (e: SingleValue<U>) => void;
};

export const SingleSelectWithLabelRHF = <T extends FieldValues, U extends Option = Option>(props: Props<T, U>) => {
  const { name, control, options, label, labelSxProps, AfterChange, ...attr } = props;
  const id = useId();
  const { isMobileOrTablet } = useIsMobileContext();

  // インクリメンタルサーチについて
  // デフォルトでは label フィールドが表示対象、 value フィールドが検索対象
  // labelで検索できるようにしたいのでgetOptionValueを使って検索対象をいじる

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, name, ref }, fieldState }) => (
        <FormControl fullWidth error={fieldState.invalid}>
          <Box component='label' htmlFor={id} sx={{ marginBottom: '8px', fontWeight: 'bold', ...labelSxProps }}>
            {label}
          </Box>
          <Select<U, false>
            ref={ref}
            instanceId={id}
            name={name}
            options={options}
            value={value}
            onChange={(e) => {
              if (AfterChange) AfterChange(e); // 選択した直後にデータを更新する機能が必要であった時使用
              onChange(e);
            }}
            onBlur={onBlur}
            isMulti={false}
            components={{ IndicatorSeparator: undefined }}
            isSearchable={!isMobileOrTablet}
            isClearable={true}
            styles={{
              container: (provided: object) => ({
                ...provided,
                width: '100%',
              }),
              control: (provided: object) => ({
                ...provided,
                height: '48px',
              }),
              menuPortal: (base) => ({ ...base, zIndex: 5 }),
            }}
            menuPosition={'fixed'}
            noOptionsMessage={() => '選択肢がありません'}
            getOptionValue={(option) => option.label}
            {...attr}
          />
        </FormControl>
      )}
    />
  );
};
