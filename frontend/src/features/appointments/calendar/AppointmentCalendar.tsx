import { Stack, Card, Divider, Button, Text, Modal, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAppointmentStore } from '../infrastructure/store/appointment.store';
import { getTodayDate } from '../infrastructure/utils/dateUtils';
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

  const today = getTodayDate();

  return (
    <>
      <Card withBorder p="sm" style={{ position: 'sticky', top: 0, width: '100%' }}>
        <Stack gap="sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Button size="xs" variant="subtle" onClick={handlePrevMonth} p={0} style={{ width: 24, height: 24, fontSize: 16, lineHeight: 1 }}>
              ‹
            </Button>
            <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={openYearModal}>
              <Text fw={700} size="sm" ta="center" style={{ textTransform: 'capitalize', marginBottom: 4 }}>
                {monthName}
              </Text>
              <Text fw={600} size="md" ta="center" c="blue">
                {year}
              </Text>
            </div>
            <Button size="xs" variant="subtle" onClick={handleNextMonth} p={0} style={{ width: 24, height: 24, fontSize: 16, lineHeight: 1 }}>
              ›
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, width: '100%' }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map((dayName) => (
              <div key={dayName} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 28, paddingBottom: 4, borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Text size="xs" fw={600} ta="center" c="dimmed">
                  {dayName}
                </Text>
              </div>
            ))}

            {days.map((day, idx) => {
              const dayKey = day ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}` : `empty-${idx}`;
              const dayDate = day ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day) : null;
              const isSelected = dayDate?.toDateString() === selectedDate.toDateString();
              const isToday = dayDate?.toDateString() === today.toDateString();

              return (
                <div key={dayKey} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 32 }}>
                  {day ? (
                    <Button
                      size="xs"
                      variant={isSelected ? 'filled' : isToday ? 'light' : 'subtle'}
                      color={isSelected ? 'blue' : isToday ? 'blue' : 'gray'}
                      onClick={() => handleSelectDay(day)}
                      style={{ width: 28, height: 28, padding: 0, fontSize: 12 }}
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
