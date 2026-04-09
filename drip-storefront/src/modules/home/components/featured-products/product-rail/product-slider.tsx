"use client"

import { useRef } from "react"
import ProductPreview from "@modules/products/components/product-preview"

export default function ProductSlider({ products, region }) {

  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return

    const width = ref.current.clientWidth

    ref.current.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">

      {/* arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow"
      >
        ←
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow"
      >
        →
      </button>

      <div
        ref={ref}
        className="
        flex
        gap-8
        overflow-x-auto
        scroll-smooth
        snap-x
        snap-mandatory
        px-6
        "
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="
            min-w-[280px]
            snap-start
            group
            "
          >
            <div className="transition group-hover:-translate-y-1 group-hover:shadow-lg">

              <ProductPreview
                product={product}
                region={region}
              />

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}