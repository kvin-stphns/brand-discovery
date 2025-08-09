import React from 'react'
import Image from 'next/image'
import styles from '../styles/BrandCard.module.css'

const BrandCard = ({ name, category, image }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image src={image} alt={name} fill className={styles.image} />
      </div>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.category}>{category}</p>
    </div>
  )
}

export default BrandCard