import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";



export const DialogComponent: React.FC<{ trigger: ReactNode, title: string, description?: string, yesMessage?: string, noMessage?: string, yes: () => void, no?: () => void }> = ({ trigger, title, description, yesMessage, noMessage, yes, no }) => {

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-30 data-[state=open]:animate-overlayShow top-0 md:bg-black/20 backdrop-blur-lg" />
                {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
                <Dialog.Content className="data-[state=open]:animate-contentShow fixed z-30 bg-black top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] p-[25px] focus:outline-none">
                    <Dialog.Title className="text-2xl font-semibold text-zinc-200 select-none">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-white text-md tracking-tight select-none">
                        {description || ""}
                    </Dialog.Description>
                    <div className="mt-4 flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button onClick={() => {
                                no && no();
                            }} className="rounded bg-zinc-700 p-2 min-w-[3em] text-center transition-all duration-100 hover:bg-zinc-600 select-none">
                                {noMessage ? noMessage : "No"}
                            </button>
                        </Dialog.Close>
                        <Dialog.Close asChild>
                            <button
                                className="rounded bg-gradient-to-br min-w-[3em] bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-zinc-600 select-none"
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
            </Dialog.Portal >
        </Dialog.Root >
    )

}