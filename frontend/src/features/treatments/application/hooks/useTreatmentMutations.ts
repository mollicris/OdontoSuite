import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { treatmentService } from '../treatment.service';
import type { CreateTreatmentRequest, UpdateTreatmentRequest } from '../../domain/Treatment.request';
import type { TreatmentStatus } from '../../domain/Treatment.types';

export function useTreatmentMutations(patientId?: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (req: CreateTreatmentRequest) => treatmentService.create(req),
    onSuccess: () => {
      notifications.show({
        title: 'Éxito',
        message: 'Tratamiento creado correctamente',
        color: 'green',
      });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'No se pudo crear el tratamiento',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateTreatmentRequest }) =>
      treatmentService.update(id, req),
    onSuccess: () => {
      notifications.show({
        title: 'Éxito',
        message: 'Tratamiento actualizado correctamente',
        color: 'green',
      });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'No se pudo actualizar el tratamiento',
        color: 'red',
      });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TreatmentStatus }) =>
      treatmentService.changeStatus(id, status),
    onSuccess: () => {
      notifications.show({
        title: 'Éxito',
        message: 'Estado del tratamiento actualizado',
        color: 'green',
      });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'No se pudo cambiar el estado',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => treatmentService.delete(id),
    onSuccess: () => {
      notifications.show({
        title: 'Éxito',
        message: 'Tratamiento cancelado correctamente',
        color: 'green',
      });
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });
      }
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'No se pudo cancelar el tratamiento',
        color: 'red',
      });
    },
  });

  return {
    create: createMutation.mutateAsync,
    createLoading: createMutation.isPending,
    update: updateMutation.mutateAsync,
    updateLoading: updateMutation.isPending,
    changeStatus: changeStatusMutation.mutateAsync,
    changeStatusLoading: changeStatusMutation.isPending,
    delete: deleteMutation.mutateAsync,
    deleteLoading: deleteMutation.isPending,
  };
}
