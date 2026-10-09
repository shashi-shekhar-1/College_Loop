
import { createContext, useContext, useState } from 'react'

const ListingContext = createContext(null)
// just temporary storage for listings, in a real app this would be fetched from a server or database
const initialListings = [
  {
    id: 'sample-1',
    title: 'Engineering Mathematics Book',
    description: 'Book in good condition.',
    price: 150,
    category: 'Books',
    condition: 'Good',
    transactionType: 'Sell',
    sellerName: 'Sample Student',
    image: '',
    createdAt: Date.now(),
  },
  {
    id: 'sample-2',
    title: 'Scientific Calculator',
    description: 'Working properly.',
    price: 500,
    category: 'Calculators',
    condition: 'Like New',
    transactionType: 'Sell',
    sellerName: 'Sample Student',
    image: '',
    createdAt: Date.now() - 1000,
  },
]

export function ListingProvider({ children }) {
  const [listings, setListings] = useState(initialListings)

  function addListing(formData) {
    const newListing = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }

    setListings((currentListings) => [
      newListing,
      ...currentListings,
    ])
  }

  return (
    <ListingContext.Provider value={{ listings, addListing }}>
      {children}
    </ListingContext.Provider>
  )
}

export function useListings() {
  const context = useContext(ListingContext)

  if (!context) {
    throw new Error(
      'useListings must be used inside ListingProvider'
    )
  }

  return context
}
