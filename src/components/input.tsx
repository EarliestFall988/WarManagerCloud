import { TrashIcon } from "@heroicons/react/24/solid"
import { DialogComponent } from "./dialog"
import { LoadingSpinner } from "./loading"
import TooltipComponent from "./Tooltip"



export const style = "w-full ring-2 ring-zinc-700 rounded p-2 outline-none text-zinc-200 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800 "

export const InputWithErrorStyle = `${style} peer invalid:[&:not(:placeholder-shown):not(:focus)]:ring invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500`

const textareaStyle = "w-full ring-2 ring-zinc-700 rounded p-2 outline-none text-zinc-200 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800 h-28 "

const buttonCallToActionStyle = "flex h-10 outline-none focus:bg-amber-700 w-full items-center justify-center rounded bg-amber-800 font-semibold text-white hover:bg-amber-700 duration-100 transition-all"

const buttonDeleteActionStyle = "flex outline-none focus:bg-red-700 w-full items-center justify-center rounded-2xl bg-red-800 font-semibold text-white hover:bg-red-700 duration-100 transition-all"

export const InputComponent: React.FC<{ value: string, error?: string, required?: boolean, placeholder?: string, type?: string, disabled: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, autoFocus?: boolean, className?: string }> = ({ value, required, placeholder, error, type, disabled, onChange, autoFocus, className }) => {

    const notNullOrEmptyRegexPattern = `^(?!\s*$).+`

    return (
        <>
            {required ?

                <input
                    className={InputWithErrorStyle + " " + `${error ? "border-b-2 border-red-500" : ""} ` + (className || "")}
                    type={type || "text"}
                    placeholder={placeholder || ""}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e)}
                    autoFocus={autoFocus}
                    pattern={notNullOrEmptyRegexPattern}
                    required={true}
                />
                :
                <input
                    className={InputWithErrorStyle + " " + `${error ? "border-b-2 border-red-500" : ""} ` + (className || "")}
                    type={type || "text"}
                    placeholder={placeholder || ""}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e)}
                    autoFocus={autoFocus}
                    required={false}
                />
            }
            <p className="p-1 text-sm text-red-500 fade-x select-none">{error}</p>

            <p className="p-1 hidden text-sm select-none text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                {"Please enter a valid email address."}
            </p>
        </>
    )
}


export const PhoneEmailComponent: React.FC<{ value: string, error?: string, type: "email" | "tel", disabled: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, autoFocus?: boolean, className?: string }> = ({ type, value, error, disabled, onChange, autoFocus, className }) => {


    const emailPattern = `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$`
    const USPhonePattern = `^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$`

    return (
        <>
            <input
                type={type}
                className={`${InputWithErrorStyle} ${error ? "border-b-2 border-red-500" : ""} ${className || ""}`}
                placeholder={type === "email" ? "Email" : "Phone"}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e)}
                pattern={type === "email" ? emailPattern : USPhonePattern}
                autoFocus={autoFocus}
                required={true}
            />

            {error && <p className="p-1 text-sm text-red-500 fade-x select-none">{error}</p>}

            {type == "email" && !error && <p className="mt-2 select-none hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                {"Please enter a valid email address."}
            </p>}

            {type == "tel" && !error && <p className="mt-2 select-none hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                {"Please enter a valid phone number (example: 000-000-0000)."}
            </p>}
        </>
    )
}

export const TextareaComponent: React.FC<{ value: string, error?: string, placeholder?: string, disabled: boolean, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, autoFocus?: boolean, className?: string }> = ({ value, error, placeholder, disabled, onChange, autoFocus, className }) => {

    return (
        <>
            <textarea
                className={textareaStyle + " " + `${error ? "border-b-2 border-red-500" : ""} ` + (className || "")}
                placeholder={placeholder || ""}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e)}
                autoFocus={autoFocus}
            />
            <p className="p-1 text-sm text-red-500 fade-x select-none">{error}</p>
        </>
    );
}


export const ButtonCallToActionComponent: React.FC<{ disabled: boolean, onClick: () => void, className?: string, children: React.ReactNode }> = ({ disabled, onClick, className, children }) => {
    return (
        <div>
            <TooltipComponent content={`Submit changes for everyone else to see.`} side="top">
                <button
                    disabled={disabled}
                    onClick={() => onClick()}
                    className={buttonCallToActionStyle + " " + (className || "")}
                >
                    {children}
                </button >
            </TooltipComponent>
        </div>
    )
}

export const ButtonDeleteAction: React.FC<{ disabled: boolean, loading: boolean, title: string, description: string, yes: () => void, className?: string }> = ({ disabled, loading, title, description, yes, className }) => {

    return (
        <div className="w-full p-2">
            <div className="w-full p-2 font-semibold border-2 border-dashed border-red-700 rounded-2xl">
                <p className="py-2 text-lg font-semibold select-none">Danger Zone</p>
                <DialogComponent trigger={

                    <button disabled={disabled || loading} className={`${buttonDeleteActionStyle}  ${className ? className : ""}`} >
                        {loading ? <LoadingSpinner /> : (<><p>Delete Forever</p> <TrashIcon className="ml-2 h-5 w-5" /> </>)}
                    </button>

                } title={title} description={description} yes={yes} />
            </div>
        </div>
    )
}