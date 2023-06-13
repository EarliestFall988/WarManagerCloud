import type { FC, ReactNode } from "react";

import * as HoverCard from "@radix-ui/react-hover-card";

type Props = {
  content: ReactNode;
  trigger: ReactNode;
};

const HoverCardComponent: FC<Props> = (props) => {
  return (
    <HoverCard.Root openDelay={400} closeDelay={0}>
      <HoverCard.Trigger asChild>{props.trigger}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          sideOffset={-5}
          className="HoverCardContent rounded border border-zinc-700 bg-black/60 p-3 text-zinc-200 drop-shadow-lg shadow-lg backdrop-blur max-w-[40vw]"
        >
          {props.content}
          <HoverCard.Arrow
            className="fill-current text-zinc-700 drop-shadow-lg"
            width={20}
            height={10}
          />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

export default HoverCardComponent;
