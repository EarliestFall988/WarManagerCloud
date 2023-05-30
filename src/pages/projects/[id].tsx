import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const SingleProjectPage: NextPage<{ id: string }> = ({ id }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: project } = api.projects.getById.useQuery({ id });

  const mutation = api.projects.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} updated successfully!`);
    },
  });

  useEffect(() => {
    if (project == null) return;

    if (project.name) {
      setName(project.name);
    }
    if (project.description) {
      setDescription(project.description);
    }
  }, [project]);

  if (project === undefined || project === null) {
    return <LoadingPage />;
  }

  return (
    <div className="min-w-screen min-h-screen bg-zinc-800">
      <NewItemPageHeader title={`${project?.name}`} />
      <div className="flex items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center gap-4 p-2 sm:w-3/5">
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Name</h1>
            <input
              className="w-full rounded p-2 text-stone-800 outline-none"
              type="text"
              value={name}
              disabled={false}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-full p-2">
            <h1 className="text-lg font-semibold">Notes</h1>
            <textarea
              className="w-full rounded p-2 text-stone-800 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={false}
            />
          </div>
          <div className="w-full p-2">
            <button
              disabled={mutation.isLoading}
              onClick={() => {
                mutation.mutate({
                  id: project.id,
                  name,
                  description,
                });
                toast.loading("Saving changes...", { duration: 1000 });
              }}
              className="flex h-10 w-full items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 font-semibold text-white hover:from-amber-600 hover:to-red-600"
            >
              {mutation.isLoading ? <LoadingSpinner /> : <p>Save Changes</p>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const helper = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") {
    throw new Error("slug is not a string");
  }
  if (id.length <= 0) {
    throw new Error("slug too short");
  }

  await helper.projects.getById.prefetch({ id });

  const result = helper.dehydrate();

  return {
    props: {
      trpcState: result,
      id: id,
    },
    revalidate: 60,
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SingleProjectPage;
