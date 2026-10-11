
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../context/ListingContext'
import { auth, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

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
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(selectedImage)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedImage])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    setError('')

    if (!file) {
      setSelectedImage(null)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      event.target.value = ''
      setSelectedImage(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.')
      event.target.value = ''
      setSelectedImage(null)
      return
    }

    setSelectedImage(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please enter the resource name and description.')
      return
    }

    if (
      form.transactionType !== 'Donate' &&
      (
        form.price === '' ||
        !Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0
      )
    ) {
      setError('Please enter a valid price.')
      return
    }

    if (!auth.currentUser) {
      setError('Please log in before publishing a resource.')
      return
    }

    setPublishing(true)

    try {
      let imageUrl = ''

      // Upload the selected image, if one was chosen.
      if (selectedImage) {
        const safeFileName = selectedImage.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )

        const imageRef = ref(
          storage,
          `resources/${auth.currentUser.uid}/${Date.now()}-${safeFileName}`
        )

        const uploadResult = await uploadBytes(
          imageRef,
          selectedImage,
          { contentType: selectedImage.type }
        )

        imageUrl = await getDownloadURL(uploadResult.ref)
      }

      // Save the listing and its image URL in Firestore.
      await addListing({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        price:
          form.transactionType === 'Donate'
            ? 0
            : Number(form.price),
        sellerName:
          form.sellerName.trim() || 'Campus student',
        image: imageUrl,
      })

      navigate('/browse')
    } catch (err) {
      console.error('Error publishing resource:', err)
      setError(
        err.message || 'Could not publish resource. Please try again.'
      )
    } finally {
      setPublishing(false)
    }
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
          <label htmlFor="imageFile" className="mb-2 block text-sm font-medium">
            Resource image (optional)
          </label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700"
          />
          <p className="mt-1 text-xs text-slate-500">
            Choose an image from your computer. Maximum size: 5 MB.
          </p>

          {previewUrl && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-slate-600">
                Image preview
              </p>
              <img
                src={previewUrl}
                alt="Selected resource preview"
                className="h-44 max-w-full rounded-lg border border-slate-200 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null)
                  const input = document.getElementById('imageFile')
                  if (input) input.value = ''
                }}
                className="mt-2 text-sm font-medium text-red-600 hover:underline"
              >
                Remove image
              </button>
            </div>
          )}
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
            disabled={publishing}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={publishing}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing ? 'Publishing...' : 'Publish Resource'}
          </button>
        </div>
      </form>
    </div>
  )
}
