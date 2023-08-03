import TooltipComponent from "~/components/Tooltip";
import useNodesStateSynced from "./useNodesStateSynced";
import { useState, useCallback } from "react";
import {
  FireIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

const Costing: React.FC<{ blueprintId: string }> = ({ blueprintId }) => {
  const [nodes, onNodesChange] = useNodesStateSynced(blueprintId);

  const getCrewCount = useCallback(() => {
    let count = 0;

    nodes.forEach((node) => {
      if (node.type === "crewNode") {
        count++;
      }
    });

    return count;
  }, [nodes]);

  const getProjectCount = useCallback(() => {
    let count = 0;

    nodes.forEach((node) => {
      if (node.type === "projectNode") {
        count++;
      }
    });

    return count;
  }, [nodes]);

  return (
    <div className="fixed bottom-0 flex w-full select-none flex-wrap-reverse items-center justify-center text-xs md:gap-4 md:text-base">
      <div className="flex items-center rounded-2xl border border-zinc-500 bg-black/50 px-1 backdrop-blur md:-translate-y-4 md:gap-2 md:px-2">
        <div className="flex items-center justify-center md:gap-2">
          <UserCircleIcon className="inline-block h-5 w-5" />
          <div className="h-5 border-l border-zinc-500" />
        </div>
        <div className="flex md:gap-2 ">
          <TooltipComponent content="Crew count" side="top">
            <div className="flex items-center rounded-2xl transition duration-200 hover:scale-110 hover:bg-amber-800 md:px-2">
              <p>{getCrewCount()}</p>
            </div>
          </TooltipComponent>
          <TooltipComponent content="burn rate at $38 avg wage" side="top">
            <div className="flex items-center rounded-2xl transition duration-200 hover:scale-110 hover:bg-amber-800 md:px-2">
              <FireIcon className="inline-block h-5 w-5 text-orange-500" />
              <p>${(getCrewCount() * 38).toLocaleString("en")}/hour</p>
            </div>
          </TooltipComponent>
          <TooltipComponent content="burn rate at $38 avg wage" side="top">
            <div className="flex items-center rounded-2xl transition duration-200 hover:scale-110 hover:bg-amber-800 md:px-2">
              <FireIcon className="inline-block h-5 w-5 text-sky-500" />
              <p>${(getCrewCount() * 38 * 40).toLocaleString("en")}/week</p>
            </div>
          </TooltipComponent>
        </div>
      </div>
      <div className="flex items-center rounded-2xl border border-zinc-500 bg-black/50 px-1 backdrop-blur md:-translate-y-4 md:gap-2 md:px-2">
        <div className="flex items-center justify-center md:gap-2">
          <WrenchScrewdriverIcon className="inline-block h-5 w-5" />
          <div className="h-5 border-l border-zinc-500" />
        </div>
        <div className="flex gap-2 ">
          <TooltipComponent content="Project count" side="top">
            <div className="flex items-center rounded-2xl transition duration-200 hover:scale-110 hover:bg-amber-800 md:px-2">
              <p>{getProjectCount()}</p>
            </div>
          </TooltipComponent>
        </div>
      </div>
    </div>
  );
};

export default Costing;
