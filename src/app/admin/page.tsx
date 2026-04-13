'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  category: string
  price: number
  badge?: string
  featured: boolean
  newArrival: boolean
  shortDescription: string
  description: string
  details: string[]
  images: string[]
  heritageStory: string
}

const categories = [
  { slug: "necklaces", name: "Necklaces", accent: "coral" },
  { slug: "bracelets", name: "Bracelets", accent: "teal" },
  { slug: "earrings", name: "Earrings", accent: "terracotta" },
  { slug: "home-decor", name: "Home Decor", accent: "ochre" },
  { slug: "bags-accessories", name: "Bags & Accessories", accent: "terracotta" },
  { slug: "gift-sets", name: "Gift Sets", accent: "teal" },
  { slug: "bridal-occasion", name: "Bridal & Occasion", accent: "coral" }
]

const colors = {
  primary: "#C04D29",
  secondary: "#B87333",
  accent: "#8B5A2B",
  text: "#2C1810",
  background: "#F8F4F0",
  border: "#E6D7CD"
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'necklaces',
    price: '',
    badge: '',
    featured: false,
    newArrival: false,
    shortDescription: '',
    description: '',
    details: '',
    images: '',
    heritageStory: ''
  })
  const [activeTab, setActiveTab] = useState('products')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: Number(formData.price),
      details: formData.details.split(',').map(d => d.trim()).filter(Boolean),
      images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
    }

    try {
      const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        setStatus(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
        resetForm()
        fetchProducts()
        setTimeout(() => setStatus(''), 3000)
      }
    } catch (error) {
      setStatus('Error saving product. Please try again.')
    }
  }

  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      badge: product.badge || '',
      featured: product.featured,
      newArrival: product.newArrival,
      shortDescription: product.shortDescription,
      description: product.description,
      details: product.details.join(', '),
      images: product.images.join(', '),
      heritageStory: product.heritageStory
    })
    setActiveTab('products')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setStatus('Product deleted successfully!')
        fetchProducts()
        setTimeout(() => setStatus(''), 3000)
      }
    } catch (error) {
      setStatus('Error deleting product.')
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: 'necklaces',
      price: '',
      badge: '',
      featured: false,
      newArrival: false,
      shortDescription: '',
      description: '',
      details: '',
      images: '',
      heritageStory: ''
    })
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: colors.primary,
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>SharonCraft Admin</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Product Management Dashboard</p>
        </div>
        <div>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: colors.secondary,
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            View Website
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: `1px solid ${colors.border}`,
          padding: '1rem',
          minHeight: 'calc(100vh - 70px)'
        }}>
          <nav>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                backgroundColor: activeTab === 'products' ? colors.primary : 'transparent',
                color: activeTab === 'products' ? 'white' : colors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'products' ? '600' : '400'
              }}
            >
              📦 Products
            </button>
            <button
              onClick={() => setActiveTab('add')}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                backgroundColor: activeTab === 'add' ? colors.primary : 'transparent',
                color: activeTab === 'add' ? 'white' : colors.text,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeTab === 'add' ? '600' : '400'
              }}
            >
              ➕ Add Product
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {status && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #c3e6cb'
            }}>
              {status}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2 style={{ color: colors.text, marginBottom: '1rem' }}>Product Catalog</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {products.map(product => (
                  <div key={product.id} style={{
                    backgroundColor: 'white',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: colors.text }}>{product.name}</h3>
                      {product.badge && (
                        <span style={{
                          backgroundColor: colors.primary,
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ color: colors.text, opacity: 0.7, margin: '0.5rem 0', fontSize: '0.875rem' }}>
                      {getCategoryName(product.category)}
                    </p>
                    <p style={{ color: colors.primary, fontWeight: '700', margin: '0.5rem 0' }}>
                      KES {product.price.toLocaleString()}
                    </p>
                    <p style={{ color: colors.text, fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {product.shortDescription}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => editProduct(product)}
                        style={{
                          flex: 1,
                          backgroundColor: colors.secondary,
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <h2 style={{ color: colors.text, marginBottom: '1rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                maxWidth: '800px'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Badge (optional)
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    placeholder="e.g., New, Best Seller"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Short Description
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Heritage Story
                  </label>
                  <textarea
                    name="heritageStory"
                    value={formData.heritageStory}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Details (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Handmade in Kenya, Gift ready, etc."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: colors.text }}>
                    Image URLs (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    placeholder="/assets/images/product1.jpg, /assets/images/product2.jpg"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Featured on Homepage
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="newArrival"
                      checked={formData.newArrival}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Mark as New
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      flex: 1,
                      backgroundColor: colors.border,
                      color: colors.text,
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function getCategoryName(slug: string): string {
  const category = categories.find(cat => cat.slug === slug)
  return category?.name || slug
}