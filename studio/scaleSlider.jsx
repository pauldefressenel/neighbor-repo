import { set } from 'sanity'
import { Flex, Text } from '@sanity/ui'

// A slider for a number field, from options.min to options.max in
// options.step, showing its value beside it. Unset reads as
// options.default.
export function ScaleSlider(props) {
  const { value, onChange, schemaType, elementProps } = props
  const { min = 0.5, max = 1.5, step = 0.05, default: initial = 1 } = schemaType.options ?? {}
  const current = value ?? initial
  return (
    <Flex align="center" gap={3}>
      <input
        {...elementProps}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(set(Number(e.currentTarget.value)))}
        style={{ flex: 1 }}
      />
      <Text size={1} style={{ width: '3em', textAlign: 'right' }}>{current.toFixed(2)}</Text>
    </Flex>
  )
}
