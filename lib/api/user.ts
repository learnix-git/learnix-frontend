import client from "./client";

export const getTutorProfile = async (id: string | number) => {
  return await client(`user/tutors/${id}`);
};
