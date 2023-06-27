import type { FC, ReactNode } from "react";

import * as HoverCard from "@radix-ui/react-hover-card";
import Link from "next/link";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TooltipComponent from "./Tooltip";

type Props = {
  content: ReactNode;
  trigger: ReactNode;
  editURL?: string;
};

const HoverCardComponent: FC<Props> = (props) => {
  return (
    <HoverCard.Root openDelay={400} closeDelay={0}>
      <HoverCard.Trigger asChild>{props.trigger}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          sideOffset={-10}
          className="HoverCardContent max-w-[40vw] rounded border border-zinc-500 bg-black/60 text-zinc-200 shadow-lg drop-shadow-lg backdrop-blur"
        >
          {props.editURL && (
            <div className="absolute flex w-full items-end justify-end p-1">
              <TooltipComponent content="Edit" side="right">
                <Link
                  href={props.editURL ? props.editURL : "#"}
                  className="transition-color rounded bg-zinc-800 p-2 text-zinc-200 duration-100 hover:cursor-pointer hover:bg-amber-600"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </Link>
              </TooltipComponent>
            </div>
          )}
          <div className="p-2">{props.content}</div>
          <HoverCard.Arrow
            className="fill-current text-zinc-500 drop-shadow-lg"
            width={20}
            height={10}
          />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

export default HoverCardComponent;
