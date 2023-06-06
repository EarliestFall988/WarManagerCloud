import * as Tooltip from "@radix-ui/react-tooltip";
import type { FunctionComponent, ReactNode } from "react";

type Props = {
  content: string;
  children: ReactNode;
  side: "top" | "right" | "bottom" | "left";
};

const TooltipComponent: FunctionComponent<Props> = (props) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="TooltipContent text-semibold z-30 rounded bg-black/60 p-2 text-white shadow-lg backdrop-blur-sm"
            side={props.side}
            sideOffset={5}
          >
            <p className="font-semibold">{props.content}</p>
            <Tooltip.Arrow className="fill-current text-black/50" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TooltipComponent;
