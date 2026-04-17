import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Group, Checkbox } from '@mantine/core';
import { IconAlertCircle, IconMailCheck, IconLockCheck, IconAlertSmall } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { useAuthStore } from '../infrastructure/store/auth.store';
import { useLogin, REMEMBER_EMAIL_KEY } from './hooks/useLogin';
import { ROUTES } from '../../../shared/constants/routes';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { form, handleSubmit, isLoading, serverError } = useLogin();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rememberMe, setRememberMe] = useState(
    () => typeof localStorage !== 'undefined' && !!localStorage.getItem(REMEMBER_EMAIL_KEY)
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: ROUTES.BACKOFFICE.DASHBOARD });
    }
  }, [isAuthenticated]);

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const emailError = touched.email ? form.errors.email : undefined;
  const passwordError = touched.password ? form.errors.password : undefined;

  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Title order={1} fw={700} ta="center" size={32} mb="xs">
              OdontoSuite
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Inicia sesión en tu cuenta
            </Text>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              title="Error en la autenticación"
              variant="light"
              radius="md"
              styles={{
                title: { fontWeight: 600 },
              }}
            >
              {serverError}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={form.onSubmit((values) => handleSubmit(rememberMe)(values))}>
            <Stack gap="md">
              {/* Email Input */}
              <div>
                <TextInput
                  label="Email"
                  placeholder="tu@email.com"
                  type="email"
                  autoComplete="email"
                  leftSection={<IconMailCheck size={18} />}
                  onBlur={() => handleBlur('email')}
                  styles={{
                    input: {
                      borderColor: emailError ? '#fa5252' : undefined,
                    },
                  }}
                  {...form.getInputProps('email')}
                />
                {emailError && touched.email && (
                  <Group gap={4} mt={6}>
                    <IconAlertSmall size={16} color="#fa5252" style={{ flexShrink: 0 }} />
                    <Text size="xs" c="red" fw={500}>
                      {emailError}
                    </Text>
                  </Group>
                )}
              </div>

              {/* Password Input */}
              <div>
                <PasswordInput
                  label="Contraseña"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="current-password"
                  leftSection={<IconLockCheck size={18} />}
                  onBlur={() => handleBlur('password')}
                  styles={{
                    input: {
                      borderColor: passwordError ? '#fa5252' : undefined,
                    },
                  }}
                  {...form.getInputProps('password')}
                />
                {passwordError && touched.password && (
                  <Group gap={4} mt={6}>
                    <IconAlertSmall size={16} color="#fa5252" style={{ flexShrink: 0 }} />
                    <Text size="xs" c="red" fw={500}>
                      {passwordError}
                    </Text>
                  </Group>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <Checkbox
                label="Recordar este usuario"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.currentTarget.checked)}
                size="sm"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                size="md"
                fw={600}
                mt="sm"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </Stack>
          </form>

          {/* Register Link */}
          <Group justify="center">
            <Text size="sm" c="dimmed">
              ¿No tienes cuenta?{' '}
              <Button
                variant="subtle"
                size="xs"
                p={0}
                fw={600}
                onClick={() => navigate({ to: ROUTES.AUTH.REGISTER })}
              >
                Regístrate aquí
              </Button>
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
