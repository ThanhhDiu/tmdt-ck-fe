import type { NavigateFunction } from 'react-router-dom';

export const buildProviderProfilePath = (technicianId: string): string =>
  `/provider-profile?id=${encodeURIComponent(technicianId)}`;

export const navigateToProviderProfile = (
  navigate: NavigateFunction,
  technicianId: string,
  preview?: Record<string, unknown>
): void => {
  navigate(buildProviderProfilePath(technicianId), {
    state: { id: technicianId, ...preview },
  });
};

export const resolveTechnicianIdFromLocation = (
  searchParams: URLSearchParams,
  state: unknown
): string | null => {
  const fromQuery = searchParams.get('id')?.trim();
  if (fromQuery) return fromQuery;

  if (!state || typeof state !== 'object') return null;
  const record = state as Record<string, unknown>;
  const rawId =
    typeof record.id === 'string'
      ? record.id
      : typeof record.technicianId === 'string'
        ? record.technicianId
        : null;
  return rawId?.trim() || null;
};
