/**
 * Permission Matrix for Client Applications
 * 
 * Maps logical permission keys to human-readable labels, descriptions,
 * and the specific API routes/methods they unlock.
 */
export const CLIENT_PERMISSIONS = {
  'articles:read': {
    label: 'Read Articles',
    description: 'Allow viewing all published articles and individual article details.',
    routes: [
      { path: '/articles', method: 'GET' },
      { path: '/articles/:slug', method: 'GET' }
    ]
  },
  'templates:read': {
    label: 'Read Templates',
    description: 'Allow viewing available article templates.',
    routes: [
      { path: '/articles/templates', method: 'GET' }
    ]
  },
  'profile:read': {
    label: 'Read Profile',
    description: 'Allow viewing public user profiles.',
    routes: [
      { path: '/users/me', method: 'GET' },
      { path: '/users/:id', method: 'GET' }
    ]
  },
  'contact:write': {
    label: 'Submit Contact',
    description: 'Allow submitting messages via the contact form.',
    routes: [
      { path: '/contact', method: 'POST' }
    ]
  },
  'careers:read': {
    label: 'Read Careers',
    description: 'Allow viewing job openings and career information.',
    routes: [
      { path: '/careers', method: 'GET' }
    ]
  },
  'organizations:list': {
    label: 'List Organizations',
    description: 'Allow viewing all registered organizations.',
    routes: [
      { path: '/organizations', method: 'GET' }
    ]
  }
};

/**
 * Helper to get all permission keys and metadata for the frontend
 */
export const getPermissionMetadata = () => {
  return Object.entries(CLIENT_PERMISSIONS).map(([key, value]) => ({
    key,
    label: value.label,
    description: value.description
  }));
};
