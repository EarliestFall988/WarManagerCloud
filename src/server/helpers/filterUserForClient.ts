import type { User } from "@clerk/nextjs/dist/api";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    profilePicture: user.profileImageUrl,
  };
};

export default filterUserForClient;
