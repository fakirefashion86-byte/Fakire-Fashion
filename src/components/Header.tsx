import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnnouncementBar from "./AnnouncementBar";
import MobileMenu from "./MobileMenu";
import LogoutButton from "./LogoutButton";
import { SearchIcon, UserIcon, HeartIcon } from "./icons";

export default async function Header() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
    : null;
  const isStaff = session?.role === "admin" || session?.role === "tailor";

  return (
    <header className="sticky top-0 z-40 bg-header-bg">
      <AnnouncementBar />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <MobileMenu isLoggedIn={Boolean(user)} userName={user?.name ?? null} isStaff={isStaff} />

        <Link href="/" className="mx-auto md:mx-0">
          <p className="text-center font-serif text-2xl font-semibold tracking-wide text-header-text">
            Fakire Fashion
          </p>
          <p className="mt-0.5 text-center text-[10px] tracking-[0.3em] text-gold">
            ETHNIC WEAR
          </p>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-header-text md:flex">
          <Link href="/category/women" className="hover:text-gold">
            Women
          </Link>
          <Link href="/category/men" className="hover:text-gold">
            Men
          </Link>
          <Link href="/stitching/new" className="hover:text-gold">
            Custom Stitching
          </Link>
          <Link href="/contact" className="hover:text-gold">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="hidden text-header-text hover:text-gold sm:block">
            <SearchIcon className="h-5 w-5" />
          </button>
          {user ? (
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/account" className="flex items-center gap-1.5 text-sm text-header-text hover:text-gold">
                <UserIcon className="h-5 w-5" />
                {user.name}
              </Link>
              {!isStaff && (
                <Link href="/orders" className="text-sm text-header-text hover:text-gold">
                  My Orders
                </Link>
              )}
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="hidden text-header-text hover:text-gold md:block" aria-label="Login">
              <UserIcon className="h-5 w-5" />
            </Link>
          )}
          <button aria-label="Wishlist" className="hidden text-header-text hover:text-gold sm:block">
            <HeartIcon className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            className="text-header-text hover:text-gold md:hidden"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
