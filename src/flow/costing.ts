import { type Node } from "reactflow";

export let blueprintNodes = [] as Node[];

export const getCrewCost = () => {
  let count = 0;
  const avgCost = 38;
  blueprintNodes.forEach((node) => {
    if (node.type && node.type === "crewNode") {
      count += 1;
    }
  });

  return {
    count,
    hourly: count * avgCost,
    daily: count * avgCost * 8,
    weekly: count * avgCost * 40,
  };
};

export const setBlueprintNodes = (Nodes: Node[]) => {
  if (Nodes.length === 0) return;

  const result = Nodes.map((node) => {
    if (node.type && node.type === "crewNode") {
      return node;
    }
  }).filter((n) => n) as Node[];

  blueprintNodes = result;
};

// const getProjectCount = (Nodes: Node[]) => {
//   let count = 0;
// //   const avgCost = 38;
//   Nodes.forEach((node) => {
//     if (node.type && node.type === "projectNode") {
//       count += 1;
//     }
//   });

//   return {
//     count,
//   };
// };
