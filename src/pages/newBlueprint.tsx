import type { NextPage } from "next";
import { useCallback, useState } from "react";
import { api } from "~/utils/api";

import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";
import { useUser } from "@clerk/nextjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";
import { useRouter } from "next/router";
import { ButtonCallToActionComponent } from "~/components/input";

const NewBlueprintPage: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { user } = useUser();

  const context = api.useContext().blueprints;
  const router = useRouter();

  const { mutate, isLoading: isCreating } = api.blueprints.create.useMutation({
    onSuccess: (data) => {
      setName("");
      setDescription("");
      toast.success(` ${data.name} created successfully`);
      void context.invalidate();
      void router.back();
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

  const save = useCallback(() => {

    if (name.length < 3) {
      toast.error("A blueprint title must have at least three characters");
      return;
    }

    toast.loading("Creating Blueprint...", { duration: 1000 })

    mutate({ name, description });
  }, [name, description, mutate]);


  //redirect if the user is not found
  if (!user) {
    return <SignInModal redirectUrl={`/newblueprint`} />;
  }

  // const nodes = [] as object[];
  // const edges = [] as object[];

  return (
    <div className="min-h-[100vh] bg-zinc-900">
      <NewItemPageHeader title="New Blueprint" context="blueprints" save={() => save()} />
      <div
        className="m-auto flex flex-col md:w-1/2"
      // onSubmit={() => mutate({ name, description, nodes, edges })}
      >
        <div className="w-full p-2">
          <p className="py-1 text-lg font-semibold">Blueprint Title</p>
          <input
            className="w-full ring-2 ring-zinc-700 rounded p-2 outline-none text-zinc-200 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800"
            type="text"
            placeholder="Name"
            disabled={isCreating}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg font-semibold">Blueprint Description</p>
          <input
            className="w-full ring-2 ring-zinc-700 rounded p-2 outline-none text-zinc-200 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800"
            type="text"
            placeholder="Description"
            disabled={isCreating}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="p-2" />
        <div className="w-full p-2">
          {/* <button
            disabled={isCreating}
            onClick={() => save()}
            className="flex h-10 w-full items-center justify-center rounded bg-amber-800 hover:bg-amber-700 duration-100 transition-color font-semibold text-white"
          >
            {isCreating ? <LoadingSpinner /> : <p>Create Blueprint</p>}
          </button> */}

          <ButtonCallToActionComponent
            disabled={isCreating}
            disableToolTip={true}
            onClick={() => save()} >
            {isCreating ? <LoadingSpinner /> : <p>Create Blueprint</p>}
          </ButtonCallToActionComponent>
        </div>
      </div>
    </div>
  );
};

export default NewBlueprintPage;
