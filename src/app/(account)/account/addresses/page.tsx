import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddressManager } from "@/components/website/AddressManager";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-display text-xl text-tobacco dark:text-cream mb-5">My Addresses</h2>
      <AddressManager
        initialAddresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          street: a.street,
          unit: a.unit,
          city: a.city,
          state: a.state,
          zipCode: a.zipCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
