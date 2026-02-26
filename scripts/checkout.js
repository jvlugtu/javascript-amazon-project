import { cart } from "../data/cart.js";
import {products} from  "../data/products.js";
import {formatCurrency} from "./utils/money.js";
import {removeFromCart} from "../data/cart.js";


let cartSummaryHTML = '';

cart.forEach((cartItem)=>{

    const productId = cartItem.productId;

    let matchingProduct;
    
    products.forEach((product)=>{
        if (product.id === productId)
            matchingProduct= product;
    });
    if (!matchingProduct) return;
    cartSummaryHTML +=

    `
     <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
            <div class="delivery-date">
              Delivery date: Tuesday, June 21
            </div>

            <div class="cart-item-details-grid">
              <img class="product-image"
                src="${matchingProduct.image}">

              <div class="cart-item-details">
                <div class="product-name">
                  ${matchingProduct.name}
                </div>
                <div class="product-price">
                   $${formatCurrency(matchingProduct.priceCents)}
                </div>
                <div class="product-quantity">
                  <span>
                    Quantity: <input type="number" min="1" class="quantity-input" value="${cartItem.quantity}" data-product-id="${matchingProduct.id}" style="width: 50px;"> 
                  </span>
                  <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                    Update
                  </span>
                  <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                <div class="delivery-option">
                  <input type="radio" checked
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                  <div>
                    <div class="delivery-option-date">
                      Tuesday, June 21
                    </div>
                    <div class="delivery-option-price">
                      FREE Shipping
                    </div>
                  </div>
                </div>
                <div class="delivery-option">
                  <input type="radio"
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                  <div>
                    <div class="delivery-option-date">
                      Wednesday, June 15
                    </div>
                    <div class="delivery-option-price">
                      $4.99 - Shipping
                    </div>
                  </div>
                </div>
                <div class="delivery-option">
                  <input type="radio"
                    class="delivery-option-input"
                    name="delivery-option-${matchingProduct.id}">
                  <div>
                    <div class="delivery-option-date">
                      Monday, June 13
                    </div>
                    <div class="delivery-option-price">
                      $9.99 - Shipping
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
    `;
});

document.querySelector('.js-order-summary')
.innerHTML = cartSummaryHTML;

export function updateCheckoutHeader(){
  let totalQuantity = 0;
  cart.forEach((cartItem)=>{
    totalQuantity += cartItem.quantity;
  });
  
  const itemText = totalQuantity === 1 ? 'item' : 'items';
  document.querySelector('.js-checkout-item-count').innerText = `${totalQuantity} ${itemText}`;
}

updateCheckoutHeader();

document.querySelectorAll('.js-delete-link').forEach((link)=>{
    link.addEventListener('click', ()=>{
        const productId = link.dataset.productId;
        removeFromCart(productId);

        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        container.remove();
        updateCheckoutHeader();
    });
});

  // Update quantity event
  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);
      const newQuantity = parseInt(input.value);
      if (isNaN(newQuantity) || newQuantity < 1) return;
      // Update cart
      cart.forEach((cartItem) => {
        if (cartItem.productId === productId) {
          cartItem.quantity = newQuantity;
        }
      });
      // Save to storage
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCheckoutHeader();
      // Optionally, update the UI
      input.value = newQuantity;
    });
  });