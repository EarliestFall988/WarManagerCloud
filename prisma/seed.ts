import { Log, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const projectsAmount = 30;
  const crewMembersAmount = 40;
  const logsAmount = 100;

  if (
    process.env.DATABASE_URL === undefined ||
    process.env.DATABASE_URL[8] !== "v"
  ) {
    console.log("pushing to the wrong database, exiting...");
    return;
  }

  console.log("\tseeding database...\n");

  const sectors = await prisma.sector.findMany({});

  console.log("\tdeleting all projects and crew members...\n");

  await prisma.project.deleteMany({});
  await prisma.crewMember.deleteMany({});
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

  console.log("\tcreating logs...\n");

  const logs = Array.from({ length: logsAmount })
    .map(createLog)
    .filter((log) => log !== null && log !== undefined);

  await prisma.log.createMany({
    data: logs,
  });

  console.log("\tconnecting projects and crew members to sectors...\n");

  const allProjects = await prisma.project.findMany({});
  const allcrewMembers = await prisma.crewMember.findMany({});

  allcrewMembers.map(async (crewMember) => {
    await prisma.crewMember.update({
      where: { id: crewMember.id },
      data: {
        sectorId: faker.helpers.arrayElement(sectors).id,
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
    action:  faker.helpers.arrayElement(['url', 'url', 'external url', '']),
    authorId: "user_2QORhpe7PBgTKw1uWGH0SSIJMsO",
    category: faker.helpers.arrayElement([
      "blueprint",
      "sector",
      "crewMember",
      "project",
      'schedule',
      'announcement',
    ]),
    createdAt: faker.date.past(),
    data: "",
    description: faker.lorem.paragraph(),
    name: faker.company.catchPhrase(),
    severity: faker.helpers.arrayElement(["info", "moderate", "critical"]),
    updatedAt: faker.date.past(),
    url: faker.internet.url(),
  };
};

const createCrewMember = () => {
  return {
    authorId: "user_2QORhpe7PBgTKw1uWGH0SSIJMsO",
    name: faker.person.firstName() + " " + faker.person.lastName(),
    position: faker.person.jobTitle(),
    description: faker.person.jobType(),

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
  };
};

const createProject = () => {
  return {
    authorId: "user_2QORhpe7PBgTKw1uWGH0SSIJMsO",
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
    endDate: faker.date.soon(),
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