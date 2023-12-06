import { useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import { useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SettingsLayout from "~/components/settingsSideMenu";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { type DropdownTagType } from "~/components/TagDropdown";
import { ButtonDeleteAction, InputComponent } from "~/components/input";
import { TooltipComponent } from "~/components/Tooltip";
import autoAnimate from "@formkit/auto-animate";

const ApiSettingsPage: NextPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const [animationParent] = useAutoAnimate();

  const { data, isLoading, isError } =
    api.permissions.searchPermissions.useQuery({
      searchTerm,
    });

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn) {
    return <SignInModal redirectUrl="/settings/permissions" />;
  }

  if (isError) {
    return (
      <SettingsLayout>
        <div className="flex h-[30vh] items-center justify-center text-2xl font-semibold tracking-tight text-zinc-500">
          <p>Error loading permissions</p>
        </div>
      </SettingsLayout>
    );
  }

  if (
    user?.emailAddresses == undefined ||
    user?.emailAddresses[0] == undefined ||
    (user?.emailAddresses[0].emailAddress !== "andrew.kaiser@jrcousa.com" &&
      user?.emailAddresses[0].emailAddress !== "taylor.howell@jrcousa.com")
  ) {
    return (
      <SettingsLayout>
        <div className="flex h-[30vh] items-center justify-center text-xl font-semibold tracking-tight text-zinc-300">
          <p>You do not have permission to view this page</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="min-h-[30vh]">
        <div className="m-auto lg:w-1/2">
          <NewKeyModal newKey={true} className="w-full rounded bg-zinc-800 p-2">
            <div className="flex gap-2 rounded bg-zinc-800 p-2">
              <p className="text-zinc-100">Add a New Key</p>
              <PlusIcon className="h-6 w-6 text-zinc-100" />
            </div>
          </NewKeyModal>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ApiSettingsPage;

const NewKeyModal: React.FC<{
  className: string;
  newKey?: boolean;
  children: ReactNode;
}> = ({ className, children, newKey }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current, { duration: 200 });
  }, []);

  const ctx = api.useContext().apiKeys;

  const { mutate, isLoading: isSaving } = api.apiKeys.create.useMutation({
    onSuccess: () => {
      toast.success("Permission created successfully");
      setDialogOpen(false);
      void ctx.invalidate();
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

      // handleError(errorMessage);
    },
  });

  const SaveChanges = useCallback(
    (newKey?: boolean) => {
      if (name === "") {
        setNameError("Name cannot be empty");
        return;
      }
      if (description === "") {
        setDescriptionError("Description cannot be empty");
        return;
      }
    },
    [name, description]
  );

  const deletePermissionCallback = useCallback(() => {
    console.log("delete");
  }, []);

  const isUpdating = false;
  const isDeleting = false;

  return (
    <Dialog.Root open={dialogOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={() => {
            setDialogOpen(true);
          }}
          className={className}
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <button
          className="cursor-default"
          onClick={() => {
            setDialogOpen(false);
          }}
        >
          <Dialog.Overlay className="fixed inset-0 top-0 z-30 backdrop-blur-sm data-[state=open]:animate-overlayDrawerShow md:bg-black/10" />
        </button>
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content className="fixed right-[-50%] top-[50%] z-30 h-[100vh] w-[100vw] translate-x-[-50%] translate-y-[-50%] rounded-lg  border-l border-zinc-700 bg-zinc-900 p-4 focus:outline-none data-[state=open]:animate-slide lg:right-[-25%] lg:w-[50vw]">
          <div ref={parent}>
            {!(isSaving || isUpdating || isDeleting) && (
              <div>
                <div className="flex items-center justify-between">
                  <Dialog.Title className="select-none text-2xl font-semibold text-zinc-200">
                    {newKey ? "Create New API Key" : "Edit API Key"}
                  </Dialog.Title>
                  {/* <Dialog.Description className="text-md select-none tracking-tight text-white"></Dialog.Description> */}
                  <div className="flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button
                        onClick={() => {
                          setDialogOpen(false);
                        }}
                        className="select-none rounded p-2 text-center text-zinc-300 transition-all duration-100 hover:bg-zinc-800 hover:text-red-500"
                      >
                        <XMarkIcon className="h-6 w-6 " />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
                <div className="p-2">
                  <p className="pb-1 text-lg font-semibold">Name</p>
                  {/* <TooltipComponent
                    content="The name of the permission. This is what will be displayed to users."
                    side="top"
                  > */}
                  <div>
                    <InputComponent
                      autoFocus
                      type="text"
                      placeholder="Name"
                      disabled={false}
                      error={nameError}
                      onChange={(e) => {
                        setName(e.currentTarget.value);
                      }}
                      value={name}
                    />
                  </div>
                  {/* </TooltipComponent> */}
                </div>
                <div className="p-2">
                  <h3 className="pb-1 text-lg font-semibold">Description</h3>
                  {/* <TooltipComponent
                    content="The description of the permission. This is what will be displayed to users."
                    side="left"
                  > */}
                  <div>
                    <InputComponent
                      type="text"
                      placeholder="Description"
                      disabled={false}
                      error={descriptionError}
                      onChange={(e) => {
                        setDescription(e.currentTarget.value);
                      }}
                      value={description}
                    />
                  </div>
                  {/* </TooltipComponent> */}
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => {
                      SaveChanges(newKey);
                    }}
                    className="rounded bg-amber-800 p-2 text-zinc-100 transition-all duration-100 hover:bg-amber-700"
                  >
                    {newKey ? "Generate Key" : "Save Changes"}
                  </button>
                  <Dialog.Close asChild>
                    <button
                      onClick={() => {
                        setDialogOpen(false);
                      }}
                      className="rounded bg-zinc-700 p-2 text-zinc-100 transition-all duration-100 hover:bg-zinc-600 focus:bg-zinc-600"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                </div>
                {!newKey && (
                  <ButtonDeleteAction
                    title="Delete Permission"
                    yes={() => {
                      deletePermissionCallback();
                    }}
                    description="Are you sure you want to delete this permission?"
                    disabled={false}
                    loading={false}
                  />
                )}
              </div>
            )}
            {(isSaving || isUpdating || isDeleting) && (
              <div className="flex h-[100vh] w-full items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
