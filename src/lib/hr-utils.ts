import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get company ID from the current user's session
 * Returns the companyId of the logged-in user
 */
export async function getCompanyId(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });
    
    return user?.companyId || null;
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
}

