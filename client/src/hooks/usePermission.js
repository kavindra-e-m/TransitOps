import { useAuth } from '../context/AuthContext';
import { getPermission } from '../config/permissions';

/**
 * Hook to check permission level for the current user's role.
 * @param {string} module - module key from PERMISSIONS config
 * @returns {{ level: string, canView: boolean, canEdit: boolean }}
 */
export function usePermission(module) {
  const { role } = useAuth();
  const level = getPermission(role, module);
  return {
    level,
    canView: level === 'view' || level === 'edit',
    canEdit: level === 'edit',
  };
}
