import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Stack,
  Card,
  Group,
  Avatar,
  Title,
  Badge,
  Text,
  Grid,
  Alert,
  Skeleton,
  Breadcrumbs,
  Anchor,
  Button,
} from '@mantine/core';
import { IconAlertCircle, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { usePatientDetail } from './hooks/usePatientDetail';
import type { PatientGender } from '../domain/Patient.types';

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

export function PatientDetail() {
  const navigate = useNavigate();
  const { patientId } = useParams({ from: '/backoffice/patients/$patientId' });

  console.log('PatientDetail mounted with patientId:', patientId);

  const { patient, isLoading, error } = usePatientDetail(patientId || '');

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle />} color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate({ to: '/backoffice/dashboard' })}>Dashboard</Anchor>
          <Anchor onClick={() => navigate({ to: '/backoffice/patients' })}>Pacientes</Anchor>
          <span>{isLoading ? 'Cargando...' : patient?.fullName || 'Paciente'}</span>
        </Breadcrumbs>

        {isLoading ? (
          <Skeleton height={200} />
        ) : patient ? (
          <>
            {/* Header Card */}
            <Card withBorder>
              <Group>
                <Avatar
                  name={patient.fullName}
                  color="blue"
                  radius="xl"
                  size="xl"
                />
                <div style={{ flex: 1 }}>
                  <Title order={2}>{patient.fullName}</Title>
                  <Group gap="xs" mt="xs">
                    <Badge color={patient.isActive ? 'green' : 'gray'}>
                      {patient.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge color={genderColor[patient.gender]} variant="outline">
                      {genderLabel[patient.gender]}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {patient.age} años
                    </Text>
                  </Group>
                </div>
                <Button variant="outline" onClick={() => navigate({ to: '/backoffice/patients' })}>
                  ← Volver
                </Button>
              </Group>
            </Card>

            {/* Details Grid */}
            <Grid>
              {/* Contact Information */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder>
                  <Title order={4} mb="md">
                    Datos de Contacto
                  </Title>
                  <Stack gap="sm">
                    <Group gap="sm">
                      <IconMail size={18} />
                      <div>
                        <Text size="sm" c="dimmed">
                          Email
                        </Text>
                        <Text size="sm">{patient.email}</Text>
                      </div>
                    </Group>
                    <Group gap="sm">
                      <IconPhone size={18} />
                      <div>
                        <Text size="sm" c="dimmed">
                          Teléfono
                        </Text>
                        <Text size="sm">{patient.phone}</Text>
                      </div>
                    </Group>
                    {patient.address && (
                      <Group gap="sm">
                        <IconMapPin size={18} />
                        <div>
                          <Text size="sm" c="dimmed">
                            Dirección
                          </Text>
                          <Text size="sm">
                            {patient.address}
                            {patient.city && `, ${patient.city}`}
                            {patient.state && `, ${patient.state}`}
                          </Text>
                        </div>
                      </Group>
                    )}
                    {patient.emergencyContact && (
                      <Group gap="sm">
                        <div>
                          <Text size="sm" c="dimmed">
                            Contacto de Emergencia
                          </Text>
                          <Text size="sm">{patient.emergencyContact}</Text>
                          {patient.emergencyPhone && (
                            <Text size="xs" c="dimmed">
                              {patient.emergencyPhone}
                            </Text>
                          )}
                        </div>
                      </Group>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>

              {/* Medical Information */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder>
                  <Title order={4} mb="md">
                    Información Médica
                  </Title>
                  <Stack gap="md">
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Alergias
                        </Text>
                        <Group gap="xs">
                          {patient.allergies.map((allergy) => (
                            <Badge key={allergy} color="red" variant="light">
                              {allergy}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}

                    {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                      <div>
                        <Text size="sm" fw={500} mb="xs">
                          Condiciones Médicas
                        </Text>
                        <Group gap="xs">
                          {patient.medicalConditions.map((condition) => (
                            <Badge key={condition} color="orange" variant="light">
                              {condition}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}

                    {patient.insuranceProvider && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Seguro Médico
                        </Text>
                        <Text size="sm">{patient.insuranceProvider}</Text>
                      </div>
                    )}

                    {patient.notes && (
                      <div>
                        <Text size="sm" c="dimmed">
                          Notas
                        </Text>
                        <Text size="sm">{patient.notes}</Text>
                      </div>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Additional Information */}
            {patient.cpf && (
              <Card withBorder>
                <Group>
                  <div>
                    <Text size="sm" c="dimmed">
                      CPF / Documento
                    </Text>
                    <Text size="sm">{patient.cpf}</Text>
                  </div>
                </Group>
              </Card>
            )}
          </>
        ) : (
          <Alert icon={<IconAlertCircle />} color="red">
            Paciente no encontrado
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
