import { api } from "~/utils/api";
import { useState, useMemo } from "react";
import type { CrewMember, Project, Sector, Tag } from "@prisma/client";

export type CrewWithTagsType = {
  tags: Tag[];
} & CrewMember;

export type ProjectWithTagsType = {
  tags: Tag[];
  sectors: Sector[];
} & Project;

const useLiveData = () => {
  const [crewData, setCrewData] = useState<CrewWithTagsType[]>([]);
  const [projectData, setProjectData] = useState<ProjectWithTagsType[]>([]);

  const {
    data: crewMembers,
    isLoading: loadingCrew,
    isError: errorCrew,
  } = api.crewMembers.getAll.useQuery(); //could be inefficient to fetch all crew members and projects for every blueprint - TODO fix
  const {
    data: projects,
    isLoading: loadingProjects,
    isError: errorProjects,
  } = api.projects.getAll.useQuery({
    statusFilter: "Active",
  });

  useMemo(() => {
    if (!crewMembers || !projects) return;

    setCrewData(crewMembers);
    setProjectData(projects);
  }, [crewMembers, projects]);

  const isLoading = loadingCrew || loadingProjects;
  const isError = errorCrew || errorProjects;

  return { crewData, projectData, isLoading, isError };
};

export default useLiveData;
