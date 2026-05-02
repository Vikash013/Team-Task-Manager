export const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

export const buildInviteUrl = (token) => `${getClientUrl()}/signup?invite=${token}`;

export const buildResetUrl = (token) => `${getClientUrl()}/reset-password/${token}`;
