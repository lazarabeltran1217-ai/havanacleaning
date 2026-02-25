import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ServiceEditButton } from "@/components/admin/ServiceEditor";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: {
      addOns: { where: { isActive: true } },
      pricingRules: { orderBy: [{ bedroomsMin: "asc" }] },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Services Management</h2>

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl border border-[#ece6d9] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{service.icon}</span>
                <div>
                  <h3 className="font-display text-lg">{service.name}</h3>
                  {!service.isActive && (
                    <span className="text-red text-[0.78rem]">INACTIVE</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-green">
                    {service.basePrice > 0 ? formatCurrency(service.basePrice) : "Custom"}
                  </div>
                  <div className="text-gray-400 text-[0.78rem]">~{service.estimatedHours}h</div>
                </div>
                <ServiceEditButton service={{
                  id: service.id,
                  name: service.name,
                  nameEs: service.nameEs,
                  description: service.description,
                  descriptionEs: service.descriptionEs,
                  icon: service.icon,
                  basePrice: service.basePrice,
                  estimatedHours: service.estimatedHours,
                  isActive: service.isActive,
                  isFeatured: service.isFeatured,
                  sortOrder: service.sortOrder,
                }} />
              </div>
            </div>

            <p className="text-gray-500 text-[0.85rem] mb-4">{service.description}</p>

            {/* PRICING RULES */}
            {service.pricingRules.length > 0 && (
              <div className="mb-4">
                <h4 className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-2">Pricing Rules</h4>
                <div className="flex flex-wrap gap-2">
                  {service.pricingRules.map((rule) => (
                    <span key={rule.id} className="text-[0.78rem] bg-ivory px-3 py-1 rounded-full border border-tobacco/10">
                      {rule.bedroomsMin}-{rule.bedroomsMax} bed / {rule.bathroomsMin}-{rule.bathroomsMax} bath → {formatCurrency(rule.price)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ADD-ONS */}
            {service.addOns.length > 0 && (
              <div>
                <h4 className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-2">Add-Ons</h4>
                <div className="flex flex-wrap gap-2">
                  {service.addOns.map((addon) => (
                    <span key={addon.id} className="text-[0.78rem] bg-green-mint px-3 py-1 rounded-full border border-green/10">
                      {addon.name} +{formatCurrency(addon.price)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
