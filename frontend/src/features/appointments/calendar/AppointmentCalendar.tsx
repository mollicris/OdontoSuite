import { Stack, Card, Divider, Group, Button, Text, Grid } from '@mantine/core';
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

  return (
    <Card withBorder p="md" style={{ position: 'sticky', top: 0 }}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Button size="xs" variant="subtle" onClick={handlePrevMonth}>
            &lt;
          </Button>
          <Text fw={600} size="sm" style={{ minWidth: 120 }} ta="center">
            {monthName}
          </Text>
          <Button size="xs" variant="subtle" onClick={handleNextMonth}>
            &gt;
          </Button>
        </Group>

        <Grid gap={4}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((dayName) => (
            <Grid.Col key={dayName} span={Math.floor(12 / 7)}>
              <Text size="xs" fw={600} ta="center" c="dimmed">
                {dayName}
              </Text>
            </Grid.Col>
          ))}

          {days.map((day, idx) => {
            const dayKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day ?? `empty-${idx}`}`;
            const isSelected =
              day &&
              day === selectedDate.getDate() &&
              selectedDate.getMonth() === new Date().getMonth();

            return (
              <Grid.Col key={dayKey} span={Math.floor(12 / 7)}>
                {day ? (
                  <Button
                    size="xs"
                    variant={isSelected ? 'light' : 'subtle'}
                    color={isSelected ? 'blue' : 'gray'}
                    fullWidth
                    onClick={() => handleSelectDay(day)}
                    p={0}
                    h={28}
                  >
                    {day}
                  </Button>
                ) : (
                  <div />
                )}
              </Grid.Col>
            );
          })}
        </Grid>

        <Divider />

        <AppointmentStatusLegend />
      </Stack>
    </Card>
  );
}
