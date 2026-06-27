import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.note.count();
  if (count > 0) return;

  await prisma.note.createMany({
    data: [
      { title: "Первая заметка из seed" },
      { title: "Вторая заметка из seed" },
    ],
  });
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
