// import { PrismaClient } from "@prisma/client";

// import crewData from "./seed/crew";
// import projectData from "./seed/projects";

// const prisma = new PrismaClient();

// const load = async () => {
//   try {
//     await prisma.project.createMany({
//       data: projectData.map((project) => ({
//         name: project.name,
//         description: project.description,
//         authorId: project.authorId,
//       })),
//     });

//     await prisma.crewMember.createMany({
//       data: crewData,
//     });
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// await load();
