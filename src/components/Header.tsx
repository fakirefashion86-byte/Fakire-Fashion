import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MobileMenu from "./MobileMenu";
import LogoutButton from "./LogoutButton";
import { SearchIcon, UserIcon, HeartIcon, ScissorsIcon, TruckIcon, WhatsAppIcon } from "./icons";

export default async function Header() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } })
    : null;
  const isStaff = session?.role === "admin" || session?.role === "tailor";
  const isAdmin = session?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-40 bg-black">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/Logo-icon.webp"
              alt="Fakire Fashion"
              width={50}
              height={50}
              priority
              className="h-[50px] w-[50px] object-cover"
              style={{ filter: "brightness(1.2) saturate(1.3) contrast(0.95)" }}
            />
            <span className="font-serif text-lg font-semibold text-white sm:text-xl">Fakire Fashion</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-white md:flex">
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
            <button aria-label="Search" className="hidden text-white hover:text-gold sm:block">
              <SearchIcon className="h-5 w-5" />
            </button>
            {user ? (
              <div className="hidden items-center gap-4 md:flex">
                <Link href="/account" className="flex items-center gap-1.5 text-sm text-white hover:text-gold">
                  <UserIcon className="h-5 w-5" />
                  {user.name}
                </Link>
                {!isStaff && (
                  <Link href="/orders" className="text-sm text-white hover:text-gold">
                    My Orders
                  </Link>
                )}
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="hidden text-white hover:text-gold md:block" aria-label="Login">
                <UserIcon className="h-5 w-5" />
              </Link>
            )}
            <button aria-label="Wishlist" className="hidden text-white hover:text-gold sm:block">
              <HeartIcon className="h-5 w-5" />
            </button>

            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Login"}
              className="text-white md:hidden"
            >
              <UserIcon className="h-6 w-6" />
            </Link>
            <span aria-hidden className="h-6 w-px bg-gold/70 md:hidden" />
            <MobileMenu isLoggedIn={Boolean(user)} userName={user?.name ?? null} isStaff={isStaff} isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      <div className="border-b border-black/5 bg-[#f3ede1]">
        <div className="mx-auto flex max-w-6xl divide-x divide-black/10 overflow-x-auto">
          <Link
            href="/stitching/new"
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 hover:opacity-80 sm:gap-3 sm:px-5 sm:py-3"
          >
            <ScissorsIcon className="h-5 w-5 shrink-0 text-gold sm:h-6 sm:w-6" />
            <span>
              <span className="block text-xs font-semibold text-black sm:text-sm">Free Tailoring</span>
              <span className="hidden text-xs text-black/60 sm:block">Perfect Fit Guaranteed</span>
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
            <TruckIcon className="h-5 w-5 shrink-0 text-gold sm:h-6 sm:w-6" />
            <span>
              <span className="block text-xs font-semibold text-black sm:text-sm">Free Home Delivery</span>
              <span className="hidden text-xs text-black/60 sm:block">Safe &amp; Fast Delivery</span>
            </span>
          </div>
          <a
            href="https://wa.me/919454282015"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-2 py-2.5 hover:opacity-80 sm:gap-3 sm:px-5 sm:py-3"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
            <span>
              <span className="block text-xs font-semibold text-black sm:text-sm">WhatsApp</span>
              <span className="hidden text-xs text-black/60 sm:block">9454282015</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
