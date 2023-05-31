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
        color="#ff0000"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      <div className="flex h-full w-full rounded-sm bg-zinc-700 px-1 text-zinc-100 duration-100 transition-all hover:bg-zinc-600">
        <div className="h-10 w-28">
          <p className="text-[0.55rem]">{data.name}</p>
          <p className="text-[0.5rem]">{data.description}</p>
        </div>
      </div>
    </>
  );
};

export default memo(CrewNode);
