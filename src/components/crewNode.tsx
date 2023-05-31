import { memo } from "react";
import { Handle, NodeResizer, Position } from "reactflow";

interface crewNodeInput {
  data: {
    name: string;
    position: string;
  };
  selected: boolean;
}

const CrewNode = ({ data, selected }: crewNodeInput) => {
  if (!data) return <>err</>;

  if (typeof selected !== "boolean") return <>err</>;

  return (
    <>
     {/* <Handle type="target" position={Position.Bottom} id={"fanfan"} /> */}
      <NodeResizer
        color="#ff0000"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      <div className="flex h-full w-full rounded-sm bg-zinc-700 px-1 text-zinc-100 duration-100 transition-all hover:bg-zinc-600">
        <div className="h-12 w-20">
          <p className="text-[0.55rem]">{data.name}</p>
          <p className="text-[0.5rem]">{data.position}</p>
        </div>
      </div>
     
      {/* <Handle type="source" position={Position.Top} id={"fanfan"} /> */}
    </>
  );
};

export default memo(CrewNode);
