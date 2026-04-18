import { Stack, Card, Divider, Button, Text } from '@mantine/core';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { AppointmentStatusLegend } from '../list/components/AppointmentStatusLegend';

export function AppointmentCalendar() {
  const selectedDate = useAppointmentStore((s) => s.selectedDate);
  const setSelectedDate = useAppointmentStore((s) => s.setSelectedDate);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedDate);
  const firstDay = getFirstDayOfMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('es-BO', {
    month: 'long',
    year: 'numeric',
  });

  const days: (number | null)[] = new Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const today = new Date();

  return (
    <Card withBorder p="md" style={{ position: 'sticky', top: 0 }}>
      <Stack gap="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button size="xs" variant="subtle" onClick={handlePrevMonth}>
            &lt;
          </Button>
          <Text fw={600} size="sm" ta="center" style={{ flex: 1 }}>
            {monthName}
          </Text>
          <Button size="xs" variant="subtle" onClick={handleNextMonth}>
            &gt;
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((dayName) => (
            <div key={dayName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Text size="xs" fw={600} ta="center" c="dimmed">
                {dayName}
              </Text>
            </div>
          ))}

          {days.map((day, idx) => {
            const dayKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day ?? `empty-${idx}`}`;
            const dayDate = day ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day) : null;
            const isSelected = dayDate && dayDate.toDateString() === selectedDate.toDateString();
            const isToday = dayDate && dayDate.toDateString() === today.toDateString();

            return (
              <div key={dayKey} style={{ display: 'flex', justifyContent: 'center' }}>
                {day ? (
                  <Button
                    size="xs"
                    variant={isSelected ? 'light' : 'subtle'}
                    color={isSelected ? 'blue' : isToday ? 'gray' : 'gray'}
                    onClick={() => handleSelectDay(day)}
                    style={{ width: 32, height: 32, padding: 0 }}
                  >
                    <Text size="xs">{day}</Text>
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>

        <Divider />

        <AppointmentStatusLegend />
      </Stack>
    </Card>
  );
}
