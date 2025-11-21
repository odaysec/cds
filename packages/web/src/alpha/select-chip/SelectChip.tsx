import React, { forwardRef, memo, useMemo } from 'react';

import type { ChipBaseProps } from '../../chips';
import { MediaChip } from '../../chips/MediaChip';
import { AnimatedCaret } from '../../motion/AnimatedCaret';
import type {
  SelectControlProps,
  SelectOption,
  SelectOptionGroup,
  SelectProps,
  SelectRef,
  SelectType,
} from '../select/Select';
import { Select } from '../select/Select';
/**
 * Chip-styled Select control built on top of the Alpha Select.
 * Supports both single and multi selection via Select's `type` prop.
 */
export type SelectChipProps<
  Type extends SelectType = 'single',
  SelectOptionValue extends string = string,
> = Omit<
  SelectProps<Type, SelectOptionValue>,
  | 'SelectControlComponent'
  | 'styles'
  | 'classNames'
  | 'label'
  | 'helperText'
  | 'labelVariant'
  | 'variant'
>;

type SelectChipControlBase = <Type extends SelectType, SelectOptionValue extends string = string>(
  props: SelectControlProps<Type, SelectOptionValue> &
    Pick<ChipBaseProps, 'invertColorScheme' | 'compact' | 'numberOfLines'> & {
      ref?: React.Ref<HTMLElement>;
    },
) => React.ReactElement;

const SelectChipControlComponent = memo(
  forwardRef(
    <Type extends SelectType, SelectOptionValue extends string = string>(
      {
        type,
        options,
        value,
        placeholder,
        setOpen,
        startNode,
        endNode: customEndNode,
        open,
        accessibilityLabel,
        ariaHaspopup,
        className,
        style,
        maxSelectedOptionsToShow = 2,
        hiddenSelectedOptionsLabel = 'more',
        label,
        compact,
        disabled,
      }: SelectControlProps<Type, SelectOptionValue>,
      ref: React.Ref<SelectRef>,
    ) => {
      const isMultiSelect = type === 'multi';
      const hasValue = value !== null && !(Array.isArray(value) && value.length === 0);

      // Flatten options to handle nested groups
      const flatOptions = useMemo(() => {
        const result: SelectOption[] = [];
        options.forEach((option) => {
          if ('options' in option && Array.isArray(option.options) && 'label' in option) {
            // It's a group, add all its options
            result.push(...(option as SelectOptionGroup).options);
          } else {
            // It's a single option
            result.push(option as SelectOption);
          }
        });
        return result;
      }, [options]);

      const labelContent = useMemo(() => {
        if (!hasValue) return label ?? placeholder ?? null;

        if (isMultiSelect) {
          const values = value as string[];
          const visible = values.slice(0, maxSelectedOptionsToShow);
          const labels = visible
            .map((v) => {
              const opt = flatOptions.find((o) => o.value === v);
              return opt?.label ?? opt?.description ?? opt?.value ?? '';
            })
            .filter(Boolean);
          const hiddenCount = values.length - visible.length;
          return hiddenCount > 0
            ? `${labels.join(', ')} +${hiddenCount} ${hiddenSelectedOptionsLabel}`
            : labels.join(', ');
        }

        const opt = flatOptions.find((o) => o.value === value);
        return opt?.label ?? opt?.description ?? opt?.value ?? placeholder ?? null;
      }, [
        hasValue,
        label,
        placeholder,
        isMultiSelect,
        flatOptions,
        value,
        maxSelectedOptionsToShow,
        hiddenSelectedOptionsLabel,
      ]);

      return (
        <MediaChip
          ref={ref as React.Ref<HTMLButtonElement>}
          noScaleOnPress
          accessibilityLabel={accessibilityLabel}
          aria-haspopup={ariaHaspopup ?? 'listbox'}
          className={className}
          compact={compact}
          disabled={disabled}
          end={
            customEndNode ?? <AnimatedCaret active color="fg" rotate={open ? 0 : 180} size="xs" />
          }
          invertColorScheme={hasValue}
          onClick={() => setOpen((s) => !s)}
          start={startNode}
          style={style}
        >
          {labelContent}
        </MediaChip>
      );
    },
  ),
);

const SelectChipControl = SelectChipControlComponent as SelectChipControlBase;

const SelectChipBase = memo(
  forwardRef(
    <Type extends SelectType = 'single', SelectOptionValue extends string = string>(
      props: SelectChipProps<Type, SelectOptionValue>,
      ref: React.Ref<SelectRef>,
    ) => {
      // Note: `active` maps to the chip's inverted color scheme.
      // We achieve this by passing it through styles/classNames via the control.
      return (
        <Select<Type, SelectOptionValue>
          ref={ref}
          SelectControlComponent={SelectChipControl}
          styles={{
            dropdown: {
              width: 'max-content',
            },
          }}
          {...(props as SelectProps<Type, SelectOptionValue>)}
        />
      );
    },
  ),
);

SelectChipBase.displayName = 'SelectChip';

export const SelectChip = SelectChipBase as <
  Type extends SelectType = 'single',
  SelectOptionValue extends string = string,
>(
  props: SelectChipProps<Type, SelectOptionValue> & { ref?: React.Ref<HTMLElement> },
) => React.ReactElement;
