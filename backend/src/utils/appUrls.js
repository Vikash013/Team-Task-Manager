export const getClientUrl = (origin) => {
  const clientUrl = process.env.CLIENT_URL || origin;
  if (!clientUrl) return 'http://localhost:5173';
  return clientUrl.replace(/\/(?!.*\/)/, '');
};

export const buildInviteUrl = (token, origin) => `${getClientUrl(origin)}/signup?invite=${token}`;

export const buildResetUrl = (token, origin) => `${getClientUrl(origin)}/reset-password/${token}`;
