export const parseTags = (value = '') =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);

export const taskMatchesFilters = (task, filters) => {
  const matchesStatus = filters.status === 'All' || task.status === filters.status;
  const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
  const query = filters.query.trim().toLowerCase();
  const searchableText = [task.title, task.description, task.project?.name, task.assignedTo?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return matchesStatus && matchesPriority && (!query || searchableText.includes(query));
};
