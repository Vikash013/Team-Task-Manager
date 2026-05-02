export const getMainAdminEmail = () =>
  (process.env.MAIN_ADMIN_EMAIL || 'vlistenmusic@gmail.com').trim().toLowerCase();

export const isMainAdmin = (user) => user?.email?.toLowerCase() === getMainAdminEmail();
