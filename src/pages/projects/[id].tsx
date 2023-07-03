import { SignedIn } from "@clerk/nextjs";
import {
  ArrowRightIcon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type { Equipment, Tag } from "@prisma/client";
import * as Slider from "@radix-ui/react-slider";
import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

import { TagsMultiselectDropdown } from "~/components/TagDropdown";
import { ButtonCallToActionComponent, ButtonDeleteAction, InputComponent, TextareaComponent, style } from "~/components/input";

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
}


const EditProjectPage = function ({ id }: { id: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [manHours, setManHours] = useState("");

  const [percentComplete, setPercentComplete] = useState(10);

  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [jobNumberError, setJobNumberError] = useState("");
  const [notesError, setNotesError] = useState("");

  const [addressError, setAddressError] = useState("");
  const [cityError, setCityError] = useState("");
  const [stateError, setStateError] = useState("");

  const [manHoursError, setManHoursError] = useState("");

  const [percentCompleteError, setPercentCompleteError] = useState("");

  const [statusError, setStatusError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");


  const { data: project, isLoading, isError } = api.projects.getById.useQuery({ id });

  const [tags, setTags] = useState([] as Tag[]);

  api.tags.getTagsToAdd.useQuery({
    type: "projects",
  });

  const router = useRouter();

  const projectContext = api.useContext().projects;
  const tagsContext = api.useContext().tags;

  const { mutate, isLoading: isDeleting } = api.projects.delete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} deleted successfully!`);
      void projectContext.invalidate();
      void tagsContext.invalidate();
      void router.back();
    },
    onError: (e) => {
      toast.error(e.message);
    }
  })

  const deleteProject = useCallback(() => {

    if (!project) {
      toast.error("Something went wrong! Please try again later");
      return;
    }

    mutate({
      id: project.id
    });
  }, [mutate, project]);

  const mutation = api.projects.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} updated successfully!`);
      void projectContext.invalidate();
      void tagsContext.invalidate();
      void router.back();
    },

    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
        toast.error(e.message);
        return;
      }
      else {
        toast.error("There were a few errors, please check the form and try again.")
      }

      for (const key in errorMessage) {
        // toast.error(errorMessage?[key][0] || "there was an api error");
        const keyMessage = errorMessage[key]

        if (keyMessage) {

          const message = keyMessage[0] || "";

          switch (key) {
            case "name":
              setNameError(message);
              break;
            case "description":
              setDescriptionError(message);
              break;
            case "jobNumber":
              setJobNumberError(message);
              break;
            case "notes":
              setNotesError(message);
              break;
            case "address":
              setAddressError(message);
              break;
            case "city":
              setCityError(message);
              break;
            case "state":
              setStateError(message);
              break;
            case "manHours":
              setManHoursError(message);
              break;
            case "percentComplete":
              setPercentCompleteError(message);
              break;
            case "status":
              setStatusError(message);
              break;
            case "startDate":
              setStartDateError(message);
              break;
            case "endDate":
              setEndDateError(message);
              break;
            default:
              toast.error(message);
              break;
          }
        }
        else {
          toast.error("Something went wrong! Please try again later");
        }
      }
    },
  });

  useMemo(() => {
    if (project == null) return;

    if (project.name) {
      setName(project.name);
    }
    if (project.description) {
      setDescription(project.description);
    }

    if (project.jobNumber) {
      setJobNumber(project.jobNumber);
    }

    if (project.notes) {
      setNotes(project.notes);
    }

    if (project.address) {
      setAddress(project.address);
    }

    if (project.city) {
      setCity(project.city);
    }

    if (project.state) {
      setState(project.state);
    }

    if (project.status) {
      setStatus(project.status);
    }

    if (project.startDate) {
      setStartDate(formatDate(project.startDate));
    }

    if (project.endDate) {
      setEndDate(formatDate(project.endDate));
    }

    if (project.percentComplete) {
      setPercentComplete(project.percentComplete);
    }

    if (project.TotalManHours) {
      setManHours(project.TotalManHours.toString());
    }

    const tags = project.tags;
    if (tags) setTags(tags);
  }, [project]);

  if ((!project || isLoading) && !isError) {
    return (

      <main className="min-w-screen min-h-screen bg-zinc-800">
        <NewItemPageHeader
          title={`Loading...`}
          context="projects"
          cancel={() => void router.back()}
        />
        <LoadingPage />
      </main>
    );
  }
  else if (isError) {
    return (
      <main className="min-w-screen min-h-screen bg-zinc-800">
        <NewItemPageHeader
          title={`Error loading project`}
          context="projects"
          cancel={() => void router.back()}
        />
      </main>
    );
  }

  const getTagIds = () => {

    const tagIds = tags.map((tag) => tag.id);

    return tagIds;
  }

  if (!project) {
    return (
      <main className="min-w-screen min-h-screen bg-zinc-800">
        <LoadingPage />
      </main>
    )
  }

  const SaveChanges = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const tags = getTagIds();

    setNameError("");
    setDescriptionError("");
    setJobNumberError("");
    setNotesError("");
    setAddressError("");
    setCityError("");
    setStateError("");
    setManHoursError("");
    setPercentCompleteError("");
    setStatusError("");
    setStartDateError("");
    setEndDateError("");


    mutation.mutate({
      id: project.id,
      estimatedManHours: parseInt(manHours || "0"),
      name,
      description,
      jobNumber,
      tags,
      address,
      city,
      state,
      startDate: start,
      endDate: end,
      status,
      notes,
      percentComplete
    });

    toast.loading("Saving changes...", { duration: 2000 });
  }

  return (
    <>
      <Head>
        <title>{`Editing ${project.name} (Project) - War Manager`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-w-screen min-h-screen bg-zinc-900">
        <NewItemPageHeader
          title={`${project?.name} (Project)`}
          save={SaveChanges}
          cancel={() => void router.back()}
          saving={mutation.isLoading}
        />
        <div className="flex items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center gap-4 p-2 sm:w-3/5">
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Name</h1>
              <InputComponent autoFocus type="text" error={nameError} disabled={isLoading} value={name} onChange={(e) => { setName(e.currentTarget.value) }} />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Job Code</h1>
              <InputComponent type={"text"} error={jobNumberError} disabled={isLoading} value={jobNumber} onChange={(e) => { setJobNumber(e.currentTarget.value) }} />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Description</h1>
              <InputComponent type={"text"} error={descriptionError} disabled={isLoading} value={description} onChange={(e) => { setDescription(e.currentTarget.value) }} />
            </div>

            <div className="flex w-full flex-col gap-2 p-2">
              <h1 className="text-lg font-semibold">Tags</h1>
              <div className="flex gap-2">
                <TagsMultiselectDropdown type={"projects"} savedTags={tags} onSetTags={(e) => { setTags(e); console.log("tags", e) }} />
              </div>
            </div>

            <div className="h-10"></div>

            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Address</h1>
              <InputComponent error={addressError} disabled={isLoading} value={address} onChange={(e) => { setAddress(e.currentTarget.value) }} />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">City</h1>
              <InputComponent error={cityError} disabled={isLoading} value={city} onChange={(e) => { setCity(e.currentTarget.value) }} />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">State</h1>
              <InputComponent error={stateError} disabled={isLoading} value={state} onChange={(e) => { setState(e.currentTarget.value) }} />
            </div>

            <div className="h-10"></div>

            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Estimated Man Hours</h1>
              <InputComponent error={manHoursError} disabled={isLoading} value={manHours} onChange={(e) => { setManHours(e.currentTarget.value) }} />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Project Timeline</h1>
              <div className="flex items-center gap-4">
                <div className="w-full">
                  <p className="px-2 italic text-zinc-300">Projected Start</p>
                  <InputComponent error={startDateError} disabled={isLoading} value={startDate} onChange={(e) => { setStartDate(e.currentTarget.value) }} />
                </div>
                <ArrowRightIcon className="h-10 w-10 pt-5" />
                <div className="w-full">
                  <p className="px-2 italic text-zinc-300">Projected End</p>
                  <InputComponent error={endDateError} disabled={isLoading} value={endDate} onChange={(e) => { setEndDate(e.currentTarget.value) }} />
                </div>
              </div>
            </div>

            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Status</h1>
              <select
                className="w-full rounded p-2 text-zinc-200 outline-none bg-zinc-800 ring-2 ring-zinc-700 hover:ring-zinc-600 focus:ring-amber-600"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={false}
              >
                <option value="">select one:</option>
                <option value="100% Complete">100% Complete</option>
                <option value="Awaiting Phase 2">Awaiting Phase 2</option>
                <option value="Closeout Phase">Closeout Phase</option>
                <option value="In Progress: Bad">In Progress: Bad</option>
                <option value="In Progress: Good">In Progress: Good</option>
                <option value="Jr Punch List">JR Punch List</option>
                <option value="Legal">Legal</option>
                <option value="MF Inspection">MF Inspection</option>
                <option value="MF Punch List">MF Punch List</option>
                <option value="Start 2 Weeks">Start 2 Weeks</option>
                <option value="Start 30 Days">Start 30 Days</option>
                <option value="Start 60 Days">Start 60 Days</option>
                <option value="Start 90+ Days">Start 90+ Days</option>
              </select>
              <p className="text-red-500">{statusError}</p>
            </div>

            <div className={`w-full p-2  ${!percentCompleteError ? "" : " bg-red-900/30 rounded-lg"}`}>
              <h1 className="text-lg font-semibold">Percent Complete</h1>
              <p>{percentComplete || 0} %</p>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                defaultValue={[percentComplete]}
                max={100}
                step={1}
                onValueChange={(value) => setPercentComplete(value[0] || 0)}
              >
                <Slider.Track className="bg-zinc-700 relative grow rounded-full h-[3px]">
                  <Slider.Range className="absolute bg-amber-800 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-zinc-500 rounded-[10px] hover:bg-violet3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  aria-label="Volume"
                />
              </Slider.Root>
              <p className="text-red-500"> {percentCompleteError}</p>
            </div>


            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Notes/Concerns</h1>
              <TextareaComponent disabled={isLoading} error={notesError} value={notes} onChange={(e) => { setNotes(e.currentTarget.value) }} />
            </div>

            <div className="w-full p-2">

              <ButtonCallToActionComponent disabled={isLoading} onClick={SaveChanges} >
                {mutation.isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="flex gap-2">
                    <p>Save</p> <CloudArrowUpIcon className="h-6 w-6" />
                  </div>
                )}
              </ButtonCallToActionComponent>
            </div>
            <ButtonDeleteAction title="Delete Project?"
              description="Are you sure you want to delete this project? After deletion, the project cannot be recovered."
              disabled={isLoading} yes={deleteProject} loading={isDeleting} />
          </div>
        </div>
      </main>
    </>
  );
};

type JobData = {
  equipment: Equipment[];
  other: string[];
};

type EquipmentEstimation = {
  id: string;
  name: string;
  quantity: string;
  type: string;
};


//props: { data?: JobData | [] }
const EquipmentEditor = () => {
  // if (!props.data) {
  //   return (
  //     <div className="w-full rounded bg-white p-2 font-semibold italic text-zinc-500">
  //       no data...
  //     </div>
  //   );
  // }

  const [name, setName] = useState("Dumpster");
  const [quantity, setQuantity] = useState("1");
  const [type, setType] = useState("Dumpster");

  const [equipment, setEquipment] = useState<EquipmentEstimation[]>([]);

  // const data = props.data ?? [];

  // const equipment = data { equipment } as Equipment[];

  // console.log("equipment", equipment);

  const typeInputRef = useRef<HTMLInputElement>(null);

  const AddToEquipment = () => {
    setEquipment((prev) => [
      ...prev,
      { id: equipment.length.toString(), name, quantity, type },
    ]);
    setName("");
    setQuantity("1");
    setType("");
    if (typeInputRef.current) typeInputRef.current.focus();
  };

  const RemoveFromEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="flex flex-col border-t border-zinc-700">
      {equipment.map((e) => (
        <div
          className="flex w-full gap-2 border-x border-b border-zinc-700 p-2 text-white"
          key={e.id}
        >
          <p>{e.quantity}</p>
          <p className="w-full">{e.type}</p>
          <button onClick={() => RemoveFromEquipment(e.id)}>
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>
      ))}
      <div className="p-1"></div>
      <div className="flex gap-2">
        <input
          className={`${style}`}
          value={type}
          id="type"
          type="text"
          placeholder="name or type of equipment"
          onChange={(e) => setType(e.target.value)}
          disabled={false}
          ref={typeInputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              AddToEquipment();
            }
          }}
        />
        <input
          className={`${style} w-1/6`}
          value={quantity}
          type="number"
          onChange={(e) => setQuantity(e.target.value)}
          disabled={false}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              AddToEquipment();
            }
          }}
        />
      </div>
      <button
        onClick={AddToEquipment}
        className="mt-2 flex w-full items-center justify-center rounded bg-zinc-600 p-2 hover:bg-zinc-500"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

const ViewProjectPage = function ({ id }: { id: string }) {
  const { data: project } = api.projects.getById.useQuery({ id });

  if (project == null) {
    return <div>Project not found</div>;
  }

  return (
    <>
      <Head>
        <title>{`Editing ${project.name} (Project) - War Manager`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-w-screen min-h-screen bg-zinc-800">
        <NewItemPageHeader
          title={`${project?.name} (Project)`}
          context="projects"
        />
        <SignedIn>
          <div className="flex items-start justify-start gap-4 p-4">
            <div className="h-1/4 w-1/4 shadow">
              <h2 className="bg-amber-700 p-1 text-lg font-bold">
                Identification
              </h2>
              <div className="bg-zinc-700 p-1">
                <div className="p-1">
                  <p className="text-md font-semibold">Name</p>
                  <p>{project.name}</p>
                </div>
                <div className="p-1">
                  <p className="text-md font-semibold">Job Code</p>
                  <p>{project.jobNumber}</p>
                </div>
                <div className="p-1">
                  <p className="text-md font-semibold">Description</p>
                  <p>{project.description}</p>
                </div>
              </div>
            </div>
            <div className="h-1/4 w-1/4 shadow">
              <h2 className="bg-amber-700 p-1 text-lg font-bold">Location</h2>
              <div className="bg-zinc-700 p-1">
                <div className="p-1">
                  <p className="text-md font-semibold">Address</p>
                  <p>{project.address}</p>
                </div>
                <div className="p-1">
                  <p className="text-md font-semibold">City</p>
                  <p>{project.city}</p>
                </div>
                <div className="p-1">
                  <p className="text-md font-semibold">State</p>
                  <p>{project.state}</p>
                </div>
              </div>
            </div>
            <div className="h-1/4 w-1/4 shadow">
              <h2 className="bg-amber-700 p-1 text-lg font-bold">Details</h2>
              <div className="bg-zinc-700 p-1">
                <div className="p-1">
                  <p className="text-md font-semibold">Timeline</p>
                  <div className="flex items-center gap-2">
                    <p>{project.startDate.toLocaleDateString()}</p>
                    <ArrowRightIcon className="h-4 w-4" />
                    <p>{project.endDate.toLocaleDateString()}</p>
                    {project.endDate < new Date() ? (
                      <p className="italic text-red-600">**Past Due</p>
                    ) : (
                      <p className="italic text-green-600">
                        {Math.round(
                          (project.endDate.getTime() - new Date().getTime()) /
                          (1000 * 3600 * 24)
                        )}
                        <span className="p-1">Days Left</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1/4 w-1/4 shadow">
              <h2 className="bg-amber-700 p-1 text-lg font-bold">
                Notes/Concerns
              </h2>
              <div className="bg-zinc-700 p-1">
                <div className="p-1">
                  <p>{project.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </>
  );
};

const SingleProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const [edit] = useState(true);

  if (edit) {
    return <EditProjectPage id={id} />;
  } else {
    return <ViewProjectPage id={id} />; //setEdit={setEdit} />;
  }
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
