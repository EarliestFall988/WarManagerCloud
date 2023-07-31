import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { type Sector, type Tag } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { TagsMultiselectDropdown } from "~/components/TagDropdown";
import {
  ButtonCallToActionComponent,
  InputComponent,
  TextareaComponent,
} from "~/components/input";
import { LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const NewProjectPage: NextPage = () => {
  const [projectName, setProjectName] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  const [tags, setTags] = useState<Tag[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [nameError, setNameError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [sectorsError, setSectorsError] = useState("");

  const context = api.useContext().projects;

  const router = useRouter();

  const { mutate, isLoading: isCreating } = api.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} added successfully!`);
      setProjectName("");
      setProjectNotes("");
      void context.invalidate();
      void router.back();
    },

    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
        toast.error(e.message);
        return;
      } else {
        toast.error(
          "There were a few errors, please check the form and try again."
        );
      }

      for (const key in errorMessage) {
        // toast.error(errorMessage?[key][0] || "there was an api error");
        const keyMessage = errorMessage[key];

        if (keyMessage) {
          const message = keyMessage[0] || "";

          switch (key) {
            case "name":
              setNameError(message);
              break;
            case "notes":
              setNotesError(message);
              break;
            case "sectors":
              setSectorsError(message);
              break;
            default:
              break;
          }
        }
      }
    },
  });

  // const isCreating = false;

  const save = useCallback(() => {
    const getTagIds = () => {
      const tagIds = tags.map((tag) => tag.id);

      return tagIds;
    };
    const getSectorIds = () => {
      const ids = sectors.map((s) => s.id);

      return ids;
    };

    setNameError("");
    setNotesError("");

    toast.loading("Saving Project", { duration: 1000 });

    const tagIds = getTagIds();
    const sectorIds = getSectorIds();

    mutate({
      name: projectName,
      description: projectNotes,
      tags: tagIds,
      sectors: sectorIds,
    });
  }, [projectName, projectNotes, mutate, tags, sectors]);

  return (
    <div className="min-w-screen min-h-screen bg-zinc-900">
      <NewItemPageHeader
        title="New Project"
        context="projects"
        saving={isCreating}
        save={() => {
          save();
        }}
        cancel={() => router.back()}
      />
      <SignedIn>
        <div className="m-auto flex flex-col md:w-1/2">
          <div className="w-full p-2">
            <p className="py-1 text-lg">Name</p>
            <InputComponent
              error={nameError}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.currentTarget.value);
              }}
              placeholder="Name"
              disabled={isCreating}
              autoFocus
            />
            <h1 className="text-lg font-semibold">Tags</h1>
            <div>
              <TagsMultiselectDropdown
                type={"projects and sectors"}
                savedSectors={sectors}
                savedTags={tags}
                onSetSectors={setSectors}
                onSetTags={setTags}
              />
              {sectorsError && (
                <>
                  <div className="h-[4px] rounded-lg bg-red-500" />
                  <p className="px-2 text-sm text-red-500">{sectorsError}</p>
                </>
              )}
            </div>
          </div>
          <div className="w-full p-2">
            <p className="py-1 text-lg">Notes</p>
            <TextareaComponent
              error={notesError}
              value={projectNotes}
              onChange={(e) => {
                setProjectNotes(e.currentTarget.value);
              }}
              placeholder="Notes"
              disabled={isCreating}
            />
          </div>
          <div className="p-2" />
          <div className="w-full p-2">
            <ButtonCallToActionComponent
              disabled={isCreating}
              onClick={() => {
                save();
              }}
            >
              {isCreating ? (
                <LoadingSpinner />
              ) : (
                <>
                  {" "}
                  <CloudArrowUpIcon className="h-6 w-6" />{" "}
                  <p> Create Project</p>
                </>
              )}
            </ButtonCallToActionComponent>
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
