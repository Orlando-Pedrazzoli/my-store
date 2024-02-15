import React, { useState, useEffect } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
  const [newCollection, setNewCollection] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/allproducts')
      .then(response => response.json())
      .then(data => {
        // Shuffle the array of new collections
        const shuffledCollection = shuffleArray(data);
        // Slice the shuffled array to get the first 8 items
        const slicedCollection = shuffledCollection.slice(0, 8);
        // Set the state with the sliced collection
        setNewCollection(slicedCollection);
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
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className='collections'>
        {newCollection.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
