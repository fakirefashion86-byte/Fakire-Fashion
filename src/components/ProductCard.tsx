import Link from "next/link";
import Image from "next/image";
import WishlistHeart from "./WishlistHeart";

type ProductCardProps = {
  id: number;
  name: string;
  price: number | string;
  mrp: number | string;
  imageUrl: string | null;
  wishlisted?: boolean;
  loggedIn?: boolean;
};

export default function ProductCard({
  id,
  name,
  price,
  mrp,
  imageUrl,
  wishlisted = false,
  loggedIn = true,
}: ProductCardProps) {
  const priceNum = Number(price);
  const mrpNum = Number(mrp);
  const hasDiscount = mrpNum > priceNum;

  return (
    <Link href={`/product/${id}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-section">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-muted">
            No image
          </div>
        )}
        <WishlistHeart
          productId={id}
          initialWishlisted={wishlisted}
          loggedIn={loggedIn}
          className="absolute right-2 top-2"
        />
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="text-sm">
          <span className="font-semibold text-foreground">₹{priceNum.toFixed(0)}</span>
          {hasDiscount && (
            <span className="ml-2 text-ink-muted line-through">₹{mrpNum.toFixed(0)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
