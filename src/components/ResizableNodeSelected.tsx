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

      <div className="flex h-full w-full rounded-sm bg-zinc-600 px-1 text-zinc-100">
        <div className="w-16">
          <p className="text-[0.55rem]">{data.label}</p>
          <p className="text-[0.5rem]">{data.label}</p>
        </div>
      </div>
    </>
  );
};

export default memo(ResizableNodeSelected);
