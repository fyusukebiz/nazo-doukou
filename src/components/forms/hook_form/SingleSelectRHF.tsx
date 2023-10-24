import { useIsMobileContext } from '@/features/common/IsMobileProvider';
import React, { ComponentPropsWithoutRef, ReactNode, useId } from 'react';
import { Control, Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
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
  AfterChange?: (e: SingleValue<U>) => void;
};

export const SingleSelectRHF = <T extends FieldValues, U extends Option = Option>(props: Props<T, U>) => {
  const { name, control, options, AfterChange, ...attr } = props;
  const uid = useId();
  const { isMobileOrTablet } = useIsMobileContext();

  // インクリメンタルサーチについて
  // デフォルトでは label フィールドが表示対象、 value フィールドが検索対象
  // labelで検索できるようにしたいのでgetOptionValueを使って検索対象をいじる

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, name, ref } }) => (
        <Select<U, false>
          ref={ref}
          instanceId={uid}
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
              minHeight: '48px',
              height: '48px',
            }),
            menuPortal: (base) => ({ ...base, zIndex: 5 }),
            valueContainer: (provided: object) => ({
              ...provided,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
              // padding: '2px',
              height: '48px',
            }),
            multiValue: (provided: object) => ({
              ...provided,
              fontSize: '16px',
            }),
            multiValueRemove: (provided: object) => ({
              ...provided,
              minHeight: '48px',
              svg: { height: '20px', width: '20px', color: 'grey' },
              ':hover': {
                backgroundColor: 'transparent',
              },
            }),
          }}
          menuPosition={'fixed'}
          noOptionsMessage={() => '選択肢がありません'}
          getOptionValue={(option) => option.label}
          {...attr}
        />
      )}
    />
  );
};
