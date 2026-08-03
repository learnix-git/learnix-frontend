import client from "./client";

// GET /user/tutors/:id
export const getTutorProfile = async (id: string | number) => {
  return await client(`user/tutors/${id}`);
};

// GET /user/students/:id
export const getStudentProfile = async (id: string | number) => {
  return await client(`user/students/${id}`);
};

// GET /user/:id/info
export const getUserInfo = async (id: string | number) => {
  return await client(`user/${id}/info`);
};

// PATCH /user/update-info
export const updateUserInfo = async (data: any) => {
  return await client.patch(`user/update-info`, data);
};

// PATCH /user/update-avatar
export const updateAvatar = async (data: { url: string }) => {
  return await client.patch(`user/update-avatar`, data);
};
