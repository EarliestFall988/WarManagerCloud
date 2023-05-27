import { memo } from "react";
import { NodeResizer } from "reactflow";

interface resizeNodeInput {
  data: {
    label: string;
    canResize: boolean;
  };
  selected: boolean;
}

const ResizableNodeSelected = ({ data, selected }: resizeNodeInput) => {
  if (!data) return <>err</>;

  if (typeof selected !== "boolean") return <>err</>;

  return (
    <>
      <NodeResizer
        color="#ff0000"
        isVisible={selected && data.canResize}
        minWidth={100}
        minHeight={30}
      />

      <div className="flex h-full w-full items-center justify-center border-[0.5px] border-zinc-400 bg-zinc-200 text-center text-zinc-800 ">
        {data.label}
      </div>
    </>
  );
};

export default memo(ResizableNodeSelected);
