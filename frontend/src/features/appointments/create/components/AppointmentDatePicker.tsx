import { DateInput } from '@mantine/dates';

interface AppointmentDatePickerProps {
  readonly value: Date;
  readonly onChange: (date: Date) => void;
}

export function AppointmentDatePicker({ value, onChange }: AppointmentDatePickerProps) {
  return (
    <DateInput
      label="Fecha"
      placeholder="Selecciona una fecha"
      valueFormat="DD/MM/YYYY"
      size="xs"
      value={value}
      onChange={(date: unknown) => {
        if (date) {
          onChange(date as unknown as Date);
        }
      }}
      clearable
      highlightToday
    />
  );
}
