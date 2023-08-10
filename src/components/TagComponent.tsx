import type { Tag } from "@prisma/client";
import TooltipComponent from "./Tooltip";
import { XMarkIcon } from "@heroicons/react/24/solid";

export type TagType = {
  tag: Tag;
  style?: string;
  tooltipDelayDuration?: number;
  children?: React.ReactNode;
};

export const TagBubblesHandler: React.FC<{ tags: TagType[] }> = ({ tags }) => {
  if (tags.length === 0) return <div></div>;

  console.log(tags);
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <TagBubble key={t.tag.id} tag={t.tag} />
      ))}
    </div>
  );
};

export const TagBubble: React.FC<TagType> = (props) => {
  const tag = props.tag;

  return (
    <TooltipComponent
      content={tag.description || "<no description>"}
      side="bottom"
      delayDuration={props.tooltipDelayDuration}
    >
      <div
        style={{
          color: `${tag.backgroundColor}`,
          border: `1px solid ${tag.backgroundColor}`,
          borderRadius: "9999px",
          paddingRight: "5px",
          paddingLeft: "5px",
        }}
        className={`fade-y z-0 flex items-center justify-center gap-1 whitespace-nowrap text-xs ${
          props.style || ""
        }`}
      >
        {tag.name}
        {props.children}
      </div>
    </TooltipComponent>
  );
};

export const RemovableTagBubble: React.FC<{
  tag: Tag;
  removeTagFromProject: (id: string) => void;
  style?: string;
}> = ({ tag, removeTagFromProject, style }) => {
  return (
    <TagBubble tag={tag} style={style}>
      <button
        onClick={() => removeTagFromProject(tag.id)}
        className="text-zinc-500 hover:text-amber-600"
      >
        <XMarkIcon className=" h-5 w-5 " />
      </button>
    </TagBubble>
  );
};
