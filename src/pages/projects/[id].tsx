import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { stat } from "fs";
import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const SingleProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobNumber, setJobNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: project } = api.projects.getById.useQuery({ id });

  const mutation = api.projects.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} updated successfully!`);
    },
  });

  useEffect(() => {
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
      setStartDate(project.startDate.toString());
    }

    if (project.endDate) {
      setEndDate(project.endDate.toString());
    }
  }, [project]);

  if (project === undefined || project === null) {
    return <LoadingPage />;
  }

  return (
    <div className="min-w-screen min-h-screen bg-zinc-800">
      <NewItemPageHeader title={`${project?.name}`} context="projects" />
      <div className="flex items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center gap-4 p-2 sm:w-3/5">
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Name</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              type="text"
              value={name}
              disabled={false}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Job Number</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={jobNumber}
              type="text"
              onChange={(e) => setJobNumber(e.target.value)}
              disabled={false}
            />
          </div>
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Description</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={description}
              type="text"
              onChange={(e) => setDescription(e.target.value)}
              disabled={false}
            />
          </div>

          <div className="h-10"></div>

          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Address</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={address}
              type="text"
              onChange={(e) => setAddress(e.target.value)}
              disabled={false}
            />
          </div>
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">City</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={city}
              type="text"
              onChange={(e) => setCity(e.target.value)}
              disabled={false}
            />
          </div>
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">State</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={state}
              type="text"
              onChange={(e) => setState(e.target.value)}
              disabled={false}
            />
          </div>

          <div className="h-10"></div>

          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Project Timeline</h1>
            <div className="flex items-center gap-4">
              <div className="w-full">
                <p className="px-2 italic text-zinc-300">Projected Start</p>
                <input
                  className="w-full rounded p-2 text-stone-800 outline-none"
                  value={startDate}
                  type="date"
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={false}
                />
              </div>
              <ArrowRightIcon className="h-10 w-10 pt-5" />
              <div className="w-full">
                <p className="px-2 italic text-zinc-300">Projected End</p>
                <input
                  className="w-full rounded p-2 text-stone-800 outline-none"
                  value={endDate}
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={false}
                />
              </div>
            </div>
          </div>

          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Status</h1>
            <select
              className="w-full rounded p-2 text-stone-800 outline-none"
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
          </div>

          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Notes/Concerns</h1>
            <textarea
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={false}
            />
          </div>

          <div className="w-full p-2">
            <button
              disabled={mutation.isLoading}
              onClick={() => {
                const start = new Date(startDate);
                const end = new Date(endDate);

                mutation.mutate({
                  id: project.id,
                  name,
                  description,
                  jobNumber,
                  address,
                  city,
                  state,
                  startDate: start,
                  endDate: end,
                  status,
                  notes,
                });
                toast.loading("Saving changes...", { duration: 1000 });
              }}
              className="flex h-10 w-full items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 font-semibold text-white hover:from-amber-600 hover:to-red-600"
            >
              {mutation.isLoading ? <LoadingSpinner /> : <p>Save Changes</p>}
            </button>
          </div>
        </div>
      </div>
    </div>
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
