import { Group, Pagination, Text } from '@mantine/core';

interface PaginatorProps {
  /**
   * Página actual (1-indexed)
   */
  currentPage: number;

  /**
   * Callback ejecutado cuando el usuario cambia de página
   */
  onPageChange: (page: number) => void;

  /**
   * Cantidad de items en la página actual
   */
  itemsCount: number;

  /**
   * Items por página
   */
  pageSize: number;

  /**
   * Total de items (opcional)
   * Si no se proporciona, usa heurística: muestra paginator si itemsCount >= pageSize
   */
  total?: number;

  /**
   * Mostrar info de items? (ej: "Mostrando 1-10 de 50")
   * @default false
   */
  showInfo?: boolean;

  /**
   * Tamaño del componente Pagination
   * @default "sm"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Radio de los botones
   * @default "md"
   */
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente reutilizable para paginación
 *
 * **Modo MVP (Heurística)**:
 * Si no se proporciona `total`, muestra paginación solo si `itemsCount >= pageSize`
 *
 * **Modo Preciso**:
 * Si se proporciona `total`, calcula correctamente el total de páginas
 *
 * @example
 * ```tsx
 * <Paginator
 *   currentPage={page}
 *   onPageChange={setPage}
 *   itemsCount={patients.length}
 *   pageSize={10}
 *   showInfo
 * />
 * ```
 */
export function Paginator({
  currentPage,
  onPageChange,
  itemsCount,
  pageSize,
  total,
  showInfo = false,
  size = 'sm',
  radius = 'md',
}: PaginatorProps) {
  // Modo 1: Si total está definido, usarlo
  // Modo 2: Si no, usar heurística MVP: mostrar paginador si itemsCount >= pageSize
  const shouldShow = total !== undefined ? total > pageSize : itemsCount >= pageSize;

  if (!shouldShow) {
    return null;
  }

  // Calcular total de páginas
  let totalPages = 1;
  if (total !== undefined) {
    totalPages = Math.ceil(total / pageSize);
  } else {
    // Heurística: si retorna pageSize items, probablemente hay más
    // Suma 1 para permitir navegar a la siguiente (MVP)
    totalPages = Math.ceil(itemsCount / pageSize) + 1;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total || currentPage * pageSize);

  return (
    <Group justify="center" mt="xl" gap="md">
      {showInfo && total && (
        <Text size="sm" c="dimmed">
          Mostrando {startItem}-{endItem} de {total}
        </Text>
      )}

      <Pagination
        value={currentPage}
        onChange={onPageChange}
        size={size}
        radius={radius}
        total={totalPages}
      />
    </Group>
  );
}
