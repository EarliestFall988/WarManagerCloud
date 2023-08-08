import type { NextPage } from "next";
import { useCallback, useState } from "react";
import { api } from "~/utils/api";

import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";
import { useUser } from "@clerk/nextjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";
import { useRouter } from "next/router";
import {
  ButtonCallToActionComponent,
  SwitchComponentWithErrorInput,
} from "~/components/input";
import {
  CheckBadgeIcon,
  PaintBrushIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import TooltipComponent from "~/components/Tooltip";

const NewBlueprintPage: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [liveData, setLiveData] = useState<boolean>(true);

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

    toast.loading("Creating Blueprint...", { duration: 1000 });

    mutate({ name, description });
  }, [name, description, mutate]);

  //redirect if the user is not found
  if (!user) {
    return <SignInModal redirectUrl={`/blueprints/new`} />;
  }

  // const nodes = [] as object[];
  // const edges = [] as object[];

  return (
    <div className="min-h-[100vh] bg-zinc-900">
      <NewItemPageHeader
        title="New Blueprint"
        context="blueprints"
        save={() => save()}
      />
      <div
        className="m-auto flex flex-col md:w-1/2"
        // onSubmit={() => mutate({ name, description, nodes, edges })}
      >
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg font-semibold">
            Blueprint Title
          </p>
          <input
            className="w-full rounded bg-zinc-800 p-2 text-zinc-200 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
            type="text"
            placeholder="Name"
            disabled={isCreating}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg font-semibold">
            Blueprint Description
          </p>
          <input
            className="w-full rounded bg-zinc-800 p-2 text-zinc-200 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
            type="text"
            placeholder="Description"
            disabled={isCreating}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="w-full p-2">
          <div className="flex items-center gap-1">
            <p className="select-none py-1 text-lg font-semibold">
              Live Data or Zen Mode?
            </p>
            <TooltipComponent
              content="Live Data (recommended) will show the latest data in the blueprint. Zen Mode will show the blueprint without checking for scheduling conflicts or showing some of the latest data."
              side="right"
            >
              <QuestionMarkCircleIcon className="h-6 w-6 text-zinc-200" />
            </TooltipComponent>
          </div>
          <SwitchComponentWithErrorInput
            checked={liveData}
            onCheckedChange={setLiveData}
            className="bg-zinc-800"
          >
            {liveData ? (
              <>
                <div className="w-30 flex gap-2">
                  <CheckBadgeIcon className="h-6 w-6 text-zinc-200" />
                  <p className="w-20 text-zinc-200">Live Data</p>
                </div>
              </>
            ) : (
              <div className="w-30 flex gap-2">
                <PaintBrushIcon className="h-6 w-6 text-zinc-200" />
                <p className="w-20 text-zinc-200">Zen Mode</p>
              </div>
            )}
          </SwitchComponentWithErrorInput>
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
            onClick={() => save()}
          >
            {isCreating ? <LoadingSpinner /> : <p>Create Blueprint</p>}
          </ButtonCallToActionComponent>
        </div>
      </div>
    </div>
  );
};

export default NewBlueprintPage;
