import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "process";

const api_key = env.PIPE_DRIVE_API_KEY;



type DownloadPipeDriveDetails =
  {
    id: number;
    owner: string;
    PrimaryEstimator: string;
    SecondaryEstimator: string;
    value: string; //format correctly
    stage: string;
    status: string;
    UpdateTime: string;
    StatusUpdateTime: string; //merge won and lost into status time
    StageUpdateTime: string;
    ActivitiesCompletedLastWeek: number; //probably not accurate, will need to check last changed date???
  }


export default async function ChannelAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse<DownloadPipeDriveDetails[] | string>
) {


  if (req.method == "GET") {

    const data = await fetch("https://pipedrivedealpullfunction.azurewebsites.net/api/piperivehttppull", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: "b760e078c537e5cc7351cd9f56a788e5f74c7ea0",
        company_domain: "jrcoinc",
        token: "9a8eae53-c7bf-4eb1-92a7-68e0e7883fc1"
      })
    }).then((res) => res.json()) as DownloadPipeDriveDetails[];

    res.status(200).json(data);
  }

  // if (req.method == "GET") {

  //   try {
  //     const dealCustomFields = await getDealCustomFields();
  //     const activities = await getActivities();

  //     const allDeals = [] as DownloadPipeDriveDetails[];
  //     let cursor = 0;

  //     const beginningOfTheYearDate = new Date();
  //     beginningOfTheYearDate.setMonth(0, 1);


  //     let deals = await getDeals(cursor);

  //     let finishedDownloading = false;

  //     while (deals && deals.data && deals.data.length > 0 && !finishedDownloading && cursor < 500) {


  //       if (deals.data[0].update_time < beginningOfTheYearDate.toISOString()) {
  //         finishedDownloading = true;
  //         break;
  //       }

  //       // console.log(deals.data);
  //       // console.log(deals.related_objects);
  //       // console.log(deals.related_objects.user);
  //       // console.log(deals.related_objects.person);
  //       // console.log(deals.related_objects.pipeline);
  //       // console.log(deals.related_objects.organization);
  //       // console.log(dea)

  //       deals.data.map((deal) => {
  //         const stageId = deal.stage_id
  //         const stage = deals.related_objects.stage[stageId]

  //         if (stage) {
  //           deal.stageName = stage.name;
  //           deal.stage_pipelineName = stage.pipeline_name;
  //           deal.stage_dealProbability = stage.deal_probability;
  //         }

  //         const lastStatusUpdateTime = deal.close_time || deal.won_time || deal.lost_time;

  //         const primaryEstimatorId = deal["4ff3ab1c142d1f55cbe84472f5267619ef942265"];
  //         const primaryEstimator = dealCustomFields.primaryEstimator?.options.filter((option) => option.id == primaryEstimatorId);
  //         let primaryEstimatorName = "";
  //         if (primaryEstimator && primaryEstimator.length > 0) {
  //           primaryEstimatorName = primaryEstimator !== undefined && primaryEstimator[0]?.label !== undefined ? primaryEstimator[0].label : "";
  //         }


  //         const secondaryEstimatorId = deal["7fb3d86d9d871f9fdbcf0920cf03903463b9b40e"];
  //         const secondaryEstimator = dealCustomFields.secondaryEstimator?.options.filter((option) => option.id == secondaryEstimatorId);
  //         let secondaryEstimatorName = "";
  //         if (secondaryEstimator && secondaryEstimator.length > 0) {
  //           secondaryEstimatorName = secondaryEstimator !== undefined && secondaryEstimator[0]?.label !== undefined ? secondaryEstimator[0].label : "";
  //         }

  //         const activitiesForDeal = activities.filter((activity) => activity.deal_id == deal.id);

  //         let activitiesCompletedLastWeek = 0;

  //         activitiesForDeal.map((activity) => {

  //           // console.log("activity marked as due date", activity.);
  //           // const activityCompletedDate = new Date(activity.update_time);

  //           // console.log("activity completed date", activityCompletedDate);

  //           // const today = new Date();
  //           // const sundayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);
  //           // const mondayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 1);

  //           // console.log(sundayOfWeek);
  //           // console.log(mondayOfWeek);

  //           // if (activityCompletedDate < sundayOfWeek && activityCompletedDate > mondayOfWeek) {
  //           //     activitiesCompletedLastWeek++;
  //           // }

  //           // if (activityDueDate < mondayOfWeek && activityDueDate > sundayOfWeek) {
  //           //     activitiesLeftToComplete++;
  //           // }

  //           // console.log(activity.done);

  //           if (activity.update_time && activity.done == true)
  //             activitiesCompletedLastWeek++;
  //         })


  //         const pipeDriveDownloadDetails: DownloadPipeDriveDetails = {
  //           id: deal.id,
  //           owner: deal.owner_name,
  //           PrimaryEstimator: primaryEstimatorName,
  //           SecondaryEstimator: secondaryEstimatorName,
  //           value: deal.formatted_value,
  //           stage: deal.stageName,
  //           status: deal.status,
  //           UpdateTime: deal.update_time,
  //           StatusUpdateTime: lastStatusUpdateTime,
  //           StageUpdateTime: deal.stage_change_time,
  //           ActivitiesCompletedLastWeek: activitiesCompletedLastWeek,
  //         }

  //         if (deal.update_time > beginningOfTheYearDate.toISOString())
  //           allDeals.push(pipeDriveDownloadDetails);
  //       })

  //       cursor += 500;
  //       deals = await getDeals(cursor);
  //     }

  //     return res.send(allDeals);
  //   } catch (error) {
  //     res.status(500).send((error as Error).message);
  //   }
  // }
  // else {
  //   res.status(405).send("Method not allowed");
  // }
}



type ActivitiesResponse = {
  success: boolean;
  data: [
    {
      id: number;
      company_id: number;
      user_id: number;
      deal_id: number;
      done: boolean;
      type: string;
      due_date: string;
      due_time: string;
      add_time: string;
      typeName: string;
      marked_as_done_time: string;
      update_time: Date;
    }
  ];
  additional_data: {
    pagination: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start: number;
    }
  }
}


const getActivities = async () => {

  if (api_key === undefined) {
    throw new Error("Pipedrive API key not found");
  }

  // const dateTime = new Date().setUTCMonth(new Date().getUTCMonth() - 1);
  // const iso = new Date(dateTime).toISOString();

  const today = new Date();

  const sundayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 7);
  const mondayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 1);


  console.log(sundayOfWeek);
  console.log(mondayOfWeek);

  // const lastWeek = new Date();
  // lastWeek.setDate(sundayOfWeek);

  // const nextWeek = new Date();
  // nextWeek.setDate(mondayOfWeek);


  let fetchActivities = true;

  const activitiesList = [];


  while (fetchActivities) {

    const urlString = `https://jrcoinc.pipedrive.com/api/v1/activities?api_token=${api_key}&user_id=0&start_date=${sundayOfWeek.toISOString()}&end_date=${mondayOfWeek.toISOString()}&start=${activitiesList.length}`

    const activities = await fetch(urlString, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()) as ActivitiesResponse;

    activitiesList.push(...activities.data);

    if (activities.additional_data.pagination.next_start == null) {
      fetchActivities = false;
      break;
    }
  }

  return activitiesList;
}


type customFieldResponse = {
  success: boolean;
  data: [
    {
      id: number;
      key: string;
      name: string;
      order_nr: number;
      field_type: string;
      json_column_flag: boolean;
      add_time: Date,
      update_time: Date;
      last_updated_by_user_id: number;
      edit_flag: boolean,
      details_visible_flag: boolean,
      add_visible_flag: boolean,
      important_flag: boolean,
      bulk_edit_allowed: boolean;
      filtering_allowed: boolean,
      sortable_flag: boolean,
      searchable_flag: boolean;
      active_flag: boolean;
      projects_detail_visible_flag: boolean;
      show_in_pipelines: {
        show_in_all: boolean;
        pipeline_ids: []
      },
      options: [
        {
          id: number;
          label: string;
        },
      ],
      mandatory_flag: boolean;
    }
  ]
}

const getDealCustomFields = async () => {


  if (api_key === undefined) {
    throw new Error("Pipedrive API key not found");
  }

  // const dateTime = new Date().setUTCMonth(new Date().getUTCMonth() - 1);
  // const iso = new Date(dateTime).toISOString();

  const urlString = `https://jrcoinc.pipedrive.com/api/v1/dealFields?api_token=${api_key}`

  const customFields = await fetch(urlString, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json()) as customFieldResponse;

  // console.log(deals)

  const estimator1Data = customFields.data.find(x => x.key === "4ff3ab1c142d1f55cbe84472f5267619ef942265");
  const estimator2Data = customFields.data.find(x => x.key === "7fb3d86d9d871f9fdbcf0920cf03903463b9b40e");

  return { primaryEstimator: estimator1Data, secondaryEstimator: estimator2Data };
}




const getDeals = async (cursor: number) => {

  if (api_key === undefined) {
    throw new Error("Pipedrive API key not found");
  }

  // const dateTime = new Date().setUTCMonth(new Date().getUTCMonth() - 1);
  // const iso = new Date(dateTime).toISOString();

  const urlString = `https://jrcoinc.pipedrive.com/api/v1/deals?limit=500&api_token=${api_key}&start=${cursor}&sort=update_time DESC,add_time DESC,title ASC`

  const deals = await fetch(urlString, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json()) as dealResponse;

  // console.log(deals)

  return deals;
}

type dealResponse = {
  success: boolean;
  data: [
    {
      id: number;
      creator_user_id: {
        id: number;
        name: string;
        email: string;
        has_pic: number;
        pic_hash: string;
        active_flag: boolean;
        value: number;
      };
      user_id: {
        id: number;
        name: string;
        email: string;
        has_pic: number;
        pic_hash: string;
        active_flag: boolean;
        value: number;
      };
      person_id: {
        active_flag: boolean;
        name: string;
        email: [
          {
            label: string;
            value: string;
            primary: boolean;
          }
        ];
        phone: [
          {
            label: string;
            value: string;
            primary: boolean;
          }
        ];
        value: number;
      };
      org_id: {
        name: string;
        people_count: number;
        owner_id: number;
        address: string;
        active_flag: boolean;
        cc_email: string;
        value: number;
      };
      stage_id: number;
      stageName: string; //need stage name
      stage_pipelineName: string; //need pipeline name
      stage_dealProbability: number; // do not need deal probability
      title: string;
      value: number;
      currency: string;
      add_time: string; // need this
      update_time: string; // need this
      stage_change_time: string; // keep this as well
      active: boolean;
      deleted: boolean;
      status: string; //Need Status
      probability: number;
      next_activity_date: string; //Need Next Activity Date to determine how many per week (tasks) (specific client care and weekly prospecting)
      next_activity_time: string;
      next_activity_id: number;
      last_activity_id: number;
      last_activity_date: string;
      lost_reason: string;
      visible_to: string;
      close_time: string;
      pipeline_id: number;
      won_time: string;
      first_won_time: string;
      lost_time: string;
      products_count: number;
      files_count: number;
      notes_count: number;
      followers_count: number;
      email_messages_count: number;
      activities_count: number; //
      done_activities_count: number;
      undone_activities_count: number;
      reference_activities_count: number;
      participants_count: number;
      expected_close_date: string;
      last_incoming_mail_time: string;
      last_outgoing_mail_time: string;
      label: number;
      stage_order_nr: number;
      person_name: string;
      org_name: string;
      next_activity_subject: string;
      next_activity_type: string;
      next_activity_duration: string;
      next_activity_note: string;
      formatted_value: string; // need this one too
      weighted_value: number;
      formatted_weighted_value: string;
      weighted_value_currency: string;
      rotten_time: string; // need the owner name
      owner_name: string;
      cc_email: string;
      "4ff3ab1c142d1f55cbe84472f5267619ef942265": number; //primary estimator
      "7fb3d86d9d871f9fdbcf0920cf03903463b9b40e": number; //secondary estimator
      org_hidden: boolean;
      person_hidden: boolean;
    }
  ];
  additional_data: {
    pagination: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
    };
  };
  related_objects: {
    user: {
      [key: string]: {
        id: number;
        name: string;
        email: string;
        has_pic: number;
        pic_hash: string;
        active_flag: boolean;
        value: number;
      };
    };
    person: {
      [key: string]: {
        active_flag: boolean;
        name: string;
        email: [
          {
            label: string;
            value: string;
            primary: boolean;
          }
        ];
        phone: [
          {
            label: string;
            value: string;
            primary: boolean;
          }
        ];
        value: number;
      };
    };
    organization: {
      [key: string]: {
        name: string;
        people_count: number;
        owner_id: number;
        address: string;
        active_flag: boolean;
        cc_email: string;
        value: number;
      };
    };
    stage: {
      [key: string]: {
        id: number;
        name: string; //pull the pipeline name
        active_flag: boolean;
        deal_probability: number;
        pipeline_id: number;
        rotten_flag: boolean;
        rotten_days: number;
        add_time: string;
        update_time: string;
        pipeline_name: string;
        pipeline_deal_probability: number;
        pipeline_order_nr: number;
        pipeline_active: boolean;
      };
    };
    pipeline: {

      [key: string]: {
        id: number;
        name: string;
        url_title: string;
        active: boolean;
        add_time: string;
        update_time: string;
        selected: boolean;
        creator_user_id: number;
        order_nr: number;
        deal_probability: number;
        rotten_flag: boolean;
        rotten_days: number;
        weighted_value: number;
        owner_name: string;
        owner_id: number;
      };
    };
  };
}