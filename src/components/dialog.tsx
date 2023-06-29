import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";



export const DialogComponent: React.FC<{ trigger: ReactNode, title: string, description?: string, yesMessage?: string, noMessage?: string, yes: () => void, no?: () => void }> = ({ trigger, title, description, yesMessage, noMessage, yes, no }) => {

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                {trigger}
            </Dialog.Trigger>
            <Dialog.Portal className="flex items-center justify-center">
                <Dialog.Overlay className="fixed inset-0 z-30 top-0 md:bg-black/20 backdrop-blur-lg" />
                <div className="fixed top-0 inset-0 z-30 flex items-center justify-center">
                    <Dialog.Content className="md:rounded-lg md:border border-zinc-500 bg-black p-3 w-full md:w-fit md:min-w-[18rem] min-h-[7rem] flex flex-col justify-between fade-y-long">
                        <Dialog.Title className="text-2xl font-semibold text-zinc-200">
                            {title}
                        </Dialog.Title>
                        <Dialog.Description className="text-white text-md tracking-tight">
                            {description || ""}
                        </Dialog.Description>
                        <div className="mt-4 flex justify-end gap-2">
                            <Dialog.Close asChild>
                                <button onClick={() => {
                                    no && no();
                                }} className="rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-zinc-600">
                                    {noMessage ? noMessage : "No"}
                                </button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                                <button
                                    className="rounded bg-gradient-to-br bg-zinc-700 to-amber-700 p-2 text-center transition-all duration-100 hover:bg-zinc-600"
                                    onClick={() => {
                                        yes();
                                    }}
                                >
                                    {yesMessage ? yesMessage : "Yes"}
                                </button>
                            </Dialog.Close>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal >
        </Dialog.Root >
    )

}