import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

import ProductSlider from "./product-slider"
import InteractiveLink from "@modules/common/components/interactive-link"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
      limit: 12,
    },
  })

  if (!products?.length) return null

  return (
    <section className="py-24 border-t border-neutral-200">

      <div className="content-container mb-16 flex items-end justify-between">
        <div>
          <span className="text-xs tracking-[0.35em] uppercase text-neutral-400">
            Featured Collection
          </span>

          <Heading level="h2" className="text-5xl font-semibold mt-2">
            {collection.title}
          </Heading>
        </div>

        <InteractiveLink
          href={`/collections/${collection.handle}`}
          className="text-sm uppercase tracking-widest font-semibold"
        >
          View All
        </InteractiveLink>
      </div>

      <ProductSlider products={products} region={region} />

    </section>
  )
}