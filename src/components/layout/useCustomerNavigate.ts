import { useNavigate } from 'react-router-dom';
import { resolveCustomerPath } from './customerNavigation';
import { buildProviderProfilePath } from '../../utils/providerNavigation';

export function useCustomerNavigate() {
  const navigate = useNavigate();

  return (page: string, data?: unknown) => {
    const record =
      data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
    const technicianId =
      typeof record?.id === 'string'
        ? record.id
        : typeof record?.technicianId === 'string'
          ? record.technicianId
          : null;

    if (page === 'provider-profile' && technicianId) {
      navigate(buildProviderProfilePath(technicianId), {
        state: { ...record, id: technicianId },
      });
      return;
    }

    navigate(resolveCustomerPath(page), { state: data });
  };
}
