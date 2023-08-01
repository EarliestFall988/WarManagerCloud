import type { GetStaticPropsContext, GetStaticProps, NextPage } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

// import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { type Sector, type Tag } from "@prisma/client";
import { TagsMultiselectDropdown } from "~/components/TagDropdown";
import { ButtonCallToActionComponent, ButtonDeleteAction, InputComponent, PhoneEmailComponent, TextareaComponent } from "~/components/input";


const SingleCrewMemberPage: NextPage<{ id: string }> = ({ id }) => {

  const [crewName, setCrewName] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wage, setWage] = useState("0");
  const [burden, setBurden] = useState("0");
  const [rating, setRating] = useState("5");

  const [tags, setTags] = useState<Tag[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [crewNameError, setCrewNameError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [wageError, setWageError] = useState("");
  const [burdenError, setBurdenError] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [sectorError, setSectorError] = useState("");


  const router = useRouter();

  const crewContext = api.useContext().crewMembers;
  const tagsContext = api.useContext().tags;
  const sectorsContext = api.useContext().sectors;

  const mutation = api.crewMembers.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} (${data.position}) updated successfully!`);
      void crewContext.invalidate();
      void tagsContext.invalidate();
      void sectorsContext.invalidate();
      void router.back();
    },
    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
        toast.error(e.message);
        return;
      }
      else {
        toast.error("There were a few errors, please check the form and try again.")
      }

      for (const key in errorMessage) {
        // toast.error(errorMessage?[key][0] || "there was an api error");
        const keyMessage = errorMessage[key]

        if (keyMessage) {

          const message = keyMessage[0] || "";

          switch (key) {
            case "name":
              setCrewNameError(message);
              break;
            case "notes":
              setDescriptionError(message);
              break;
            case "position":
              setPositionError(message);
              break;
            case "phone":
              setPhoneError(message);
              break;
            case "email":
              setEmailError(message);
              break;
            case "wage":
              setWageError(message);
              break;
            case "burden":
              setBurdenError(message);
              break;
            case "rating":
              setRatingError(message);
              break;
            case "sectors":
              setSectorError(message);
              break;
            default:
              break;
          }
        }
        else {
          toast.error("Something went wrong! Please try again later");
        }
      }
    },
  });


  const { mutate: deleteCrewMemberMutation, isLoading: deletingCrew } = api.crewMembers.delete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} (${data.position}) deleted successfully!`);
      void crewContext.invalidate();
      void tagsContext.invalidate();
      void router.back();
    },

    onError: (e) => {
      console.log("Error deleting crew member", e.message);
      toast.error("Something went wrong! Please try again later");
    }
  });


  const { data, isLoading } = api.crewMembers.getById.useQuery({
    crewMemberId: id,
  });

  const deleteCrewMember = useCallback(() => {
    deleteCrewMemberMutation({
      crewMemberId: id
    });
  }, [deleteCrewMemberMutation, id])

  useMemo(() => {
    if (data == null) return;

    if (data.name) {
      setCrewName(data.name);
    }

    if (data.position) {
      setPosition(data.position);
    }

    if (data.description) {
      setDescription(data.description);
    }

    if (data.phone) {
      setPhone(data.phone);
    }
    if (data.email) {
      setEmail(data.email);
    }

    if (data.wage) {
      setWage(data.wage.toString());
    }

    if (data.burden) {
      setBurden(data.burden.toString());
    }

    if (data.rating) {
      setRating(data.rating);
    }

    if (data.tags) {
      setTags(data.tags)
    }

    if (data.sector) {
      setSectors([data.sector]);
    }

  }, [data]);

  if (isLoading)
    return (
      <div>
        <LoadingPage />
      </div>
    );

  if (!data) {

    toast.error("Could not fetch data - please try again later.");

    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  const getTagsStringArray = () => {
    const tagsStringArray = [] as string[];
    tags.forEach((tag) => {
      tagsStringArray.push(tag.id);
    });
    return tagsStringArray;
  }

  const getSectorsIds = () => {
    const sectorsIdsArray = [] as string[];
    sectors.forEach((s) => {
      sectorsIdsArray.push(s.id);
    });
    return sectorsIdsArray;
  }

  const save = () => {

    setCrewNameError("");

    setDescriptionError("");

    setPositionError("");
    setPhoneError("");

    setEmailError("");

    setWageError("");

    setBurdenError("");

    setRatingError("");

    setSectorError("");

    mutation.mutate({
      crewMemberId: data.id,
      name: crewName,
      phone: phone,
      email: email,
      position,
      notes: description,
      tags: getTagsStringArray(),
      wage: parseFloat(wage),
      burden: parseFloat(burden),
      rating: parseInt(rating),
      sectors: getSectorsIds()
    });
    toast.loading("Saving changes...", { duration: 1000 });
  }

  return (
    <>
      <Head>
        <title>{`${data.name} (${data.position}) - War Manager`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-zinc-900">
        <NewItemPageHeader title={`${data.name} `} context={'crew'} save={save} saving={mutation.isLoading || isLoading} deleting={deletingCrew} />
        <div className="flex items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-3/5">
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold">Name</h1>
              <InputComponent type={"text"} error={crewNameError} value={crewName} onChange={(e) => setCrewName(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} autoFocus />
            </div>
            <div className="w-full p-2">
              <h1 className="text-lg font-semibold ">Position</h1>
              <select
                className="w-full ring-2 ring-zinc-700 rounded p-2 outline-none text-zinc-200 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800"
                placeholder="Name"
                value={position}
                disabled={isLoading || mutation.isLoading}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="Crew">Laborer</option>
                <option value="Specialist">Specialist</option>
                <option value="Foreman">Foreman</option>
                <option value="Specialist Foreman">Specialist Foreman</option>
                <option value="Superintendent">Superintendent</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Machine Operator">Machine Operator</option>
                <option value="Subcontractor">Subcontractor</option>
                <option value="Other">Other</option>
              </select>
              <p className="p-1 text-red-500 tracking-tight">{positionError}</p>
            </div>

            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Tags</p>
              <TagsMultiselectDropdown type={"crews and sectors"} savedTags={tags} savedSectors={sectors} onSetSectors={setSectors} onSetTags={setTags} />
              {sectorError && (
                <>
                  <div className="h-[3px] rounded bg-red-500 translate-y-1"></div>
                  <p className="p-1 text-red-500 tracking-tight">{sectorError}</p>
                </>
              )}
            </div>

            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Phone Number</p>

              <PhoneEmailComponent type={"tel"} error={phoneError} value={phone} onChange={(e) => setPhone(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>
            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Email</p>

              <PhoneEmailComponent type={"email"} error={emailError} value={email} onChange={(e) => setEmail(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>
            <div className="w-full p-2" />

            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Wage</p>

              <InputComponent type={"number"} error={wageError} value={wage} onChange={(e) => setWage(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>
            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Burden</p>


              <InputComponent type={"decimal"} error={burdenError} value={burden} onChange={(e) => setBurden(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>
            <div className="w-full p-2" />
            <div className="w-full p-2">
              <p className="py-1 text-lg font-semibold">Rating</p>

              <InputComponent type={"number"} error={ratingError} value={rating} onChange={(e) => setRating(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>
            <div className="w-full p-2 ">
              <h1 className="text-lg font-semibold">Notes</h1>

              <TextareaComponent error={descriptionError} value={description} onChange={(e) => setDescription(e.currentTarget.value)} disabled={isLoading || mutation.isLoading} />
            </div>

            <div className="w-full pb-5 font-semibold p-2">
              <ButtonCallToActionComponent onClick={save} disabled={isLoading || mutation.isLoading || deletingCrew} >
                {mutation.isLoading ? <LoadingSpinner /> : (<><p>Save</p> <CloudArrowUpIcon className="ml-2 h-5 w-5" /> </>)}
              </ButtonCallToActionComponent>

            </div>
            <ButtonDeleteAction title={"Are you sure you want to delete this crew member?"} description="The crew member will not be recoverable after you delete it." loading={deletingCrew} yes={deleteCrewMember} disabled={isLoading || mutation.isLoading || deletingCrew} />
          </div>
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const helper = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("slug is not a string");
  if (id.length <= 0) throw new Error("slug too short");

  await helper.crewMembers.getById.prefetch({ crewMemberId: id });

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

export default SingleCrewMemberPage;
