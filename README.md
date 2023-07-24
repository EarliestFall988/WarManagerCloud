# War Manager
This is the War Manager Cloud repository. The PWA is a construction planning hub primarily aimed to support large subcontractors. It provides a simple, predictable user interface that can be manually or 'automagically' propagated with crew members, projects, crew/project plans, and schedules for project managers, superintendents, operators, foremen, and crew members.

This project does include authentication via google or microsoft only, and is not yet rated for critical information like SSIDs, HIPPA (e-PHI), and other high security information. It does however include (or is quickly eligible for) many criteria required by the CMMC and DFARs requirements (but not all).

Currently you must have a jrcousa.com domain email to interact with the web application (except for the landing page).

The information provided in this document is meant only to provide users with information and is not legal advice.

https://cloud.dev.warmanager.net

## Authors/Contributors To War Manager

- Taylor Howell (EarliestFall988)

If you have questions or comments, contact Taylor @ taylor.howell@jrcousa.com

## License

Apache Open Source License

See: LICENSE for more details

## Stack

- T3 Stack:
  - Typescript
  - Next 13 (pages API)
  - TRPC
  - Prisma
  - Tailwind
  - ZOD
- Clerk
- Radix UI
- Deployed on Vercel
- Upstash (Redis cache for rate limiting)
- Axiom

(Updated July 24th, 2023)
