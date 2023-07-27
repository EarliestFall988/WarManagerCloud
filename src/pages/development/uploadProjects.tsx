import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { parse } from "papaparse";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";

type projectData = {
  Job: string;
  "Job Address City": string;
  "Job Address State": string;
  "Job Name": string;
};

type crewData = {
  position: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  start_date: string;
  last_raise: string;
};

export const Projects = () => {
  //   const [file, setFile] = useState<File | null>(null);
  const [isDeveloper, setIsDeveloper] = useState(false);


  const { user } = useUser();

  const { mutate } = api.projects.createMany.useMutation({
    onSuccess: () => {
      toast.success("Projects uploaded");
    },

    onError: (error) => {
      console.log(error);
      toast.error("there was an error uploading the projects");
    },
  });

  const { mutate: crewMutate } = api.crewMembers.createMany.useMutation({
    onSuccess: () => {
      toast.success("Crew uploaded");
    },

    onError: (error) => {
      console.log(error);
      toast.error("there was an error uploading the Crews");
    },
  });

  React.useMemo(() => {
    if (user?.emailAddresses[0]?.emailAddress === "taylor.howell@jrcousa.com") {
      setIsDeveloper(true);
    } else {
      setIsDeveloper(false);
    }
  }, [user]);

  const uploadProjectData = (files: FileList | null) => {
    if (!files) {
      toast.error("No file selected");
      return;
    }

    const file = files[0];

    if (file === undefined) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "text/csv") {
      toast.error("File must be a CSV");
      return;
    }

    parse<projectData>(file, {
      header: true,
      complete: function (results) {
        const d = results.data.map((item) => {
          return {
            jobNumber: item.Job,
            name: item["Job Name"] || "",
            city: item["Job Address City"] || "",
            state: item["Job Address State"] || "",
          };
        });

        mutate(d);
      },
    });
  };

  const uploadCrewData = (files: FileList | null) => {
    if (!files) {
      toast.error("No file selected");
      return;
    }

    const file = files[0];

    if (file === undefined) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "text/csv") {
      toast.error("File must be a CSV");
      return;
    }

    parse<crewData>(file, {
      header: true,
      complete: function (results) {
        const d = results.data.map((item) => {
          let lastReviewDate = undefined;
          if (item.last_raise) {
            lastReviewDate = new Date(item.last_raise);
          }
          if (item.first_name === "") {
            return {
                name: "",
                position: "",
                phone: "",
                startDate: new Date(),
                lastReviewDate: lastReviewDate,
            };
          } else {
            return {
              name: `${item.first_name} ${item.middle_name} ${item.last_name}`,
              position: item.position || "",
              phone: item.phone_number || "",
              startDate: new Date(item.start_date),
              lastReviewDate: lastReviewDate,
            };
          }
        });

       const data = d.filter((item) => item !== undefined && item !== null && item.name !== "");

        console.log(d);

        crewMutate(data);
      },
    });
  };

  return (
    <div className="min-h-[100vh] w-full bg-zinc-900 p-2 py-10">
      {isDeveloper && (
        <div className="flex w-1/3 flex-col items-start justify-start gap-2">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <input
            type="file"
            onChange={(e) => {
              uploadProjectData(e.target.files);
            }}
            className="focus:border-primary focus:shadow-te-primary dark:focus:border-primary relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-zinc-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-zinc-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-zinc-100 file:px-3 file:py-[0.32rem] file:text-zinc-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-zinc-200 focus:text-zinc-700 focus:outline-none dark:border-zinc-600 dark:text-zinc-200 dark:file:bg-zinc-700 dark:file:text-zinc-100"
          />

          <h1 className="text-3xl font-semibold">Crew Members</h1>
          <input
            type="file"
            onChange={(e) => {
              uploadCrewData(e.target.files);
            }}
            className="focus:border-primary focus:shadow-te-primary dark:focus:border-primary relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-zinc-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-zinc-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-zinc-100 file:px-3 file:py-[0.32rem] file:text-zinc-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-zinc-200 focus:text-zinc-700 focus:outline-none dark:border-zinc-600 dark:text-zinc-200 dark:file:bg-zinc-700 dark:file:text-zinc-100"
          />
          <p>Data uploads as soon as the file is chosen</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
