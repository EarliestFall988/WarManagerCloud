
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { type ReactNode } from 'react';



export const SimpleDropDown: React.FC<{ trigger: ReactNode, children: ReactNode }> = ({ trigger, children }) => {

    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>
                {trigger}
            </Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content className='fade-y bg-black/40 backdrop-blur-sm border border-zinc-500 p-2 rounded' >
                    {children}
                    <Dropdown.Arrow className="fill-current text-zinc-500" />
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown.Root>
    );
}