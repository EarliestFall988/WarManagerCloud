import { PrismaClient, type Tag } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const projectsAmount = 50;
  const crewMembersAmount = 200;
  const logsAmount = 20;
  const tagCount = 10;

  if (
    process.env.DATABASE_URL === undefined ||
    process.env.DATABASE_URL[8] !== "v"
  ) {
    console.log("pushing to the wrong database, exiting...");
    return;
  }

  console.log("\tseeding database...\n");

  const sectors = await prisma.sector.findMany({});

  console.log(
    "\tdeleting all projects, schedule items, links, logs, blueprints, and crew members...\n"
  );

  await prisma.scheduleHistoryItem.deleteMany({});
  await prisma.scheduleHistory.deleteMany({});
  await prisma.blueprint.deleteMany({});
  await prisma.exportLink.deleteMany({});

  await prisma.project.deleteMany({});
  await prisma.crewMember.deleteMany({});
  await prisma.logReaction.deleteMany({});
  await prisma.logReply.deleteMany({});
  await prisma.log.deleteMany({});

  console.log("\tcreating projects and crew members...\n");

  const projects = Array.from({ length: projectsAmount })
    .map(createProject)
    .filter((project) => project !== null && project !== undefined);

  const crewMembers = Array.from({ length: crewMembersAmount })
    .map(createCrewMember)
    .filter((crew) => crew !== null && crew !== undefined);

  await prisma.project.createMany({
    data: projects,
  });

  await prisma.crewMember.createMany({
    data: crewMembers,
  });

  // await prisma.tag.createMany({
  //   data: CreateTags(tagCount),
  // });

  console.log("\tcreating logs...\n");

  const logs = Array.from({ length: logsAmount })
    .map(createLog)
    .filter((log) => log !== null && log !== undefined);

  logs.map(async (log) => {
    const res = await prisma.log.create({
      data: {
        ...log,
      },
    });

    const reactions = createLogReactions();
    const replies = createLogReplies();

    reactions.map(async (r) => {
      if (res.id === undefined) throw new Error("log id is undefined");
      await prisma.logReaction.create({
        data: {
          ...r,
          log: {
            connect: {
              id: res.id,
            },
          },
        },
      });
    });

    replies.map(async (r) => {
      await prisma.logReply.create({
        data: {
          ...r,
          log: {
            connect: {
              id: res.id,
            },
          },
        },
      });
    });
  });

  console.log("\tconnecting projects and crew members to sectors...\n");

  const allProjects = await prisma.project.findMany({});
  const allcrewMembers = await prisma.crewMember.findMany({});

  let storedTags = await prisma.tag.findMany({});

  if (storedTags == null || !storedTags) {
    storedTags = [] as Tag[];
  }

  // console.log(storedTags);

  allcrewMembers.map(async (crewMember) => {
    const tags = getRandomTags(storedTags).map((x) => x.id);

    await prisma.crewMember.update({
      where: { id: crewMember.id },
      data: {
        sectorId: faker.helpers.arrayElement(sectors).id,
        tags: {
          connect: tags?.map((tag) => ({
            id: tag,
          })),
        },
      },
    });
  });

  allProjects.map(async (project) => {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        sectors: {
          connect: {
            id: faker.helpers.arrayElement(sectors).id,
          },
        },
      },
    });
  });

  console.log("\tseeding complete!\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });

const createLog = () => {
  return {
    action: faker.helpers.arrayElement(["url", "url", "external url", ""]),
    authorId: getAuthor(),
    category: faker.helpers.arrayElement([
      "blueprint",
      "sector",
      "crewMember",
      "project",
      "schedule",
      "announcement",
    ]),
    createdAt: faker.date.past(),
    data: "",
    description: faker.lorem.paragraph(),
    editedMessage: faker.helpers.arrayElement([
      faker.lorem.paragraph(),
      "",
      "",
    ]),
    name: faker.company.catchPhrase(),
    severity: faker.helpers.arrayElement(["info", "moderate", "critical"]),
    updatedAt: faker.date.past(),
    url: faker.internet.url(),
  };
};

const CreateTags = (number: number) => {
  const tags = [];
  for (let i = 0; i < number; i++) {
    const aut = getAuthor();
    tags.push({
      authorId: aut,
      name: faker.lorem.word(),
      description: faker.lorem.paragraph(),
      backgroundColor: faker.internet.color(),
      systemTag: false,
      type: faker.helpers.arrayElement(["crewMember", "project"]),
    } as Tag);
  }

  return tags;
};

const createCrewMember = () => {
  const num = faker.number.float({ min: 0, max: 50 });

  let signedMedCardDate = undefined as Date | undefined;
  let medCardExpDate = undefined as Date | undefined;

  if (num > 35) {
    signedMedCardDate = faker.date.past();
    medCardExpDate = faker.date.future();
  }

  return {
    authorId: getAuthor(),
    name: faker.person.firstName() + " " + faker.person.lastName(),
    position: faker.person.jobTitle(),
    description: faker.person.bio(),

    phone: faker.phone.number(),
    email: faker.helpers.arrayElement([
      `${
        faker.company.buzzNoun() +
        faker.number.int({ min: 0, max: 1000 }).toString() +
        "@" +
        faker.internet.domainName()
      }`,
      faker.person.firstName() +
        "." +
        faker.person.lastName() +
        "@" +
        faker.internet.domainName(),
    ]),
    skills: "",
    rating: faker.number.int({ min: 0, max: 10 }).toString(),
    lastReviewDate: faker.date.past(),
    startDate: faker.date.past(),
    wage: faker.number.float({ min: 0, max: 65 }),
    burden: faker.number.float({ min: 20, max: 65 }),
    travel: "",
    rate: faker.number.float({ min: 0, max: 10 }),
    hours: faker.number.float({ min: 0, max: 50 }),
    total: faker.number.float({ min: 0, max: 50 }),
    medicalCardExpDate: medCardExpDate,
    medicalCardSignedDate: signedMedCardDate,
  };
};

const createProject = () => {
  return {
    authorId: getAuthor(),
    name: faker.helpers.arrayElement([
      `${faker.company.name()}`,
      `${faker.company.name()} on ${faker.location.streetAddress()}`,
      `${faker.person.fullName()}'s residence`,
      `${faker.location.streetAddress()}`,
      `${faker.company.catchPhraseNoun()}`,
    ]),
    description: faker.company.buzzPhrase(),
    jobNumber: faker.string.alpha(2) + "-" + faker.number.int(1000).toString(),
    address: faker.location.streetAddress(),
    notes: faker.company.catchPhraseDescriptor(),

    TotalManHours: faker.number.float({ min: 0, max: 1000000 }),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    status: faker.helpers.arrayElement([
      "100% Complete",
      "Awaiting Phase 2",
      "Closeout Phase",
      "In Progress: Bad",
      "In Progress: Good",
      "JR Punch List",
      "Legal",
      "MF Inspection",
      "MF Punch List",
      "Start 2 Weeks",
      "Start 30 Days",
      "Start 60 Days",
      "Start 90+ Days",
      "Active",
      "Inactive",
      "Closed",
    ]),
    percentComplete: faker.number.float(100),
    completed: faker.datatype.boolean(),

    laborCost: faker.number.float({ min: 0, max: 1000000 }),
    subContractorCost: faker.number.float({ min: 0, max: 1000000 }),
    materialCost: faker.number.float({ min: 0, max: 1000000 }),
    equipmentCost: faker.number.float({ min: 0, max: 1000000 }),
    otherCost: faker.number.float({ min: 0, max: 1000000 }),

    safetyRating: faker.number.int({ min: 0, max: 10 }).toString(),
    qualityRating: faker.number.int({ min: 0, max: 10 }).toString(),
    staffingRating: faker.number.int({ min: 0, max: 10 }).toString(),
    profitabilityRating: faker.number.int({ min: 0, max: 10 }).toString(),
    customerRating: faker.number.int({ min: 0, max: 10 }).toString(),

    BillDate: new Date(),

    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
  };
};

const createLogReactions = () => {
  const res = faker.number.int({ min: 0, max: 5 });

  const logReactions = [];
  for (let i = 0; i < res; i++) {
    const aut = getAuthor();
    logReactions.push({
      authorId: aut,
      reaction: faker.helpers.arrayElement(["👍", "❤️", "🚀", "🔥"]),
    });
  }

  return logReactions;
};

const createLogReplies = () => {
  const res = faker.number.int({ min: 0, max: 2 });

  const logReplies = [];
  for (let i = 0; i < res; i++) {
    const aut = getAuthor();
    logReplies.push({
      authorId: aut,
      message: faker.lorem.paragraph(),
      editedMessage: faker.helpers.arrayElement([
        faker.lorem.paragraph(),
        "",
        "",
      ]),
    });
  }

  // console.log(logReplies);

  return logReplies;
};

const getAuthor = () => {
  return faker.helpers.arrayElement([
    "user_2S9yAC71mJaqEyRi43xN5AtXNGJ",
    "user_2QORhpe7PBgTKw1uWGH0SSIJMsO",
    "user_2R7WFE7ikyHXaCKM8xr8m4ilrJ2",
    "user_2TAMsSNVKhWniXZ5LRZizdYUWNV",
    "user_2TAMh3ThQTK7a09w9Z0TpNybPg7",
  ]);
};

const getRandomTags = (tags: Tag[]) => {
  const res = faker.number.int({ min: 0, max: tags.length / 2 });

  const selectedTags = [] as Tag[];

  const tagsToPush = [];
  for (let i = 0; i < res; i++) {
    const randomInt = faker.number.int({ min: 0, max: tags.length - 1 });

    const tag = tags[randomInt];

    if (tag == undefined) throw new Error("tag is undefined");

    tags.filter((x) => x.id !== tag.id);
    selectedTags.push(tag);

    tagsToPush.push(tag);
  }

  selectedTags.map((tag) => {
    tagsToPush.push(tag);
  });

  return tagsToPush;
};
