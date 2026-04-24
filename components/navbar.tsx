import Link from "next/link";

import MainNav from "@/components/main-nav";
import Container from "@/components/ui/container";
import NavbarActions from "@/components/navbar-actions";
const Navbar = () => {
  return ( 
    <div className="border-b">
      <Container>
        {/* Grid avoids center nav overlapping the auth block (common on cart after checkout). */}
        <div className="grid h-16 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 max-w-[42vw] shrink-0 items-center gap-x-2 sm:max-w-none">
            <p className="truncate font-bold text-xl">BOUTIQUE</p>
          </Link>
          <div className="flex min-w-0 justify-center overflow-x-auto border-x border-transparent px-1">
            <MainNav />
          </div>
          <div className="isolate flex min-w-0 shrink-0 justify-end border-l border-zinc-200/80 bg-white pl-2 dark:border-zinc-700/80 dark:bg-zinc-950 sm:pl-3">
            <NavbarActions />
          </div>
        </div>
      </Container>
    </div>
  );
};
 
export default Navbar;
