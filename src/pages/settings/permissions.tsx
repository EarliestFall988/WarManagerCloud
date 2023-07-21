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
import { InputComponent } from "~/components/input";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Select from "react-select";
import { type DropdownTagType } from "~/components/TagDropdown";
import { type MultiValue } from "react-select";
import { toast } from "react-hot-toast";
import autoAnimate from "@formkit/auto-animate";
import TooltipComponent from "~/components/Tooltip";

const PermissionsSettingsPage: NextPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  const { data, isLoading, isError } =
    api.permissions.getAllPermissions.useQuery();

  console.log("data", data);

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

  const keywords = (data: string) => {
    return JSON.parse(data) as DropdownTagType[];
  };

  return (
    <SettingsLayout>
      <div className="min-h-[30vh]">
        <div className="flex items-center justify-between rounded bg-zinc-700 pl-1 font-semibold text-zinc-200">
          {isLoading && <LoadingSpinner />}
          {!isLoading && data && data.length === 0 && (
            <p>No permissions found</p>
          )}
          {!isLoading && data && data.length > 0 && (
            <p>Permissions found: {data.length}</p>
          )}
          <NewPermissionsModal />
        </div>
        {data?.map((permission) => (
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
                  {keywords(permission.keywords).map((keyword) => (
                    <div
                      key={keyword.value}
                      className={`rounded border ${keyword.color} flex items-center whitespace-nowrap rounded-xl px-2 text-xs`}
                    >
                      {keyword.label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <p className="text-sm text-zinc-400">
                    {permission.description || "<no description>"}
                  </p>
                  <p className="text-sm text-zinc-400">{"|"}</p>
                  <p className="text-sm text-zinc-400">
                    {permission.user?.email || "<no user>"}
                  </p>
                </div>
              </div>
              <div>
                <p className="hidden text-sm font-semibold text-zinc-300 md:block">
                  {permission.updatedAt.toDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsLayout>
  );
};

const NewPermissionsModal = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<DropdownTagType[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [keywordError, setKeywordError] = useState("");

  const permissionsContext = api.useContext().permissions;

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
      },
    });

  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current, { duration: 200 });
  }, []);

  const SaveChanges = useCallback(() => {
    const data = keywords.map((keyword) => {
      return {
        value: parseInt(keyword.value),
        color: keyword.color,
        label: keyword.label,
      };
    });

    console.log(name);

    setNameError("");
    setDescriptionError("");
    setKeywordError("");

    mutate({
      name,
      description,
      keywords: data,
    });
  }, [mutate, name, description, keywords]);

  return (
    <Dialog.Root open={dialogOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={() => {
            setDialogOpen(true);
          }}
          className="rounded p-2 hover:bg-zinc-600"
        >
          <PlusIcon className="h-6 w-6 text-zinc-100" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-0 z-30 backdrop-blur-sm data-[state=open]:animate-overlayDrawerShow md:bg-black/10" />
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content className="fixed right-[-50%] top-[50%] z-30 h-[100vh] w-[100vw] translate-x-[-50%] translate-y-[-50%] rounded-lg  border-l border-zinc-700 bg-zinc-900 p-4 focus:outline-none data-[state=open]:animate-slide lg:right-[-25%] lg:w-[50vw]">
          <div ref={parent}>
            {!isSaving && (
              <div>
                <div className="flex items-center justify-between">
                  <Dialog.Title className="select-none text-2xl font-semibold text-zinc-200">
                    Create New Permission
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
                      className={`${
                        keywordError
                          ? "rounded border-b-2 border-red-500 pb-[2px]"
                          : ""
                      }`}
                    >
                      <KeywordsMultiSelect
                        OnSetKeywords={(e) => {
                          setKeywords(e);
                        }}
                      />
                    </div>
                  </TooltipComponent>
                  <p className="p-1 text-sm text-red-500">{keywordError}</p>
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => {
                      SaveChanges();
                    }}
                    className="rounded bg-amber-800 p-2 text-zinc-100 transition-all duration-100 hover:bg-amber-700"
                  >
                    Create Permission
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
              </div>
            )}
            {isSaving && (
              <div className="flex h-full w-full items-center justify-center">
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
}> = ({ OnSetKeywords }) => {
  const [currentTags, setCurrentTags] = useState<DropdownTagType[]>([]);
  const [allTags, setAllTags] = useState<DropdownTagType[]>([]);

  useMemo(() => {
    setAllTags([
      {
        value: "1",
        label: "View/Edit/Delete Crews",
        color: "border-green-500 text-green-500",
      },
      {
        value: "2",
        label: "View/Edit/Delete Blueprints",
        color: "border-purple-500 text-purple-500",
      },
      {
        value: "3",
        label: "View/Edit/Delete Projects",
        color: "border-red-500 text-red-500",
      },
      {
        value: "4",
        label: "Download Data",
        color: "border-orange-500 text-orange-500",
      },
      {
        value: "5",
        label: "View/Edit/Delete Users",
        color: "border-sky-500 text-sky-500",
      },
      {
        value: "6",
        label: "Beta Tester 🧪",
        color: "border-yellow-500 text-yellow-500",
      },
      {
        value: "7",
        label: "Mostly Office Work 👨🏻‍💻",
        color: "border-zinc-300 text-zinc-300 ",
      },
      {
        value: "8",
        label: "Mostly Field Work 🏃",
        color: "border-orange-500 text-orange-500",
      },
      {
        value: "9",
        label: "Executive Level Access",
        color: "border-teal-500 text-cyan-300",
      },
    ]);
  }, []);

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
    <Select
      closeMenuOnSelect={false}
      defaultValue={currentTags}
      isMulti
      name="currentTags"
      options={allTags}
      value={currentTags}
      classNamePrefix="select"
      className="w-full rounded bg-zinc-800 text-zinc-300 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
      onChange={(e) => {
        onChange(e);
      }}
      unstyled
      placeholder={"Add Keywords..."}
      classNames={{
        valueContainer(props) {
          return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${
            props.selectProps.classNamePrefix
              ? props.selectProps.classNamePrefix + "-value-container"
              : ""
          }`;
        },
        multiValue(props) {
          return `border ${props.data.color} px-2 rounded-xl px-1 flex items-center text-sm`;
        },
        container({ isFocused }) {
          return `w-full bg-zinc-800 rounded ${
            isFocused
              ? "ring-2 ring-amber-700"
              : "hover:ring-zinc-600 hover:ring-2"
          } `;
        },
        menuList() {
          return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
        },
        option(props) {
          return `hover:bg-zinc-800 ${props.data.color} hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
        },
      }}
    />
  );
};

export default PermissionsSettingsPage;
