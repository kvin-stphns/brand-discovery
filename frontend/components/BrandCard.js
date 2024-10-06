import React from 'react'
import styles from '../styles/BrandCard.module.css'

const BrandCard = ({ name, category, image }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={name} className={styles.image} />
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.category}>{category}</p>
    </div>
  )
}

export default BrandCard