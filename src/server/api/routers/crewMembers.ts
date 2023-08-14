import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

import isMobilePhone from "validator/lib/isMobilePhone";
import { clerkClient } from "@clerk/nextjs";
import { Tag, type Prisma } from "@prisma/client";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const crewMembersRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const crewMembers = await ctx.prisma.crewMember.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        tags: true,
      },
    });

    return crewMembers;
  }),

  download: privateProcedure.query(async ({ ctx }) => {
    const crewMembers = await ctx.prisma.crewMember.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return crewMembers;
  }),

  search: privateProcedure
    .input(
      z.object({
        search: z.string().min(0).max(255),
        filter: z.array(z.string()),
        sectors: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const filters: Prisma.CrewMemberWhereInput = {};

      if (input.filter.length > 0) {
        filters.tags = {
          some: {
            id: {
              in: input.filter,
            },
          },
        };
      }

      if (input.search.length > 0) {
        filters.OR = [
          {
            name: {
              contains: input.search,
            },
          },
          {
            position: {
              contains: input.search,
            },
          },
          {
            description: {
              contains: input.search,
            },
          },
          {
            phone: {
              contains: input.search,
            },
          },
          {
            email: {
              contains: input.search,
            },
          },
          {
            rating: {
              contains: input.search,
            },
          },
        ];
      }

      if (input.sectors.length > 0) {
        filters.sector = {
          id: {
            in: input.sectors,
          },
        };
      }

      const result = await ctx.prisma.crewMember.findMany({
        where: filters,
        include: {
          tags: true,
          sector: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return result;
    }),

  getById: privateProcedure
    .input(z.object({ crewMemberId: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMember = await ctx.prisma.crewMember.findUnique({
        where: {
          id: input.crewMemberId,
        },
        include: {
          tags: true,
          sector: true,
          schedules: {
            include: {
              project: {
                include: {
                  sectors: true,
                  tags: true,
                }
              }
            },
          },
          blueprints: true,
        },
      });

      crewMember?.medicalCardExpDate;

      return crewMember;
    }),

  getByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const crewMembers = await ctx.prisma.crewMember.findMany({
        where: {
          name: {
            contains: input.name,
          },
        },
        include: {
          tags: true,
        },
      });
      return crewMembers;
    }),

  update: privateProcedure
    .input(
      z.object({
        crewMemberId: z.string({
          required_error: "Crew member ID is required.",
        }),
        name: z
          .string({ required_error: "Crew member name is required." })
          .min(3, "A crew member's name must be at least 3 characters long.")
          .max(
            255,
            "A crew member's name cannot be longer than 255 characters."
          ),
        position: z
          .string({ required_error: "A crew member's position is required." })
          .min(3, "A crew member must have a position")
          .max(255, "The position name is too long."),
        notes: z
          .string()
          .min(0)
          .max(255, "Crew member notes must be less than 255 characters.")
          .optional(),
        phone: z
          .string({ required_error: "Phone Number is required." })
          .refine(isMobilePhone, "The phone number is invalid."),
        email: z
          .union([z.string().length(0), z.string().email()])
          .optional()
          .transform((e) => (e === "" ? null : e)),
        tags: z.array(z.string()),
        sectors: z
          .array(z.string())
          .min(1, "A crew member must belong to a sector.")
          .max(
            1,
            "A crew member cannot belong to more than one sector at a time."
          ),
        wage: z
          .number({ required_error: "A crew member must have a wage" })
          .min(0, "The wage must be a positive number.")
          .max(1000000, "The wage must be less than 1000000."),
        burden: z
          .number({ required_error: "A crew member must have burden" })
          .min(0, "The burden must be a positive number.")
          .max(1000000, "The burden must be less than 1000000."),
        rating: z
          .number({
            required_error: "A rating has not been assigned to the crew member",
          })
          .min(0, "The rating must be a value greater than or equal to zero.")
          .max(10, "The rating must be less than or equal to 10."),

        medicalCardSignedDate: z.date().optional(),
        medicalCardExpirationDate: z.date().optional(),
        includesMedicalCard: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const oldCrewMember = await ctx.prisma.crewMember.findUnique({
        where: {
          id: input.crewMemberId,
        },
        include: {
          tags: true,
          sector: true,
        },
      });

      const crewData = {
        ...oldCrewMember,
      };

      let disconnectTags = oldCrewMember?.tags?.filter((tag) => {
        return !input.tags?.includes(tag.id);
      });

      if (!input.sectors || input.sectors.length < 1 || !input.sectors[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member must belong to a sector.",
        });
      }

      const sector = input.sectors[0];

      let medicalCardExpDate = input.medicalCardExpirationDate as
        | Date
        | undefined
        | null;
      let medicalCardSignedDate = input.medicalCardSignedDate as
        | Date
        | undefined
        | null;

      let tags = input.tags;

      if (input.includesMedicalCard === false) {
        medicalCardExpDate = null;
        medicalCardSignedDate = null;

        console.log(
          "does not include medical card:",
          input.includesMedicalCard
        );

        const medicalCardTag = await ctx.prisma.tag.findFirst({
          where: {
            name: "Med Card",
          },
        });

        console.log("medical card tag found:", medicalCardTag);

        if (medicalCardTag) {
          if (!disconnectTags) {
            disconnectTags = [] as Tag[];
          }

          disconnectTags?.push({
            ...medicalCardTag,
          });

          console.log("disconnect tags:", disconnectTags);
          tags = tags.filter((tag) => tag !== medicalCardTag.id);
        }
      } else {
        if (medicalCardExpDate && medicalCardSignedDate) {
          const medicalCardTag = await ctx.prisma.tag.findFirst({
            where: {
              name: "Med Card",
            },
          });

          console.log("medical card tag found:", medicalCardTag);

          tags.push(medicalCardTag?.id as string);
        }
      }

      const crewMember = await ctx.prisma.crewMember.update({
        where: {
          id: input.crewMemberId,
        },
        data: {
          name: input.name.trim(),
          position: input.position.trim(),
          description: input.notes?.trim(),
          phone: input.phone.trim(),
          email: input?.email?.trim() || "",
          wage: input.wage,
          burden: input.burden,
          rating: input.rating.toString().trim(),
          sectorId: sector,
          medicalCardExpDate: medicalCardExpDate,
          medicalCardSignedDate: medicalCardSignedDate,
          tags: {
            disconnect: disconnectTags?.map((tag) => ({
              id: tag.id,
            })),

            connect: input.tags?.map((tag) => ({
              id: tag,
            })),
          },
        },
        include: {
          tags: true,
          sector: true,
        },
      });

      let updatedName = false;
      let updatedPosition = false;
      let updatedDescription = false;
      let updatedPhone = false;
      let updatedEmail = false;
      let updatedWage = false;
      let updatedBurden = false;
      let updatedRating = false;
      let updatedTags = false;
      let updatedSectors = false;

      if (crewData.name !== crewMember.name) {
        updatedName = true;
      }

      if (crewData.position !== crewMember.position) {
        updatedPosition = true;
      }

      if (crewData.description !== crewMember.description) {
        updatedDescription = true;
      }

      if (crewData.phone !== crewMember.phone) {
        updatedPhone = true;
      }

      if (crewData.email !== crewMember.email) {
        updatedEmail = true;
      }

      if (crewData.wage !== crewMember.wage) {
        updatedWage = true;
      }

      if (crewData.burden !== crewMember.burden) {
        updatedBurden = true;
      }

      if (crewData.rating !== crewMember.rating) {
        updatedRating = true;
      }

      if (crewData.sectorId !== crewMember.sectorId) {
        updatedSectors = true;
      }

      if (crewData.tags?.length !== crewMember.tags?.length) {
        updatedTags = true;
      }

      crewData.tags?.forEach((tag) => {
        if (!crewMember.tags?.find((t) => t.id === tag.id)) {
          updatedTags = true;
        }
      });

      let result = "";
      let changes = 0;

      if (updatedName) {
        result += `Name: ${oldCrewMember?.name || ""} -> ${crewMember.name}\n`;
        changes++;
      }

      if (updatedPosition) {
        result += `Position: ${oldCrewMember?.position || ""} -> ${
          crewMember.position
        }\n`;
        changes++;
      }

      if (updatedDescription) {
        result += `Notes: ${oldCrewMember?.description || ""} -> ${
          crewMember.description || ""
        }\n`;
        changes++;
      }

      if (updatedPhone) {
        result += `Phone: ${oldCrewMember?.phone || ""} -> ${
          crewMember.phone
        }\n`;
        changes++;
      }

      if (updatedEmail) {
        result += `Email: ${oldCrewMember?.email || ""} -> ${
          crewMember.email
        }\n`;
        changes++;
      }

      if (updatedWage) {
        result += `Wage: $${oldCrewMember?.wage || ""} -> $${
          crewMember.wage
        }\n`;
        changes++;
      }

      if (updatedBurden) {
        result += `Burden: $${oldCrewMember?.burden || ""} -> $${
          crewMember.burden
        }\n`;
        changes++;
      }

      if (updatedRating) {
        result += `Rating: ${oldCrewMember?.rating || ""} -> ${
          crewMember.rating
        }\n`;
        changes++;
      }

      if (updatedTags) {
        result += `Tags: ${
          oldCrewMember?.tags?.map((tag) => tag.name).join(", ") || ""
        } -> ${crewMember.tags?.map((tag) => tag.name).join(", ")}`;
        changes++;
      }

      if (updatedSectors) {
        result += `Sector: ${oldCrewMember?.sector?.name || ""} -> ${
          crewMember.sector?.name || ""
        }`;
        changes++;
      }

      await ctx.prisma.log.create({
        data: {
          name: `Updated Crew Member ${crewMember.name}`,
          action: "url",
          url: `/crewmember/${crewMember.id}`,
          authorId: authorId,
          category: "crew",
          description: `${changes} ${
            changes == 1 ? "change" : "changes"
          }: \n${result}`,
          severity: "moderate",
        },
      });

      return crewMember;
    }),

  createMany: privateProcedure
    .input(
      z
        .object({
          name: z
            .string({ required_error: "Crew member name is required." })
            .min(3, "A crew member's name must be at least 3 characters long.")
            .max(
              255,
              "A crew member's name cannot be longer than 255 characters."
            ),
          position: z
            .string({ required_error: "A crew member's position is required." })
            .min(3, "A crew member must have a position")
            .max(255, "The position name is too long."),
          phone: z
            .string({ required_error: "Phone Number is required." })
            .refine(isMobilePhone, "The phone number is invalid."),
          startDate: z.date(),
          lastReviewDate: z.date().optional(),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const content = input.map((obj) => {
        if (obj !== undefined) {
          const d = obj;

          if (
            d?.name !== undefined &&
            d?.phone !== undefined &&
            d?.position !== undefined &&
            d?.startDate !== undefined &&
            d?.lastReviewDate !== undefined
          ) {
            return {
              authorId,
              name: d.name.trim(),
              position: d.position.trim(),
              description: "",

              phone: d.phone.trim(),
              email: "",
              skills: "",
              rating: "5",
              lastReviewDate: d?.lastReviewDate,
              startDate: d?.startDate,
              wage: 0,
              burden: 0,
              travel: "",
              rate: 0,
              hours: 0,
              total: 0,
            };
          }
        }

        return {
          authorId,
          name: "",
          position: "",
          description: "",

          phone: "",
          email: "",
          skills: "",
          rating: "5",
          wage: 0,
          burden: 0,
          travel: "",
          rate: 0,
          hours: 0,
          total: 0,
        };
      });

      if (!content) {
        throw new Error("No data");
      }

      const data = content.filter(
        (obj) => obj !== undefined && obj !== null && obj.name !== ""
      );

      const crewMembers = await ctx.prisma.crewMember.createMany({
        data,
      });

      return crewMembers;
    }),

  create: privateProcedure
    .input(
      z.object({
        name: z
          .string({ required_error: "Crew member name is required." })
          .min(3, "A crew member's name must be at least 3 characters long.")
          .max(
            255,
            "A crew member's name cannot be longer than 255 characters."
          ),
        position: z
          .string({ required_error: "A crew member's position is required." })
          .min(3, "A crew member must have a position")
          .max(255, "The position name is too long."),
        notes: z
          .string()
          .min(0)
          .max(255, "Crew member notes must be less than 255 characters.")
          .optional(),
        phone: z
          .string({ required_error: "Phone Number is required." })
          .refine(isMobilePhone, "The phone number is invalid."),
        email: z
          .string({ required_error: "Email is required." })
          .email("The email is invalid.")
          .max(255, "Email must be less than 255 characters."),
        tags: z.array(z.string()),
        sectors: z
          .array(z.string())
          .min(1, "A member must be assigned a sector.")
          .max(1, "A member cannot be assigned more than one sector."),
        wage: z
          .number({ required_error: "A crew member must have a wage" })
          .min(0, "The wage must be a positive number.")
          .max(1000000, "The wage must be less than 1000000."),
        burden: z
          .number({ required_error: "A crew member must have burden" })
          .min(0, "The burden must be a positive number.")
          .max(1000000, "The burden must be less than 1000000."),
        rating: z
          .number({
            required_error: "A rating has not been assigned to the crew member",
          })
          .min(0, "The rating must be a value greater than or equal to zero.")
          .max(10, "The rating must be less than or equal to 10."),
        medicalCardSignedDate: z.date().optional(),
        medicalCardExpirationDate: z.date().optional(),
        includesMedicalCard: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const FoundCrewMember = await ctx.prisma.crewMember.findFirst({
        where: {
          name: input.name.trim(),
        },
      });

      if (FoundCrewMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member with this name already exists.",
        });
      }

      if (input.sectors.length < 1 || !input.sectors[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A crew member must belong to a sector.",
        });
      }

      const sector = input.sectors[0];

      let medicalCardExpDate = input.medicalCardExpirationDate as
        | Date
        | undefined
        | null;
      let medicalCardSignedDate = input.medicalCardSignedDate as
        | Date
        | undefined
        | null;

      if (input.includesMedicalCard === false) {
        medicalCardExpDate = null;
        medicalCardSignedDate = null;
      }

      const tags = input.tags;

      if (medicalCardExpDate && medicalCardSignedDate) {
        const medicalCardTag = await ctx.prisma.tag.findFirst({
          where: {
            name: "Med Card",
          },
        });

        tags.push(medicalCardTag?.id as string);
      }

      const crewMember = await ctx.prisma.crewMember.create({
        data: {
          authorId,
          name: input.name.trim(),
          position: input.position.trim(),
          description: input.notes?.trim() || "",

          phone: input.phone.trim(),
          email: input.email.trim(),
          skills: "",
          rating: input.rating.toString().trim(),
          lastReviewDate: new Date(),

          wage: input.wage,
          burden: input.burden,
          travel: "",
          rate: 0,
          hours: 0,
          total: 0,

          sectorId: sector,
          medicalCardExpDate: medicalCardExpDate,
          medicalCardSignedDate: medicalCardSignedDate,
          tags: {
            connect: tags.map((tag) => ({
              id: tag,
            })),
          },
        },
      });

      const sectorData = await ctx.prisma.sector.findUnique({
        where: {
          id: sector,
        },
      });

      const name = sectorData?.name || "<unknown>";

      await ctx.prisma.log.create({
        data: {
          action: "url",
          category: "crew",
          name: `Created new Crew Member \"${input.name}\"`,
          authorId: authorId,
          url: `/crewmember/${crewMember.id}`,
          description: `${email} created new crew member \"${input.name}\" (${input.position} in the ${name} sector)`,
          severity: "moderate",
        },
      });

      return crewMember;
    }),

  delete: privateProcedure
    .input(z.object({ crewMemberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const user = await clerkClient.users.getUser(authorId);

      const email = user?.emailAddresses[0]?.emailAddress;

      if (!user || !email || user.banned) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to perform this action",
        });
      }

      const crewMember = await ctx.prisma.crewMember.delete({
        where: {
          id: input.crewMemberId,
        },
      });

      await ctx.prisma.log.create({
        data: {
          action: "none",
          category: "crew",
          name: `Deleted Crew Member \"${crewMember.name}\"`,
          authorId: authorId,
          url: `/#`,
          description: `${email} deleted crew member \"${crewMember.name}\" (\"${crewMember.position}\")`,
          severity: "critical",
        },
      });

      return crewMember;
    }),
});
