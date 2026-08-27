import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { RoleName, DishAvailability } from '../generated/prisma/enums';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});
const prisma = new PrismaClient({ adapter });

// Same cost factor AuthService uses, so seeded users behave identically to
// ones created through the real registration flow.
const BCRYPT_COST = 12;

async function seedRoles() {
  const roleNames: RoleName[] = [
    RoleName.CLIENT,
    RoleName.STAFF,
    RoleName.KITCHEN,
    RoleName.ADMIN,
  ];

  for (const name of roleNames) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedUser(
  email: string,
  password: string,
  roleName: RoleName,
) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  const role = await prisma.role.findUniqueOrThrow({
    where: { name: roleName },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  return user;
}

async function seedMenu() {
  const categories = [
    {
      name: 'Appetizers',
      order: 1,
      dishes: [
        { name: 'Bruschetta', basicPrice: 12000, description: 'Grilled bread with tomato and basil' },
        { name: 'Caesar Salad', basicPrice: 15500, description: 'Romaine, parmesan, croutons, caesar dressing' },
        { name: 'Soup of the Day', basicPrice: 9000, description: "Ask your server what's cooking today" },
      ],
    },
    {
      name: 'Main Courses',
      order: 2,
      dishes: [
        { name: 'Grilled Salmon', basicPrice: 32000, description: 'With seasonal vegetables' },
        {
          name: 'Beef Steak',
          basicPrice: 45000,
          description: 'Ribeye, medium rare, served with fries',
          // Deliberately "sold out" so the frontend can show the stop-list UI.
          availability: DishAvailability.UNAVAILABLE,
        },
        { name: 'Margherita Pizza', basicPrice: 18000, description: 'Tomato, mozzarella, basil' },
        {
          name: 'Chef Special (draft)',
          basicPrice: 25000,
          description: 'Not ready for the public menu yet',
          // Should never appear on the public menu - verifies the HIDDEN filter.
          availability: DishAvailability.HIDDEN,
        },
      ],
    },
    {
      name: 'Desserts',
      order: 3,
      dishes: [
        { name: 'Tiramisu', basicPrice: 11000, description: 'Classic Italian dessert' },
        { name: 'Cheesecake', basicPrice: 12500, description: 'New York style' },
      ],
    },
    {
      name: 'Drinks',
      order: 4,
      dishes: [
        { name: 'Espresso', basicPrice: 4500, description: '' },
        { name: 'Fresh Orange Juice', basicPrice: 6000, description: '' },
        { name: 'Cola', basicPrice: 3500, description: '' },
      ],
    },
  ];

  for (const category of categories) {
    const menuCategory = await prisma.menuCategory.upsert({
      where: { name: category.name },
      update: { order: category.order },
      create: { name: category.name, order: category.order },
    });

    for (const dish of category.dishes) {
      const existing = await prisma.dish.findFirst({
        where: { name: dish.name, categoryId: menuCategory.id },
      });

      const availability = dish.availability ?? DishAvailability.AVAILABLE;

      if (existing) {
        await prisma.dish.update({
          where: { id: existing.id },
          data: {
            basicPrice: dish.basicPrice,
            description: dish.description,
            availability,
          },
        });
      } else {
        await prisma.dish.create({
          data: {
            name: dish.name,
            basicPrice: dish.basicPrice,
            description: dish.description,
            availability,
            categoryId: menuCategory.id,
          },
        });
      }
    }
  }
}

async function seedTables() {
  const tables = [
    { number: 1, capacity: 2 },
    { number: 2, capacity: 2 },
    { number: 3, capacity: 4 },
    { number: 4, capacity: 4 },
    { number: 5, capacity: 6 },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: { capacity: table.capacity },
      create: table,
    });
  }
}

async function main() {
  console.log('Seeding roles...');
  await seedRoles();

  console.log('Seeding users...');
  await seedUser('admin@restaurant-os.dev', 'Admin123!', 'ADMIN');
  await seedUser('client@restaurant-os.dev', 'Client123!', 'CLIENT');

  console.log('Seeding menu...');
  await seedMenu();

  console.log('Seeding tables...');
  await seedTables();

  console.log('Done. Test accounts:');
  console.log('  admin@restaurant-os.dev / Admin123!');
  console.log('  client@restaurant-os.dev / Client123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
