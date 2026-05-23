export const mergeMongoFilters = (...filters) => {
  const activeFilters = filters.filter((filter) => filter && Object.keys(filter).length > 0);
  return activeFilters.length > 0 ? { $and: activeFilters } : {};
};

export const buildNonAdminBookingFilter = (adminUsers = []) => {
  const adminIds = adminUsers.map((user) => user._id).filter(Boolean);
  const adminEmails = adminUsers
    .map((user) => String(user.email || "").trim().toLowerCase())
    .filter(Boolean);
  const filters = [{ isTestBooking: { $ne: true } }];

  if (adminIds.length > 0) {
    filters.push({ userId: { $nin: adminIds } });
  }

  if (adminEmails.length > 0) {
    filters.push({ customerEmail: { $nin: adminEmails } });
  }

  return mergeMongoFilters(...filters);
};

export const buildNonAdminUserContentFilter = (adminUsers = []) => {
  const adminIds = adminUsers.map((user) => user._id).filter(Boolean);
  return adminIds.length > 0 ? { userId: { $nin: adminIds } } : {};
};

export const buildNonAdminFeedbackFilter = (adminUsers = []) => {
  const adminEmails = adminUsers
    .map((user) => String(user.email || "").trim().toLowerCase())
    .filter(Boolean);

  return mergeMongoFilters(
    buildNonAdminUserContentFilter(adminUsers),
    adminEmails.length > 0 ? { email: { $nin: adminEmails } } : {}
  );
};
