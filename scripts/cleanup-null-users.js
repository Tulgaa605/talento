// Script to find and optionally delete JobApplications with null userId
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for JobApplications with null userId...\n');

  // Find all applications with null userId
  const nullUserApplications = await prisma.jobApplication.findMany({
    where: {
      userId: null
    },
    select: {
      id: true,
      jobId: true,
      status: true,
      createdAt: true
    }
  });

  console.log(`Found ${nullUserApplications.length} applications with null userId:\n`);
  
  if (nullUserApplications.length > 0) {
    nullUserApplications.forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app.id}`);
      console.log(`   Job ID: ${app.jobId}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt.toISOString()}\n`);
    });

    // Uncomment the lines below to DELETE these applications
    // WARNING: This will permanently delete data!
    
    /*
    console.log('⚠️  DELETING applications with null userId...');
    const result = await prisma.jobApplication.deleteMany({
      where: {
        userId: null
      }
    });
    console.log(`✅ Deleted ${result.count} applications`);
    */

    console.log('ℹ️  To delete these applications, uncomment the delete code in the script.');
  } else {
    console.log('✅ No applications with null userId found!');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


