import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { dark } from "@clerk/themes";

const Topbar = () => {
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">
          Threadofy
        </p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          {/* this signedIn section will only be rendered if user is signedin */}
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
                <Image
                  src="/assets/logout.svg"
                  alt="logout"
                  width={24}
                  height={24}
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
          <OrganizationSwitcher
            appearance={{
                baseTheme: dark,
                elements: {
                  organizationSwitcherTrigger: "py-2 px-4",
                },
              }}
          />
      </div>
    </nav>
  );
};

export default Topbar;
