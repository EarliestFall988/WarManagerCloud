import {
  type NextPage,
  type GetStaticProps,
  type GetStaticPropsContext,
} from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";
import {
  ButtonCallToActionComponent,
  ButtonDeleteAction,
  InputComponent,
  TextareaComponent,
} from "~/components/input";
import { useRouter } from "next/router";

const SingleProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const [sectorName, setSectorName] = useState("");
  const [sectorCode, setSectorCode] = useState("");
  const [sectorNotes, setSectorNotes] = useState("");

  const [sectorNameError, setSectorNameError] = useState("");
  const [sectorCodeError, setSectorCodeError] = useState("");
  const [sectorNotesError, setSectorNotesError] = useState("");

  const context = api.useContext();
  const router = useRouter();

  const { mutate, isLoading: isCreating } = api.sectors.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} added successfully!`);
      setSectorName("");
      setSectorCode("");
      setSectorNotes("");
      void context.invalidate();
      if (window.history.length > 0) {
        router.back();
      } else {
        void router.push("settings/sectors");
      }
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
              setSectorNameError(message);
              break;
            case "description":
              setSectorNotesError(message);
              break;
            case "departmentCode":
              setSectorCodeError(message);
              break;
            default:
              toast.error(message);
              break;
          }
        } else {
          toast.error("Something went wrong! Please try again later");
        }
      }
    },
  });

  const { back, push } = useRouter();

  const { mutate: deleteSector, isLoading: isDeleting } =
    api.sectors.delete.useMutation({
      onSuccess: (data) => {
        toast.success(`${data.name} deleted successfully!`);
        void context.invalidate();
        if (window.history.length > 2) {
          back();
        } else {
          void push("settings/sectors");
        }
      },
      onError: (error) => {
        console.log(error);
        toast.error("there was an error deleting the sector");
      },
    });

  const { data } = api.sectors.getbyId.useQuery({
    id,
  });

  useEffect(() => {
    if (data) {
      setSectorName(data.name);
      setSectorCode(data.departmentCode);
      setSectorNotes(data.description);
    }
  }, [data]);

  const mutateSector = useCallback(
    (name: string, code: string, notes: string, id: string) => {
      setSectorNameError("");
      setSectorCodeError("");
      setSectorNotesError("");

      mutate({ name, departmentCode: code, description: notes, id, color: "" });
    },
    [mutate]
  );

  const handleDelete = () => {
    if (!data) return toast.error("There was an error deleting the sector");

    if (data._count.CrewMembers > 0)
      return toast.error(
        "Sector has crew members. Please assign them to another sector first.",
        {
          duration: 5000,
        }
      );

    if (data._count.Projects > 0)
      return toast.error(
        "Sector has projects. Please assign them to another sector first.",
        {
          duration: 5000,
        }
      );

    toast.loading("Deleting sector...", {
      duration: 1000,
    });

    deleteSector({
      id: data.id,
    });
  };

  return (
    <>
      <Head>
        <title>Editing {sectorName} sector | War Manager</title>
      </Head>
      <main className="min-h-[100vh] bg-zinc-900">
        <NewItemPageHeader
          title={`${sectorName}`}
          save={() => {
            mutateSector(sectorName, sectorCode, sectorNotes, id);
          }}
          saving={isCreating}
          context="blueprints"
          deleting={isDeleting}
        />
        <SignedIn>
          <div className="m-auto w-full sm:w-2/3">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="w-full p-2">
                <p className="py-1 text-lg font-semibold">Name</p>
                <InputComponent
                  error={sectorNameError}
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  placeholder="Name"
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <div className="w-full p-2 ">
                <p className="py-1 text-lg font-semibold">Sector Code</p>
                <InputComponent
                  error={sectorCodeError}
                  value={sectorCode}
                  onChange={(e) => setSectorCode(e.target.value)}
                  placeholder="Sector Code"
                  disabled={isCreating}
                />
              </div>
              <div className="w-full p-2">
                <p className="py-1 text-lg font-semibold">Notes</p>
                <TextareaComponent
                  error={sectorNotesError}
                  value={sectorNotes}
                  onChange={(e) => setSectorNotes(e.target.value)}
                  placeholder="Talk about anything you want!"
                  disabled={isCreating}
                />
              </div>
              <div className="w-full p-2 font-semibold">
                <ButtonCallToActionComponent
                  onClick={() => {
                    mutateSector(sectorName, sectorCode, sectorNotes, id);
                  }}
                  disabled={isCreating}
                >
                  {isCreating ? <LoadingSpinner /> : <p>Save Changes</p>}
                </ButtonCallToActionComponent>
              </div>
              <ButtonDeleteAction
                description="This will permanently delete this sector and all of its data. This action cannot be undone."
                title="Delete Sector"
                disabled={isDeleting}
                loading={isDeleting}
                yes={handleDelete}
              />
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

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const helper = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") {
    throw new Error("slug is not a string");
  }
  if (id.length <= 0) {
    throw new Error("slug too short");
  }

  await helper.projects.getById.prefetch({ id });

  const result = helper.dehydrate();

  return {
    props: {
      trpcState: result,
      id: id,
    },
    revalidate: 60,
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SingleProjectPage;
