import * as Tooltip from "@radix-ui/react-tooltip";
import type { FunctionComponent, ReactNode } from "react";

type Props = {
  content: string;
  children: ReactNode;
  side: "top" | "right" | "bottom" | "left";
  disableToolTipIfNoContent?: boolean;
  delayDuration?: number;
};

const TooltipComponent: FunctionComponent<Props> = (props) => {

  if (!props.content && props.disableToolTipIfNoContent) return (
    <div>
      {props.children}
    </div>)

  if (!props.content) {

    console.error("tooltip error: no content")

    return (
      <div>
        {props.children}
      </div>
    );
  }

  return (
    <Tooltip.Provider delayDuration={props.delayDuration || 0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="TooltipContent hidden md:block text-semibold z-30 rounded-md bg-black/60 p-2 text-white drop-shadow-lg backdrop-blur-sm border border-zinc-500"
            side={props.side}
            sideOffset={5}
          >
            <p className="font-semibold max-w-[25vw]">{props.content}</p>
            <Tooltip.Arrow className="fill-current text-zinc-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TooltipComponent;
