import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../Assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    fetch('http://localhost:4000/allproducts')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async id => {
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();

    fetch('http://localhost:4000/allproducts')
      .then(res => res.json())
      .then(data => setAllProducts(data));
  };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className='listproduct-format-main'>
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className='listproduct-allproducts'>
        <hr />
        {allproducts.map((product, index) => {
          return (
            <div
              key={index}
              className='listproduct-format-main listproduct-format'
            >
              <img
                className='listproduct-product-icon'
                src={product.image}
                alt=''
              />
              <p>{product.name}</p>
              <p>€{product.old_price.toFixed(2)}</p>
              <p>€{e.new_price.toFixed(2)}</p>
              <p>{product.category}</p>
              <img
                className='listproduct-remove-icon'
                onClick={() => {
                  remove_product(product.id);
                }}
                src={cross_icon}
                alt=''
              />
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListProduct;
