import { useState } from 'react'
import {
  Search,
  BookOpen,
  Laptop,
  Calculator,
  FlaskConical,
  NotebookPen,
  Heart,
  ArrowRight,
  Plus,
  Users,
  Package,
  Repeat2,
  Star,
  GraduationCap,
} from 'lucide-react'

const categories = [
  { name: 'Books', icon: BookOpen, color: 'bg-green-100 text-green-700' },
  { name: 'Electronics', icon: Laptop, color: 'bg-blue-100 text-blue-700' },
  { name: 'Lab Equipment', icon: FlaskConical, color: 'bg-teal-100 text-teal-700' },
  { name: 'Calculators', icon: Calculator, color: 'bg-orange-100 text-orange-700' },
  { name: 'Notes', icon: NotebookPen, color: 'bg-purple-100 text-purple-700' },
]

const resources = [
  {
    id: 1,
    title: 'Engineering Mathematics Book',
    category: 'Books',
    price: 150,
    condition: 'Good',
    seller: '2nd Year',
    icon: BookOpen,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    id: 2,
    title: 'Arduino UNO',
    category: 'Electronics',
    price: 300,
    condition: 'Like New',
    seller: 'ECE',
    icon: Laptop,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 3,
    title: 'Scientific Calculator',
    category: 'Calculators',
    price: 500,
    condition: 'Good',
    seller: '3rd Year',
    icon: Calculator,
    color: 'bg-violet-100 text-violet-700',
  },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState([])

  const filteredResources = resources.filter((item) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  function toggleSaved(id) {
    setSaved((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8">

      {/* Page heading and search */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            BIT Sindri Marketplace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome to Campus Loop
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Find what you need. Share what you don't.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
            <GraduationCap size={16} />
            Made for BIT Sindri students
          </div>

          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Share More.
            <br />
            Spend Less.
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
            Buy, sell, borrow, or exchange books, electronics,
            lab equipment, and study materials within your campus.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Explore Resources
              <ArrowRight size={17} />
            </a>

            <a
              href="/add-resource"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Plus size={17} />
              List a Resource
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full border-[35px] border-white/5 sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Popular Categories
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore resources by category
            </p>
          </div>

          <a
            href="/browse"
            className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all →
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map(({ name, icon: Icon, color }) => (
            <button
              key={name}
              onClick={() => {
                window.location.href =
                  `/browse?category=${encodeURIComponent(name)}`
              }}
              className="flex min-w-0 flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md sm:p-5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon size={24} />
              </div>

              <span className="text-center text-sm font-medium text-slate-700">
                {name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured resources */}
      

      {/* Bottom call to action */}
      <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Have something you're no longer using?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Help another student while earning or sharing resources.
          </p>
        </div>

        <a
          href="/add-resource"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add a Resource
        </a>
      </section>
    </div>
  )
}