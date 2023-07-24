import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";

const checkIfUserIsAdmin = async (userId: string) => {
  const userDetails = await clerkClient.users.getUser(userId);

//   console.log("user details", userDetails);

  if (!userDetails || !userDetails.primaryEmailAddressId)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Email not found",
    });

  const email = userDetails.emailAddresses.find((email) => {
    return email.id === userDetails.primaryEmailAddressId;
  });

  // console.log("email", email);

  if (email == undefined) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Email not found",
    });
  }

//   console.log(email);

  if (
    email.emailAddress !== "andrew.kaiser@jrcousa.com" &&
    email.emailAddress !== "taylor.howell@jrcousa.com"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not authorized to view this page",
    });
  }

  return true;
};

export default checkIfUserIsAdmin;
