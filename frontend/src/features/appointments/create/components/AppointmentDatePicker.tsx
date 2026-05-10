import { DateInput } from '@mantine/dates';

interface AppointmentDatePickerProps {
  readonly value: Date | null;
  readonly onChange: (date: Date | null) => void;
}

export function AppointmentDatePicker({ value, onChange }: AppointmentDatePickerProps) {
  const dateValue = value instanceof Date ? value : null;

  const handleChange = (strOrDate: string | Date | null) => {
    if (strOrDate instanceof Date) {
      onChange(strOrDate);
    } else if (typeof strOrDate === 'string' && strOrDate) {
      const parsed = new Date(strOrDate);
      if (!isNaN(parsed.getTime())) {
        onChange(parsed);
      }
    } else {
      onChange(null);
    }
  };

  return (
    <DateInput
      label="Fecha"
      placeholder="Selecciona una fecha"
      valueFormat="DD/MM/YYYY"
      size="xs"
      value={dateValue}
      onChange={handleChange}
      clearable
      highlightToday
    />
  );
}
