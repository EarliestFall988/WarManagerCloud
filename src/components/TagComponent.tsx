import type { Tag } from "@prisma/client"
import TooltipComponent from "./Tooltip";
import { XMarkIcon } from "@heroicons/react/24/solid";


export const TagBubble: React.FC<{ tag: Tag, style?: string, children?: React.ReactNode }> = (props) => {

    const tag = props.tag;

    return (
        <TooltipComponent
            content={tag.description || "<no description>"}
            side="bottom"
        >
            <div
                style={{
                    color: `${tag.backgroundColor}`,
                    border: `1px solid ${tag.backgroundColor}`,
                    borderRadius: "9999px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                }}
                className={`fade-y flex items-center justify-center whitespace-nowrap gap-1 ${props.style || ""}`}
            >
                {tag.name}
                {props.children}
            </div>
        </TooltipComponent>
    )
}


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