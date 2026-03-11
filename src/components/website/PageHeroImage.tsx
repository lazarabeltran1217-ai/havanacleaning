import Image from "next/image";

interface PageHeroImageProps {
  imageUrl: string;
  alt?: string;
  overlayClass?: string;
}

export function PageHeroImage({
  imageUrl,
  alt = "",
  overlayClass = "bg-tobacco/70",
}: PageHeroImageProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Image src={imageUrl} alt={alt} fill className="object-cover" priority />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </div>
  );
}
