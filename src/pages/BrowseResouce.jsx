
import { useMemo, useState } from 'react'
import { Search, Heart } from 'lucide-react'
import { useListings } from '../context/ListingContext'

export default function BrowseResource() {
  const { listings } = useListings()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')

  const categories = [
    'All',
    'Books',
    'Electronics',
    'Lab Equipment',
    'Calculators',
    'Notes',
    'Other',
  ]

  const filteredListings = useMemo(() => {
    const result = listings.filter((item) => {
      const matchesSearch =
        `${item.title} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesCategory =
        category === 'All' || item.category === category

      return matchesSearch && matchesCategory
    })

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt)
    }

    return result
  }, [listings, search, category, sort])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Browse Resources
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Find books, equipment and other useful things from students.
        </p>
      </header>

      {/* Search and sorting */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by resource name..."
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="newest">Newest first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              category === item
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        {filteredListings.length}{' '}
        {filteredListings.length === 1 ? 'resource' : 'resources'} found
      </p>

      {/* Resource cards */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex h-44 items-center justify-center bg-slate-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-slate-400">
                    No image available
                  </span>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      {item.category}
                    </p>
                    <h2 className="mt-1 font-semibold text-slate-900">
                      {item.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    title="Wishlist feature will be connected next"
                    aria-label="Save resource"
                    className="shrink-0 rounded-full border border-slate-200 p-2 text-slate-500 hover:text-red-500"
                  >
                    <Heart size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-bold text-slate-900">
                    {item.transactionType === 'Donate'
                      ? 'Free'
                      : `₹${Number(item.price).toLocaleString('en-IN')}`}
                  </p>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {item.condition}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                  Listed by {item.sellerName}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-800">
            No resources found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try another search or choose a different category.
          </p>
        </div>
      )}
    </div>
  )
}
