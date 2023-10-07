import { ClerkProvider } from "@clerk/nextjs/app-beta";
import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import Bottombar from "@/components/shared/Bottombar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Threadofy - Unleash Seamless Conversations",
  description:
    "Elevate your messaging experience with Threadofy, the ultimate app for weaving interconnected and fluid conversations. Threadofy reimagines how you communicate, providing a dynamic platform where your conversations evolve naturally. Seamlessly link related messages, ideas, and topics, creating intricate threads that are both intuitive and visually engaging.Threadofy empowers you to take control of your discussions, ensuring that every conversation remains organized, coherent, and easy to follow. Our intuitive interface lets you effortlessly branch off into subtopics, allowing you to explore deeper discussions without losing context. Stay on top of your conversations with threaded notifications, making it easier than ever to catch up on what matters most.With Threadofy, you will experience a new level of collaboration and clarity in your chats. Whether you are managing work projects or keeping up with friends and family, Threadofy is your go-to app for threading the story of your life. Discover a more connected and coherent way to communicate – Threadofy, where conversations flow seamlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
          <main className="flex flex-row">
            <LeftSidebar />
            <section className="main-container">
              <div className="w-full max-w-4xl">{children}</div>
            </section>
            <RightSidebar />
          </main>
          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  );
}

