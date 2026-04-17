import { useState } from 'react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { authService } from '../../application/auth.service';
import type { LoginRequest } from '../../domain/Auth.request';

export const REMEMBER_EMAIL_KEY = 'rememberEmail';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El email es requerido' })
    .email({ message: 'Email inválido' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña es requerida' })
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Cargar email guardado si existe
  const savedEmail = typeof globalThis !== 'undefined' && globalThis.localStorage
    ? localStorage.getItem(REMEMBER_EMAIL_KEY)
    : null;

  const form = useForm<LoginRequest>({
    initialValues: {
      email: savedEmail || '',
      password: '',
    },
    validate: (values) => {
      try {
        loginSchema.parse(values);
        return {};
      } catch (error: any) {
        const fieldErrors: Record<string, string> = {};
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
        }
        return fieldErrors;
      }
    },
  });

  const handleSubmit = (rememberMe: boolean) => {
    return async (values: LoginRequest) => {
      setIsLoading(true);
      setServerError(null);

      try {
        // Guardar email si "Recordar" está marcado
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }

        await authService.login(values);
        form.reset();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Credenciales inválidas. Verifica tu email y contraseña.';

        const errorMessage = Array.isArray(message) ? message.join(', ') : message;

        // Mapear errores del servidor a campos específicos
        const errorLower = errorMessage.toLowerCase();

        if (errorLower.includes('password') || errorLower.includes('contraseña')) {
          form.setFieldError('password', 'Contraseña incorrecta');
        } else if (errorLower.includes('email') || errorLower.includes('usuario') || errorLower.includes('not found') || errorLower.includes('no encontrado')) {
          form.setFieldError('email', 'Email no registrado');
        } else {
          setServerError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };
  };

  return {
    form,
    handleSubmit,
    isLoading,
    serverError,
    REMEMBER_EMAIL_KEY,
  };
}
