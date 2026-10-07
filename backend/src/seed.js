require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "mentor@example.com";
  const plainPassword = "mentor123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Mentor already exists:", existing.email);
    return;
  }

  const password = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password,
      role: "MENTOR",
    },
  });

  console.log("Created mentor:");
  console.log(" email:", email);
  console.log(" password:", plainPassword);
  console.log(" id:", user.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });