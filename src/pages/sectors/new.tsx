import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const NewSectorPage: NextPage = () => {
  const [sectorName, setSectorName] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [sectorNotes, setSectorNotes] = useState("");

  const context = api.useContext();

  const { mutate, isLoading: isCreating } = api.sectors.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} added successfully!`);
      setSectorName("");
      setSectorCode("");
      setSectorNotes("");
      void context.invalidate();
    },
    onError: (error) => {
      console.log(error);
      toast.error("there was an error adding the sector");
    },
  });

  const createNewSector = useCallback(
    (name: string, code: string, notes: string) => {
      mutate({ name, departmentCode: code, description: notes, color: "#eee" });
    },
    [mutate]
  );

  return (
    <>
      <Head>
        <title>New Sector - War Manager</title>
      </Head>
      <main className="min-h-[100vh] bg-zinc-800">
        <NewItemPageHeader title="New Sector" context="blueprints" />
        <SignedIn>
          <div className="m-auto w-full sm:w-2/3">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="w-full p-2">
                <p className="py-1 text-lg">Name</p>
                <input
                  className="w-full rounded p-2 text-stone-800 outline-none"
                  type="text"
                  placeholder="Name"
                  value={sectorName}
                  disabled={isCreating}
                  onChange={(e) => setSectorName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="w-full p-2">
                <p className="py-1 text-lg">Sector Code</p>
                <input
                  className="w-full rounded p-2 text-stone-800 outline-none"
                  type="text"
                  placeholder="sector code"
                  value={sectorCode}
                  disabled={isCreating}
                  onChange={(e) => setSectorCode(e.target.value)}
                />
              </div>
              <div className="w-full p-2">
                <p className="py-1 text-lg">Notes</p>
                <textarea
                  className="h-24 w-full rounded p-2 text-stone-800 outline-none"
                  placeholder="Talk about anything you want!"
                  value={sectorNotes}
                  disabled={isCreating}
                  onChange={(e) => setSectorNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createNewSector(sectorName, sectorCode, sectorNotes);
                    }
                  }}
                />
              </div>
              <div className="w-full p-2">
                <button
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createNewSector(sectorName, sectorCode, sectorNotes);
                    }
                  }}
                  onClick={() => {
                    createNewSector(sectorName, sectorCode, sectorNotes);
                  }}
                  className="w-full rounded bg-gradient-to-r from-amber-700 to-red-700 p-2 text-center font-semibold"
                >
                  {isCreating ? <LoadingSpinner /> : <p>Create New Sector</p>}
                </button>
              </div>
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          <SignInModal redirectUrl="/sectors/new" />
        </SignedOut>
      </main>
    </>
  );
};

export default NewSectorPage;
