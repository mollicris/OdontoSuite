import { Stack, Card, Divider, Button, Text, Modal, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { AppointmentStatusLegend } from '../list/components/AppointmentStatusLegend';

export function AppointmentCalendar() {
  const [yearModalOpened, { open: openYearModal, close: closeYearModal }] = useDisclosure(false);
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
  });
  const year = selectedDate.getFullYear();

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

  const handleYearChange = (newYear: number | string) => {
    if (newYear && typeof newYear === 'number') {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(newYear);
      setSelectedDate(newDate);
      closeYearModal();
    }
  };

  const today = new Date();

  return (
    <>
      <Card withBorder p="lg" style={{ position: 'sticky', top: 0, width: '100%' }}>
        <Stack gap="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Button size="sm" variant="subtle" onClick={handlePrevMonth} p={4}>
              &lt;
            </Button>
            <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={openYearModal}>
              <Text fw={700} size="sm" ta="center" style={{ textTransform: 'capitalize', marginBottom: 4 }}>
                {monthName}
              </Text>
              <Text fw={600} size="md" ta="center" c="blue">
                {year}
              </Text>
            </div>
            <Button size="sm" variant="subtle" onClick={handleNextMonth} p={4}>
              &gt;
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, width: '100%' }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((dayName) => (
              <div key={dayName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 28 }}>
                <Text size="xs" fw={700} ta="center" c="dimmed">
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
                <div key={dayKey} style={{ display: 'flex', justifyContent: 'center', minHeight: 40 }}>
                  {day ? (
                    <Button
                      size="sm"
                      variant={isSelected ? 'filled' : isToday ? 'light' : 'subtle'}
                      color={isSelected ? 'blue' : isToday ? 'blue' : 'gray'}
                      onClick={() => handleSelectDay(day)}
                      style={{ width: 40, height: 40, padding: 0, fontSize: 13, fontWeight: 500 }}
                    >
                      {day}
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

      <Modal opened={yearModalOpened} onClose={closeYearModal} title="Seleccionar Año" centered>
        <Stack gap="md">
          <NumberInput
            label="Año"
            placeholder="Ingresa el año"
            value={year}
            onChange={handleYearChange}
            min={2000}
            max={2100}
          />
          <Button fullWidth onClick={closeYearModal}>
            Cerrar
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
