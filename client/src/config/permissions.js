/**
 * Central RBAC Permissions Configuration
 * 
 * Levels:
 *   'edit' = full CRUD access
 *   'view' = read-only (no create/edit/delete actions shown)
 *   'none' = module hidden and blocked at route level
 */

export const ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

export const PERMISSIONS = {
  'Fleet Manager': {
    dashboard:    'edit',
    fleet:        'edit',
    drivers:      'view',
    trips:        'edit',
    maintenance:  'edit',
    fuelExpenses: 'view',
    analytics:    'view',
    settings:     'view',
  },
  'Driver': {
    dashboard:    'view',
    fleet:        'view',
    drivers:      'view',
    trips:        'edit',
    maintenance:  'view',
    fuelExpenses: 'none',
    analytics:    'none',
    settings:     'view',
  },
  'Dispatcher': {
    dashboard:    'view',
    fleet:        'view',
    drivers:      'view',
    trips:        'edit',
    maintenance:  'view',
    fuelExpenses: 'none',
    analytics:    'none',
    settings:     'view',
  },
  'Safety Officer': {
    dashboard:    'view',
    fleet:        'view',
    drivers:      'edit',
    trips:        'view',
    maintenance:  'view',
    fuelExpenses: 'none',
    analytics:    'view',
    settings:     'view',
  },
  'Financial Analyst': {
    dashboard:    'view',
    fleet:        'view',
    drivers:      'none',
    trips:        'view',
    maintenance:  'view',
    fuelExpenses: 'edit',
    analytics:    'edit',
    settings:     'view',
  },
};

/**
 * Get permission level for a given role and module.
 * @param {string} role
 * @param {string} module
 * @returns {'edit' | 'view' | 'none'}
 */
export function getPermission(role, module) {
  return PERMISSIONS[role]?.[module] || 'none';
}
