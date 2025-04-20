const Permission = require("../models/permissions.model");
const Role = require("../models/role.model");

const seedDatabase = async () => {
  try {
    const rolesExist = await Role.countDocuments();
    if (rolesExist > 0) {
      console.log("Roles already exist. Seeding aborted.");
      return;
    }

    console.log("Deleting existing permissions...");
    await Permission.deleteMany({});

    const ownerPermissions = {
      workshop: ["create", "edit", "delete", "view"],
      project: ["create", "edit", "delete", "view"],
      task: ["create", "edit", "delete", "view"],
      member: ["add", "edit", "delete", "view"],
    };

    const adminPermissions = {
      workshop: ["create", "edit", "view"],
      project: ["create", "edit", "delete", "view"],
      task: ["create", "edit", "delete", "view"],
      member: ["add", "edit", "delete", "view"],
    };

    const memberPermissions = {
      workshop: ["view"],
      project: ["view"],
      task: ["edit", "view"],
      member: ["view"],
    };

    console.log("Creating permissions...");
    const [ownerPermission, adminPermission, memberPermission] =
      await Promise.all([
        Permission.create(ownerPermissions),
        Permission.create(adminPermissions),
        Permission.create(memberPermissions),
      ]);

    console.log("Permissions created!");

    const roles = [
      { name: "Owner", permissions: ownerPermission._id },
      { name: "Admin", permissions: adminPermission._id },
      { name: "Member", permissions: memberPermission._id },
    ];

    await Role.insertMany(roles);
    console.log("Roles seeded successfully!");
  } catch (error) {
    console.error("Error Seeding Database:", error.message);
  }
};

module.exports = seedDatabase;
