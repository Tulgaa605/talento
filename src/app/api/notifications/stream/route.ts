import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set up SSE headers
    const response = new NextResponse(
      new ReadableStream({
        start(controller) {
          const sendNotification = (data: any) => {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(new TextEncoder().encode(message));
          };

          // Send initial connection message
          sendNotification({ type: 'connected', message: 'Connected to notification stream' });

          // Set up polling for new notifications
          let lastCheck = new Date();
          
          const checkForNewNotifications = async () => {
            try {
              const newNotifications = await prisma.notification.findMany({
                where: {
                  userId: session.user.id,
                  read: false,
                  createdAt: {
                    gt: lastCheck,
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              });

              if (newNotifications.length > 0) {
                newNotifications.forEach(notification => {
                  sendNotification({
                    type: 'new_notification',
                    notification,
                  });
                });
              }

              lastCheck = new Date();
            } catch (error) {
              console.error('Error checking for new notifications:', error);
            }
          };

          // Check for new notifications every 5 seconds
          const interval = setInterval(checkForNewNotifications, 5000);

          // Clean up on disconnect
          request.signal.addEventListener('abort', () => {
            clearInterval(interval);
            controller.close();
          });
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error setting up notification stream:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 