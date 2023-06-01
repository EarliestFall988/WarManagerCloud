import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";

interface crewNodeInput {
  data: {
    name: string;
    description: string;
  };
  selected: boolean;
}

const CrewNode = ({ data, selected }: crewNodeInput) => {
  if (!data) return <>err</>;

  if (typeof selected !== "boolean") return <>err</>;

  return (
    <>
      <NodeResizer
        color="#ff5555"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      <div className="flex h-full w-full cursor-move rounded-sm border-b-2 border-amber-700 bg-zinc-700 px-1 text-zinc-100 transition-all duration-100 hover:bg-zinc-600">
        <div className="h-8 w-28">
          <WrenchScrewdriverIcon className="fixed bottom-0 right-0 z-10 h-3 w-3 -translate-x-1 -translate-y-1 text-amber-600/40" />
          <p className="z-30 text-[0.55rem]">{data.name}</p>
          <p className="z-30 text-[0.5rem] italic tracking-tight text-white/70">
            {data.description}
          </p>
        </div>
      </div>
    </>
  );
};

export default memo(CrewNode);
