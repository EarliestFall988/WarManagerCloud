import type { NextPage } from "next";
import { useState } from "react";
import { api } from "~/utils/api";

import { useRouter } from "next/router";

import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";
import { SignInButton, useUser } from "@clerk/nextjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";

const NewBlueprintPage: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { push } = useRouter();

  const { user } = useUser();

  //redirect if the user is not found
  if (!user) {
    return (
      <SignInModal redirectUrl={`/blueprints/new`} />
    );
  }

  const { mutate, isLoading: isCreating } = api.blueprints.create.useMutation({
    onSuccess: (data) => {
      setName("");
      setDescription("");

      toast.success(` ${data.name} created successfully`);

      // void api.blueprints.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      // const res = e.shape?.data?.zodError?.fieldErrors[0]);

      console.log(errorMessage);

      //   if (e.shape?.data?.zodError?.fieldErrors.name.le) {
      //     nameError = e.shape?.data?.zodError?.fieldErrors.name[0];
      //   }

      //   if (e.shape?.data?.zodError?.fieldErrors.description) {
      //     descriptionError = e.shape?.data?.zodError?.fieldErrors.description[0];
      //   }

      if (errorMessage?.name != null && errorMessage?.name[0] != null) {
        toast.error("A blueprint title must have at least three characters");
      } else if (
        errorMessage?.description != null &&
        errorMessage?.description[0] != null
      ) {
        toast.error(errorMessage?.description[0]);
      } else {
        toast.error("Something went wrong! Please try again later");
      }
    },
  });

  // const nodes = [] as object[];
  // const edges = [] as object[];

  return (
    <div className="min-h-[100vh] bg-zinc-800">
      <NewItemPageHeader title="New Blueprint" context="blueprints" />
      <div
        className="m-auto flex flex-col md:w-1/2"
        // onSubmit={() => mutate({ name, description, nodes, edges })}
      >
        <div className="w-full p-2">
          <p className="py-1 text-lg">Blueprint Title</p>
          <input
            className="w-full rounded p-2 text-stone-800"
            type="text"
            placeholder="Name"
            disabled={isCreating}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Blueprint Description</p>
          <input
            className="w-full rounded p-2 text-stone-800 outline-none"
            type="text"
            placeholder="Description"
            disabled={isCreating}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="p-2" />
        <div className="w-full p-2">
          <button
            disabled={isCreating}
            onClick={() => mutate({ name, description })}
            className="flex h-10 w-full items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 font-semibold text-white"
          >
            {isCreating ? <LoadingSpinner /> : <p>Create Blueprint</p>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBlueprintPage;