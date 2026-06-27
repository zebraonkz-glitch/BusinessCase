import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "verify@test.local";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Test User" },
    create: {
      email,
      name: "Test User",
    },
  });

  const category = await prisma.category.upsert({
    where: { id: "verify-category" },
    update: {},
    create: {
      id: "verify-category",
      category: "General",
    },
  });

  const testCase = await prisma.case.upsert({
    where: { id: "verify-case" },
    update: {
      title: "Test prompt",
      content: "Prompt body for verification",
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
    create: {
      id: "verify-case",
      ownerId: user.id,
      title: "Test prompt",
      content: "Prompt body for verification",
      categoryId: category.id,
      // visibility: PUBLIC for voting
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  });

  const vote = await prisma.vote.upsert({
    where: {
      userId_caseId: {
        userId: user.id,
        caseId: testCase.id,
      },
    },
    update: { value: 1 },
    create: {
      userId: user.id,
      caseId: testCase.id,
      value: 1,
    },
  });

  console.log("OK: user", user.id, user.email);
  console.log("OK: case", testCase.id, testCase.title);
  console.log("OK: vote", vote.id, "value=", vote.value);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
