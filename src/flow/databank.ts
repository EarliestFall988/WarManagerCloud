import { api } from "~/utils/api";
import { useState, useMemo } from "react";
import type {
  CrewMember,
  Equipment,
  Project,
  Sector,
  Tag,
} from "@prisma/client";

export type CrewWithTagsType = {
  tags: Tag[];
} & CrewMember;

export type ProjectWithTagsType = {
  tags: Tag[];
  sectors: Sector[];
} & Project;
export type EquipmentWithTagsType = {
  tags: Tag[];
} & Equipment;

const useLiveData = () => {
  const [crewData, setCrewData] = useState<CrewWithTagsType[]>([]);
  const [projectData, setProjectData] = useState<ProjectWithTagsType[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentWithTagsType[]>(
    []
  );

  const {
    data: crewMembers,
    isLoading: loadingCrew,
    isError: errorCrew,
  } = api.crewMembers.getAll.useQuery(); //could be inefficient to fetch all crew members and projects for every blueprint - TODO fix
  const {
    data: projects,
    isLoading: loadingProjects,
    isError: errorProjects,
  } = api.projects.getAll.useQuery();

  const {
    data: equipment,
    isLoading: loadingEquipment,
    isError: errorEquipment,
  } = api.equipment.getAll.useQuery();

  useMemo(() => {
    if (!crewMembers || !projects || !equipment) return;

    setCrewData(crewMembers);
    setProjectData(projects);
    setEquipmentData(equipment);
  }, [crewMembers, projects, equipment]);

  const isLoading = loadingCrew || loadingProjects || loadingEquipment;
  const isError = errorCrew || errorProjects || errorEquipment;

  return { crewData, projectData, isLoading, isError, equipmentData };
};

export default useLiveData;
