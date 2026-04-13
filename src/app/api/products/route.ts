import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'products.json')

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

function readProducts(): Product[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('Error reading products file:', error)
    return []
  }
}

function writeProducts(products: Product[]): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2))
  } catch (error) {
    console.error('Error writing products file:', error)
  }
}

function generateId(): string {
  return `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function GET() {
  try {
    const products = readProducts()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const products = readProducts()
    
    const newProduct: Product = {
      id: generateId(),
      name: body.name,
      category: body.category,
      price: body.price,
      badge: body.badge || '',
      featured: body.featured || false,
      newArrival: body.newArrival || false,
      shortDescription: body.shortDescription,
      description: body.description,
      details: body.details || [],
      images: body.images || [],
      heritageStory: body.heritageStory || ''
    }
    
    products.unshift(newProduct)
    writeProducts(products)
    
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    const products = readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const updatedProduct: Product = {
      ...products[index],
      name: body.name,
      category: body.category,
      price: body.price,
      badge: body.badge || '',
      featured: body.featured || false,
      newArrival: body.newArrival || false,
      shortDescription: body.shortDescription,
      description: body.description,
      details: body.details || [],
      images: body.images || [],
      heritageStory: body.heritageStory || ''
    }
    
    products[index] = updatedProduct
    writeProducts(products)
    
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const products = readProducts()
    const filteredProducts = products.filter(p => p.id !== id)
    
    if (filteredProducts.length === products.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    writeProducts(filteredProducts)
    
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}