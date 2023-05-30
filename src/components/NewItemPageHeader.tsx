import Link from "next/link";

export const NewItemPageHeader = (props: { title: string }) => {
  return (
    <div className="flex items-center justify-between bg-zinc-700 p-2 text-center text-lg font-semibold">
      <Link href="/dashboard" className="w-12 ">
        {"Back"}
      </Link>
      <h1 className="text-[1rem] sm:text-lg">{props.title}</h1>{" "}
      <div className="hidden w-12 sm:flex" />
    </div>
  );
};
