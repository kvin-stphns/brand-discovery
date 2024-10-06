import React, { useState } from 'react'
import styles from '../styles/SearchBar.module.css'

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('')

  const handleInputChange = (event) => {
    const value = event.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search brands..."
        value={query}
        onChange={handleInputChange}
        className={styles.input}
      />
    </div>
  )
}

export default SearchBar