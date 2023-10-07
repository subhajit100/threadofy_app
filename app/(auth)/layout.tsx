import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
  title: "Threadofy - Unleash Seamless Conversations",
  description:
    "Elevate your messaging experience with Threadofy, the ultimate app for weaving interconnected and fluid conversations. Threadofy reimagines how you communicate, providing a dynamic platform where your conversations evolve naturally. Seamlessly link related messages, ideas, and topics, creating intricate threads that are both intuitive and visually engaging.Threadofy empowers you to take control of your discussions, ensuring that every conversation remains organized, coherent, and easy to follow. Our intuitive interface lets you effortlessly branch off into subtopics, allowing you to explore deeper discussions without losing context. Stay on top of your conversations with threaded notifications, making it easier than ever to catch up on what matters most.With Threadofy, you will experience a new level of collaboration and clarity in your chats. Whether you are managing work projects or keeping up with friends and family, Threadofy is your go-to app for threading the story of your life. Discover a more connected and coherent way to communicate – Threadofy, where conversations flow seamlessly.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
