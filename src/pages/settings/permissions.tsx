import { useUser } from "@clerk/nextjs";
import {
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import type { NextPage } from "next";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SettingsLayout from "~/components/settingsSideMenu";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";
import * as Dialog from "@radix-ui/react-dialog";
import { ButtonDeleteAction, InputComponent } from "~/components/input";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Select from "react-select";
import { type DropdownTagType } from "~/components/TagDropdown";
import { type MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import autoAnimate from "@formkit/auto-animate";
import TooltipComponent from "~/components/Tooltip";
import type { PermissionKey, Permissions } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const PermissionsSettingsPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const [animationParent] = useAutoAnimate();

  const { data, isLoading, isError } =
    api.permissions.searchPermissions.useQuery(
      {
        searchTerm,
      }
    );

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



  return (
    <SettingsLayout>
      <div className="min-h-[30vh]">
        <div className="flex items-center gap-2 justify-between border-b border-zinc-700 pb-2 font-semibold text-zinc-200">
          <input type="text" autoFocus placeholder="Search Permissions" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); }} className="p-2 rounded bg-zinc-700 border border-zinc-500 text-zinc-200 hover:ring-1 hover:ring-amber-600 focus:ring-2 focus:ring-amber-600 w-full duration-100 transition-all outline-none" />
          <PermissionsModal newPermission={true} className="rounded p-2 hover:bg-zinc-600" >
            <PlusIcon className="h-6 w-6 text-zinc-100" />
          </PermissionsModal>
        </div>
        <div ref={animationParent}>
          {data?.map((permission) => (
            <PermissionsListItem key={permission.id} permission={permission} keywords={permission.keywords} />
          ))}
          {
            data?.length === 0 && (
              <div className="flex h-[30vh] items-center justify-center  text-zinc-500">
                <p>No permissions found</p>
              </div>
            )}
          {
            isLoading && (
              <div className="flex h-[30vh] items-center justify-center">
                <LoadingSpinner />
              </div>
            )
          }
        </div>
      </div>
    </SettingsLayout>
  );
};


const PermissionsListItem: React.FC<{ permission: Permissions, keywords?: PermissionKey[] }> = ({ permission, keywords }) => {

  return (
    <PermissionsModal newPermission={false} className="w-full" permissionData={permission} keywordData={keywords} >
      <div
        key={permission.id}
        className="mb-2 flex select-none items-center justify-between border-b border-zinc-700 p-2"
      >
        <div className="flex w-full items-center justify-between gap-2 p-1">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-start gap-1">

              <p className="text-lg font-semibold text-zinc-200">
                {permission.name}
              </p>
              {
                keywords?.map((keyword) => (
                  <div
                    key={keyword.id}
                    className={`border flex items-center whitespace-nowrap rounded-xl px-2 text-xs`}
                  >
                    {keyword.name}
                  </div>
                ))
              }
            </div>
            <div className="flex gap-1">
              <p className="text-sm text-zinc-400 text-left">
                {permission.description || "<no description>"}
              </p>
            </div>

          </div>
          <div>
            <p className="hidden text-sm text-zinc-300 md:block">
              {permission.updatedAt.toDateString()}
            </p>
          </div>
        </div>
      </div>
    </PermissionsModal>
  )
}

type errorMessageType = {
  [x: string]: string[] | undefined;
  [x: number]: string[] | undefined;
  [x: symbol]: string[] | undefined;
} | undefined

const PermissionsModal: React.FC<{ newPermission: boolean, children: React.ReactNode, className: string, permissionData?: Permissions, keywordData?: PermissionKey[] }> = ({ newPermission, children, className, permissionData, keywordData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<DropdownTagType[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [keywordError, setKeywordError] = useState("");

  const permissionsContext = api.useContext().permissions;

  const handleError = useCallback((errorMessage: errorMessageType) => {

    for (const key in errorMessage) {
      // toast.error(errorMessage?[key][0] || "there was an api error");
      const keyMessage = errorMessage[key];

      if (keyMessage) {
        const message = keyMessage[0] || "";

        switch (key) {
          case "name":
            setNameError(message);
            break;
          case "description":
            setDescriptionError(message);
            break;
          case "keywords":
            setKeywordError(message);
          default:
            // toast.error(message);
            break;
        }
      } else {
        toast.error("Something went wrong! Please try again later");
      }
    }
  }, []);

  const { mutate, isLoading: isSaving } =
    api.permissions.createPermission.useMutation({
      onSuccess: () => {
        toast.success("Permission created successfully");
        setDialogOpen(false);
        void permissionsContext.invalidate();
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

        handleError(errorMessage);
      },
    });

  const { mutate: update, isLoading: isUpdating } =
    api.permissions.updatePermission.useMutation({
      onSuccess: () => {
        toast.success("Permission created successfully");
        setDialogOpen(false);
        void permissionsContext.invalidate();
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

        handleError(errorMessage);
      },
    });

  const { mutate: deletePermission, isLoading: isDeleting } =
    api.permissions.deletePermissions.useMutation({
      onSuccess: () => {
        toast.success("Permission deleted successfully");
        setDialogOpen(false);
        void permissionsContext.invalidate();
      }
    });


  const deletePermissionCallback = useCallback(() => {

    if (permissionData) {
      deletePermission({
        id: permissionData?.id
      });
    }

  }, [deletePermission, permissionData]);

  useEffect(() => {

    if (permissionData && keywordData && !newPermission) {
      setName(permissionData.name);
      setDescription(permissionData.description);

      const newKeywords = keywordData?.map((keyword) => ({
        value: keyword.id,
        label: keyword.name,
        color: keyword.color,
      })) as DropdownTagType[];

      console.log(newKeywords);

      setKeywords(newKeywords);
    }
    else {
      setName("");
      setDescription("");
      setKeywords([]);
    }

  }, []);

  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current, { duration: 200 });
  }, []);

  const SaveChanges = useCallback((newPermission: boolean) => {
    const data = keywords.map((keyword) => keyword.value);

    console.log(name);

    setNameError("");
    setDescriptionError("");
    setKeywordError("");

    if (newPermission) {
      mutate({
        name,
        description,
        keywords: data,
      });
    } else {

      if (permissionData !== null && permissionData !== undefined) {
        update({
          id: permissionData.id,
          name,
          description,
          keywords: data,
        });
      }
    }
  }, [mutate, name, description, keywords, update, permissionData]);

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
        <button className="cursor-default"
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
                    {newPermission ? "Create New Permission" : "Edit Permission"}
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
                  <TooltipComponent
                    content="The name of the permission. This is what will be displayed to users."
                    side="top"
                  >
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
                  </TooltipComponent>
                </div>
                <div className="p-2">
                  <h3 className="pb-1 text-lg font-semibold">Description</h3>
                  <TooltipComponent
                    content="The description of the permission. This is what will be displayed to users."
                    side="left"
                  >
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
                  </TooltipComponent>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <h3 className="pb-1 text-lg font-semibold">
                      Keywords (Beta)
                    </h3>
                    <div className="hidden lg:block">
                      <TooltipComponent
                        content="Use keywords to describe the permission. This helps War Manager: (1) Tailor the experience (2) Prevent unauthorized access"
                        side="top"
                      >
                        <InformationCircleIcon className="h-5 w-5 text-zinc-300" />
                      </TooltipComponent>
                    </div>
                  </div>
                  <TooltipComponent
                    content="Use keywords to describe the permission. This helps War Manager: (1) Tailor the experience (2) Prevent unauthorized access"
                    side="left"
                  >
                    <div
                      className={`${keywordError
                        ? "rounded border-b-2 border-red-500 pb-[2px]"
                        : ""
                        }`}
                    >
                      <KeywordsMultiSelect
                        OnSetKeywords={(e) => {
                          setKeywords(e);
                        }}
                        newKeywords={
                          keywordData?.map((keyword) => ({
                            value: keyword.id,
                            label: keyword.name,
                            color: keyword.color,
                          })) as DropdownTagType[]
                        }
                      />
                    </div>
                  </TooltipComponent>
                  <p className="p-1 text-sm text-red-500">{keywordError}</p>
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => {
                      SaveChanges(newPermission);
                    }}
                    className="rounded bg-amber-800 p-2 text-zinc-100 transition-all duration-100 hover:bg-amber-700"
                  >
                    {newPermission ? "Create" : "Save Changes"}
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
                {
                  !newPermission && (
                    <ButtonDeleteAction title="Delete Permission" yes={() => { deletePermissionCallback(); }} description="Are you sure you want to delete this permission?" disabled={false} loading={false} />
                  )
                }
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

const KeywordsMultiSelect: React.FC<{
  OnSetKeywords: (e: DropdownTagType[]) => void;
  newKeywords?: DropdownTagType[];
}> = ({ OnSetKeywords, newKeywords }) => {
  const [currentTags, setCurrentTags] = useState<DropdownTagType[]>([]);
  const [allTags, setAllTags] = useState<DropdownTagType[]>([]);

  const { data, isLoading, isError } = api.permissionsKeys.getAllKeys.useQuery();

  useEffect(() => {

    if (newKeywords) {
      setCurrentTags(newKeywords);
    }

  }, []);

  useMemo(() => {
    if (data) {
      setAllTags(data.map((tag) => ({
        value: tag.id,
        label: tag.name,
        color: tag.color,
      })) as DropdownTagType[]);
    }
  }, [data]);


  const onChange = useCallback(
    (
      e: MultiValue<{
        value: string;
        label: string;
        color: string;
      }>
    ) => {
      const tags = [] as DropdownTagType[];

      if (!allTags) return;

      e.forEach((tg) => {
        const tag = allTags.find((t) => t.value === tg.value);

        if (tag) {
          tags.push(tag);
        }
      });
      setCurrentTags(tags);
      OnSetKeywords(tags);
    },
    [allTags, setCurrentTags, OnSetKeywords]
  );

  return (
    <>
      {!isError && (
        <Select
          closeMenuOnSelect={false}
          defaultValue={newKeywords || []}
          isMulti
          name="currentTags"
          options={allTags}
          value={currentTags}
          classNamePrefix="select"
          className="w-full rounded bg-zinc-800 text-zinc-300 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
          onChange={(e) => {
            onChange(e);
          }}
          loadingMessage={() => "Loading..."}
          isLoading={isLoading}
          unstyled
          placeholder={"Add Keywords..."}
          classNames={{
            valueContainer(props) {
              return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${props.selectProps.classNamePrefix
                ? props.selectProps.classNamePrefix + "-value-container"
                : ""
                }`;
            },
            multiValue() {
              return `border px-2 rounded-xl px-1 flex items-center text-sm`;
            },
            container({ isFocused }) {
              return `w-full bg-zinc-800 rounded ${isFocused
                ? "ring-2 ring-amber-700"
                : "hover:ring-zinc-600 hover:ring-2"
                } `;
            },
            menuList() {
              return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
            },
            option() {
              return `hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
            },
          }}
        />
      )}
    </>
  );
};

export default PermissionsSettingsPage;
