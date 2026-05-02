export const getErrorMessage = (error) => {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.map((item) => item.message).join(', ');
  }

  return error.response?.data?.message || error.message || 'Something went wrong';
};
