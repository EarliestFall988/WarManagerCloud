import { type CrewMember, type Project } from "@prisma/client";
import { env } from "process";
import type { Node } from "reactflow";

interface Description {
  name: string;
  value: string;
}

interface ICard {
  name: string;
  type: "body" | "header";
  descriptions: Description[];
}

interface ISchedule {
  title: string;
  description: string;
  content: ICard[];
}

function isCrew(
  nodeOfInterest: CrewMember | Project | undefined
): nodeOfInterest is CrewMember {
  return (nodeOfInterest as CrewMember).position !== undefined;
}

function isProject(
  nodeOfInterest: CrewMember | Project | undefined
): nodeOfInterest is Project {
  return (nodeOfInterest as Project).jobNumber !== undefined;
}

const CreateSchedule = async (
  title: string,
  notes: string,
  nodesString: string
) => {
  const nodes = JSON.parse(nodesString) as Node[];

  const schedule: ISchedule = {
    title,
    description: notes,
    content: [],
  };

  for (const node of nodes) {
    const nodeOfInterest = node.data as CrewMember | Project | undefined;

    if (!nodeOfInterest) {
      continue;
    }

    const card: ICard = {
      name: nodeOfInterest.name,
      type: "body",
      descriptions: [],
    };

    const projectCard: ICard = {
      name: nodeOfInterest.name,
      type: "header",
      descriptions: [],
    };

    if (isProject(nodeOfInterest)) {
      const address: Description = {
        name: "Address",
        value: nodeOfInterest.address,
      };

      const cityState: Description = {
        name: "City/State",
        value: nodeOfInterest.city + ", " + nodeOfInterest.state,
      };

      projectCard.descriptions.push(address);
      projectCard.descriptions.push(cityState);

      schedule.content.push(projectCard);
    } else if (isCrew(nodeOfInterest)) {
      const position: Description = {
        name: "Position",
        value: nodeOfInterest.position,
      };

      const phone: Description = {
        name: "Phone",
        value: nodeOfInterest.phone,
      };

      const email: Description = {
        name: "Email",
        value: nodeOfInterest.email,
      };

      card.descriptions.push(position);
      card.descriptions.push(phone);
      card.descriptions.push(email);

      schedule.content.push(card);
    }
  }

  const createURL = env.WM_SCHEDULE_CREATOR_URL;
  const getURL = env.WM_SCHEDULE_GETTER_URL;

  if (!createURL) {
    throw new Error("WM_SCHEDULE_CREATOR_URL is not defined");
  }

  if (!getURL) {
    throw new Error("WM_SCHEDULE_GETTER_URL is not defined");
  }

  const link = await fetch(`${createURL.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schedule),
  })
    .then((res) => res.text())
    .then((text) => {
      const url = `${getURL.toString()}?id=${text}`;
      return url;
    })
    .catch((err) => console.log(err));

  if (!link) {
    throw new Error("Failed to create schedule");
  }

  return link;
};

export default CreateSchedule;
