require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const plainPassword = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const password = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password,
      role: "ADMIN",
    },
  });

  console.log("Created admin:");
  console.log(" email:", email);
  console.log(" password:", plainPassword);
  console.log(" id:", user.id);
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());