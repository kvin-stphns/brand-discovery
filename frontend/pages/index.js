import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import SearchBar from '../components/SearchBar'
import BrandCard from '../components/BrandCard'
import { Button } from "../components/ui/button"

export default function Home() {
  const [brands, setBrands] = useState([])
  const [filteredBrands, setFilteredBrands] = useState([])

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands') // This will be implemented later
      const data = await response.json()
      setBrands(data)
      setFilteredBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleSearch = (query) => {
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(query.toLowerCase()) ||
      brand.category.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredBrands(filtered)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Fashion Brand Discovery</title>
        <meta name="description" content="Discover decentralized fashion brands" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Fashion Brand Discovery</h1>
        <SearchBar onSearch={handleSearch} />
        <div className={styles.grid}>
          {filteredBrands.map(brand => (
            <BrandCard
              key={brand.id}
              name={brand.name}
              category={brand.category}
              image={brand.image}
            />
          ))}
        </div>
      </main>
    </div>
  )
}