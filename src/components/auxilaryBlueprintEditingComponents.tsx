import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";

export const ProjectsList = () => {
  const { data, isLoading, isError } = api.projects.getAll.useQuery();

  console.log(data);

  return (
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center sm:text-lg font-bold ">Projects</h1>
      <div className="flex flex-col gap-1 pr-1">
        {isLoading && <LoadingSpinner />}
        {isError && <div>Something went wrong</div>}
        {data?.map((project) => (
          <button
            className="t flex items-center justify-between bg-zinc-600 px-2 text-left hover:bg-zinc-500"
            key={project.id}
          >
            <p className="truncate py-2 text-sm sm:w-1/2 sm:text-lg">
              {project.name}
            </p>
            <p className="hidden w-1/2 truncate font-normal italic tracking-tight sm:flex">
              {project.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export const CrewList = () => {
  const { data, isLoading, isError } = api.crewMembers.getAll.useQuery();

  console.log(data);

  return (
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center sm:text-lg font-bold">Crew Members</h1>
      <div className="flex flex-col gap-1 pr-1">
        {isLoading && <LoadingSpinner />}
        {isError && <div>Something went wrong</div>}
        {data?.map((crew) => (
          <button
            className="t flex items-center justify-between bg-zinc-600 px-2 text-left hover:bg-zinc-500"
            key={crew.id}
          >
            <p className="truncate py-2 text-sm sm:text-lg sm:w-1/2">{crew.name}</p>
            <p className="hidden w-1/2 truncate font-normal italic tracking-tight sm:flex">
              {crew.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
