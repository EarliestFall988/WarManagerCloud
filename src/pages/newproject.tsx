import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const NewProjectPage: NextPage = () => {
  const [projectName, setProjectName] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  const { mutate, isLoading: isCreating } = api.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} added successfully!`);
      setProjectName("");
      setProjectNotes("");
      //void api.projects.getAll.invalidate()
    },
  });

  // const isCreating = false;

  return (
    <div className="min-w-screen min-h-screen bg-zinc-800">
      <NewItemPageHeader title="New Project" context="projects" />
      <SignedIn>
        <div className="m-auto flex flex-col md:w-1/2">
          <div className="w-full p-2">
            <p className="py-1 text-lg">Name</p>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              type="text"
              placeholder="Name"
              value={projectName}
              disabled={isCreating}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="w-full p-2">
            <p className="py-1 text-lg">Notes</p>
            <textarea
              className="h-24 w-full rounded p-2 text-stone-800 outline-none"
              placeholder="Talk about anything you want!"
              value={projectNotes}
              disabled={isCreating}
              onChange={(e) => setProjectNotes(e.target.value)}
            />
          </div>
          <div className="p-2" />
          <div className="w-full p-2">
            <button
              disabled={isCreating}
              onClick={() => {
                toast.loading("Saving Project", { duration: 1000 });
                mutate({ name: projectName, description: projectNotes });
              }}
              className="flex h-10 w-full items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 font-semibold text-white hover:from-amber-600 hover:to-red-600"
            >
              {isCreating ? <LoadingSpinner /> : <p> Create Project</p>}
            </button>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <SignInModal redirectUrl="/newproject" />
      </SignedOut>
    </div>
  );
};

export default NewProjectPage;
