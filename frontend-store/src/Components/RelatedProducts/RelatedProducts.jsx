import React, { useState, useEffect } from 'react';
import './RelatedProducts.css';

import Item from '../Item/Item';

const RelatedProducts = () => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/allproducts') // Fetch all products
      .then(response => response.json())
      .then(data => {
        // Shuffle the array of all products
        const shuffledProducts = shuffleArray(data);
        // Set the state with the first 4 shuffled products
        setRelatedProducts(shuffledProducts.slice(0, 4));
      });
  }, []);

  // Function to shuffle an array
  const shuffleArray = array => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  return (
    <div className='popular'>
      <h1>RELATED PRODUCTS</h1>
      <hr />
      <div className='popular-item'>
        {relatedProducts.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;
