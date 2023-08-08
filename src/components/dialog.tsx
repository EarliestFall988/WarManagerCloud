import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";
import { TextareaComponent } from "./input";
import { useState, useMemo } from "react";
import { LoadingSpinner } from "./loading";

export const DialogComponent: React.FC<{
  trigger: ReactNode;
  title: string;
  description?: string;
  yesMessage?: string;
  noMessage?: string;
  yes: () => void;
  no?: () => void;
  highlightYes?: boolean;
  highlightNo?: boolean;
}> = ({
  trigger,
  title,
  description,
  yesMessage,
  noMessage,
  yes,
  no,
  highlightYes,
  highlightNo,
}) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-0 z-30 backdrop-blur-lg data-[state=open]:animate-overlayShow md:bg-black/20" />
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content className="fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-black p-[25px] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="select-none text-2xl font-semibold text-zinc-200">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-md select-none tracking-tight text-white">
            {description || ""}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                onClick={() => {
                  no && no();
                }}
                className={`min-w-[3em] select-none rounded  p-2 text-center transition-all duration-100 ${
                  highlightNo
                    ? "bg-amber-700 hover:bg-amber-600"
                    : "bg-zinc-700 hover:bg-zinc-600"
                } `}
              >
                {noMessage ? noMessage : "No"}
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className={`min-w-[3em] select-none rounded  ${
                  highlightYes
                    ? "bg-amber-700 hover:bg-amber-600"
                    : "bg-zinc-700 hover:bg-zinc-600"
                } bg-gradient-to-br p-2 text-center transition-all duration-100 `}
                onClick={() => {
                  yes();
                }}
              >
                {yesMessage ? yesMessage : "Yes"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
        {/* </div> */}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export const DialogComponentManualOpenClose: React.FC<{
  children: ReactNode;
  title: string;
  description: string;
  yesMessage?: string;
  noMessage?: string;
  open: boolean;
  yes: () => void;
  no: () => void;
}> = ({
  children,
  title,
  description,
  yesMessage,
  noMessage,
  yes,
  no,
  open,
}) => {
  return (
    <Dialog.Root open={open}>
      {children}
      <Dialog.Portal
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          no && no();
        }}
      >
        <Dialog.Overlay
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            no && no();
          }}
          className="fixed inset-0 top-0 z-30 backdrop-blur-lg data-[state=open]:animate-overlayShow md:bg-black/20"
        />
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-black p-[25px] focus:outline-none data-[state=open]:animate-contentShow"
        >
          <Dialog.Title className="select-none text-2xl font-semibold text-zinc-200">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-md select-none tracking-tight text-white">
            {description || ""}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  no && no();
                }}
                className="min-w-[3em] select-none rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-zinc-600"
              >
                {noMessage ? noMessage : "No"}
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="min-w-[3em] select-none rounded bg-zinc-700 bg-gradient-to-br p-2 text-center transition-all duration-100 hover:bg-zinc-600"
                onClick={(e) => {
                  e.stopPropagation();
                  yes();
                }}
              >
                {yesMessage ? yesMessage : "Yes"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
        {/* </div> */}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export const EditModalComponent: React.FC<{
  trigger: ReactNode;
  title: string;
  messageToEdit?: string;
  yesMessage?: string;
  noMessage?: string;
  yes: (result: string) => void;
  cancel?: () => void;
  open: boolean;
  loading?: boolean;
}> = ({
  trigger,
  title,
  messageToEdit,
  yesMessage,
  noMessage,
  yes,
  cancel,
  open,
  loading,
}) => {
  const [message, setMessage] = useState("");

  useMemo(() => {
    messageToEdit && setMessage(messageToEdit);
  }, [messageToEdit]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          onClick={(e) => {
            e.preventDefault();
            cancel && cancel();
          }}
          className="fixed inset-0 top-0 z-30 backdrop-blur-lg data-[state=open]:animate-overlayShow md:bg-black/20"
        />
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content
          onClick={(e) => {
            e.preventDefault();
          }}
          className="fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-black p-[25px] focus:outline-none data-[state=open]:animate-contentShow"
        >
          <Dialog.Title className="select-none text-2xl font-semibold text-zinc-200">
            {title}
          </Dialog.Title>
          <TextareaComponent
            disabled={false}
            className="mt-4"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  cancel && cancel();
                }}
                className="min-w-[3em] select-none rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-zinc-600"
              >
                {noMessage ? noMessage : "Cancel"}
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="min-w-[3em] select-none rounded bg-zinc-700 bg-gradient-to-br p-2 text-center transition-all duration-100 hover:bg-zinc-600"
                onClick={(e) => {
                  e.preventDefault();
                  yes(message);
                }}
              >
                {!loading && <p>{yesMessage ? yesMessage : "Done"}</p>}
                {loading && <LoadingSpinner />}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
        {/* </div> */}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
