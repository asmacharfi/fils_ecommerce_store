import Link from "next/link";

import MainNav from "@/components/main-nav";
import Container from "@/components/ui/container";
import NavbarActions from "@/components/navbar-actions";
const Navbar = () => {
  return ( 
    <div className="border-b">
      <Container>
        <div className="relative flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="relative z-10 ml-4 flex gap-x-2 lg:ml-0">
            <p className="font-bold text-xl">BOUTIQUE</p>
          </Link>
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center">
            <div className="pointer-events-auto mx-auto min-w-0 max-w-[min(calc(100vw-9rem),36rem)] overflow-x-auto px-1 sm:max-w-[min(calc(100vw-11rem),40rem)]">
              <MainNav />
            </div>
          </div>
          <div className="relative z-20 ml-auto shrink-0">
            <NavbarActions />
          </div>
        </div>
      </Container>
    </div>
  );
};
 
export default Navbar;
