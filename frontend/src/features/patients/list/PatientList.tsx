import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDisclosure } from '@mantine/hooks';
import {
  Container,
  Stack,
  Group,
  Title,
  Button,
  Card,
  Table,
  Avatar,
  Text,
  Badge,
  ActionIcon,
  Alert,
  Skeleton,
  Breadcrumbs,
  Anchor,
  Modal,
} from '@mantine/core';
import { IconEye, IconAlertCircle, IconEdit, IconTrash } from '@tabler/icons-react';
import { usePatientList } from './hooks/usePatientList';
import { CreatePatientDrawer } from '../create/CreatePatientDrawer';
import { EditPatientDrawer } from '../create/EditPatientDrawer';
import { Paginator } from '../../../shared/components';
import { patientService } from '../application/patient.service';
import type { PatientGender } from '../domain/Patient.types';
import type { Patient } from '../domain/Patient.types';

const genderColor: Record<PatientGender, string> = {
  M: 'blue',
  F: 'pink',
  O: 'gray',
};

const genderLabel: Record<PatientGender, string> = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};

export function PatientList() {
  const navigate = useNavigate();
  const { patients, isLoading, error, page, setPage, pageSize, refetch, hasClinic } =
    usePatientList();

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editDrawerOpened, { open: openEditDrawer, close: closeEditDrawer }] =
    useDisclosure(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    openEditDrawer();
  };

  const handleDeleteClick = (patientId: string) => {
    setDeletingPatientId(patientId);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatientId) return;

    setIsDeleting(true);
    try {
      await patientService.deactivate(deletingPatientId);
      refetch();
      closeDeleteModal();
      setDeletingPatientId(null);
    } catch (error) {
      console.error('Error deactivating patient:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate({ to: '/backoffice/dashboard' })}>Dashboard</Anchor>
          <span>Pacientes</span>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={1}>Pacientes</Title>
          <Button onClick={openDrawer} disabled={!hasClinic}>
            + Nuevo Paciente
          </Button>
        </Group>

        {/* Clinic selector alert */}
        {!hasClinic && (
          <Alert icon={<IconAlertCircle />} color="yellow">
            Selecciona una clínica en el menú superior para ver y crear pacientes.
          </Alert>
        )}

        {/* Error alert */}
        {error && (
          <Alert icon={<IconAlertCircle />} color="red">
            {error}
          </Alert>
        )}

        {/* Patients table */}
        {hasClinic && (
          <Card withBorder>
            {isLoading ? (
              <Stack gap="md">
                <Skeleton height={50} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : patients.length === 0 ? (
              <Text ta="center" py="xl" c="dimmed">
                No hay pacientes registrados aún
              </Text>
            ) : (
              <>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Paciente</Table.Th>
                      <Table.Th>Contacto</Table.Th>
                      <Table.Th>Edad</Table.Th>
                      <Table.Th>Género</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {patients.map((patient) => (
                      <Table.Tr key={patient.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar name={patient.fullName} color="blue" radius="xl" size="md" />
                            <div>
                              <Text fw={500} size="sm">
                                {patient.fullName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {patient.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm">{patient.phone}</Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.age} años</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={genderColor[patient.gender]} size="sm">
                            {genderLabel[patient.gender]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={patient.isActive ? 'green' : 'gray'}
                            variant={patient.isActive ? 'light' : 'outline'}
                            size="sm"
                          >
                            {patient.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="blue"
                              style={{ cursor: 'pointer' }}
                              title="Ver detalle"
                              onClick={() => {
                                navigate({
                                  to: '/backoffice/patients/$patientId',
                                  params: { patientId: patient.id },
                                });
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>

                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="yellow"
                              style={{ cursor: 'pointer' }}
                              title="Editar"
                              onClick={() => handleEditClick(patient)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>

                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              style={{ cursor: 'pointer' }}
                              title="Eliminar"
                              onClick={() => handleDeleteClick(patient.id)}
                              disabled={!patient.isActive}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {/* Pagination */}
                <Paginator
                  currentPage={page}
                  onPageChange={setPage}
                  itemsCount={patients.length}
                  pageSize={pageSize}
                />
              </>
            )}
          </Card>
        )}
      </Stack>

      <CreatePatientDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        onSuccess={() => {
          refetch();
          closeDrawer();
        }}
      />

      {editingPatient && (
        <EditPatientDrawer
          opened={editDrawerOpened}
          onClose={closeEditDrawer}
          patient={editingPatient}
          onSuccess={() => {
            refetch();
            closeEditDrawer();
            setEditingPatient(null);
          }}
        />
      )}

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirmar eliminación"
        centered
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de que deseas deactivar este paciente? Se marcará como inactivo y no
            aparecerá en la lista.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Sí, deactivar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
