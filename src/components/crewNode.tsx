import { IdentificationIcon } from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";

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

  let theme =
    "flex h-full w-full rounded-sm bg-zinc-700 px-1 text-zinc-100 transition-all duration-100 hover:bg-zinc-600 cursor-move ";

  if (data.position.includes("Foreman"))
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-amber-700 to-red-700 px-1 text-zinc-100 transition-all duration-100 cursor-move";

  if (data.position == "Superintendent")
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-purple-700 to-blue-700 px-1 text-zinc-100 transition-all duration-100 cursor-move";

  return (
    <>
      {/* <Handle type="target" position={Position.Bottom} id={"fanfan"} /> */}
      <div className={theme}>
        <div className="h-8 w-28">
          <IdentificationIcon className="fixed bottom-0 right-0 z-10 h-3 w-3 -translate-x-1 -translate-y-1 text-white/30" />
          <p className="text-[0.55rem]">{data.name}</p>
          <p className="text-[0.5rem] tracking-tight text-white/70">
            {data.position}
          </p>
        </div>
      </div>
      <NodeResizer
        color="#ff5555"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      {/* <Handle type="source" position={Position.Top} id={"fanfan"} /> */}
    </>
  );
};

export default memo(CrewNode);
