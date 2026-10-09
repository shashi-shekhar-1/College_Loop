
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../context/ListingContext'

const initialForm = {
  title: '',
  description: '',
  price: '',
  category: 'Books',
  condition: 'Good',
  transactionType: 'Sell',
  sellerName: '',
  image: '',
}

export default function AddResource() {
  const { addListing } = useListings()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please enter the resource name and description.')
      return
    }

    if (
      form.transactionType !== 'Donate' &&
      (form.price === '' ||
        !Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0)
    ) {
      setError('Please enter a valid price.')
      return
    }

    addListing({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.transactionType === 'Donate'
        ? 0
        : Number(form.price),
      sellerName: form.sellerName.trim() || 'Campus student',
    })

    navigate('/browse')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Add Resource
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          List something another student might need.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Resource name *
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Engineering Mathematics Book"
            maxLength={100}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option>Books</option>
              <option>Electronics</option>
              <option>Lab Equipment</option>
              <option>Calculators</option>
              <option>Notes</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="condition" className="mb-2 block text-sm font-medium">
              Condition *
            </label>
            <select
              id="condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
            >
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Needs Repair</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="transactionType" className="mb-2 block text-sm font-medium">
            What do you want to do? *
          </label>
          <select
            id="transactionType"
            name="transactionType"
            value={form.transactionType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="Sell">Sell</option>
            <option value="Borrow">Lend / Borrow</option>
            <option value="Exchange">Exchange</option>
            <option value="Donate">Donate</option>
          </select>
        </div>

        {form.transactionType !== 'Donate' && (
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium">
              Price in ₹ *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              required
              placeholder="Enter amount"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            maxLength={1000}
            rows={4}
            placeholder="Mention the condition, edition, or any useful details."
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="sellerName" className="mb-2 block text-sm font-medium">
            Display name (temporary)
          </label>
          <input
            id="sellerName"
            name="sellerName"
            value={form.sellerName}
            onChange={handleChange}
            placeholder="Your name"
            maxLength={60}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            Image URL (optional, temporary)
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            We'll add image uploads when we connect Firebase Storage.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button> 

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Publish Resource
          </button>
        </div>
      </form>
    </div>
  )
}
