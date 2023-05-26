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

      <div className="flex h-full w-full items-center justify-center rounded-sm border-[1px] border-[#550000] bg-black text-center text-white shadow-lg transition-all duration-100 hover:bg-[#111111]">
        {data.label}
      </div>
    </>
  );
};

export default memo(ResizableNodeSelected);
