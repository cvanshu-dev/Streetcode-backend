"use client"

import React from "react"

export default function CategorySplitSection() {
  return (
    <section className="w-full h-screen p-6 grid md:grid-cols-2 grid-cols-1 gap-6">

      {/* LEFT SIDE - TOPWEAR */}
      <div className="relative w-full h-full overflow-hidden group rounded-xl">

        <img
          src="/img2.jpg"
          alt="Topwear"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 bg-black/20 text-white">
          <h2 className="text-4xl font-semibold tracking-wide">
            Topwear
          </h2>

          <button className="w-fit px-6 py-3 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition">
            Shop
          </button>
        </div>
      </div>

      {/* RIGHT SIDE - BOTTOMWEAR */}
      <div className="relative w-full h-full overflow-hidden group rounded-xl">

        <img
          src="/img3.jpg"
          alt="Bottomwear"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-10 bg-black/20 text-white">
          <h2 className="text-4xl font-semibold tracking-wide">
            Bottomwear
          </h2>

          <button className="w-fit px-6 py-3 border border-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition">
            Shop
          </button>
        </div>
      </div>

    </section>
  )
}
