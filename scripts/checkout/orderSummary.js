import { cart, addToCart, removeFromCart, updateDeliveryOption } from "../../data/cart.js";
import {products, getProduct} from  "../../data/products.js";
import {formatCurrency} from "../utils/money.js";
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js";
import { renderPaymentSummary } from "./paymentSummary.js";

const today = dayjs();
const deliveryDate = today.add(7, 'days');


export function renderOrderSummary(){

let cartSummaryHTML = '';

cart.forEach((cartItem)=>{

    const productId = cartItem.productId;

    const matchingProduct = getProduct(productId);
    if (!matchingProduct) return;

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays, 'days'
    );
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML +=

    `
     <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
            <div class="delivery-date">
              Delivery date: ${dateString}
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
                    Quantity: <span class="quantity-label"> ${cartItem.quantity}</span>
                  </span>
                  <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                    Update
                  </span>
                  <input class="update-quantity-input js-update-quantity-input" type="number" min="1" data-product-id="${matchingProduct.id}" style="display: none; width: 50px; margin: 0 5px;">
                  <button class="update-quantity-button js-update-quantity-button" data-product-id="${matchingProduct.id}" style="display: none;">Confirm</button>
                  <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                ${deliveryOptionsHTML(matchingProduct,cartItem)}
              </div>
            </div>
          </div>
    
    `;
});


function deliveryOptionsHTML(matchingProduct,cartItem){
  let html = '';

  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(
      deliveryOption.deliveryDays, 'days'
    );
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = deliveryOption.priceCents === 0 ? 'FREE': `${formatCurrency(deliveryOption.priceCents)} -`;
    
    const isChecked = deliveryOption.id === cartItem.deliveryOptionId


    html +=`<div class="delivery-option js-delivery-option"
    data-product-id="${matchingProduct.id}"
    data-delivery-option-id="${deliveryOption.id}">
                    <input type="radio"
                    ${isChecked ? 'checked':''}
                      class="delivery-option-input"
                      name="delivery-option-${matchingProduct.id}">
                    <div>
                      <div class="delivery-option-date">
                       ${dateString}
                      </div>
                      <div class="delivery-option-price">
                       ${priceString}  - Shipping
                      </div>
                    </div>
                  </div>
      `
  });
  return html;
}

document.querySelector('.js-order-summary')
.innerHTML = cartSummaryHTML;

updateCheckoutHeader();

document.querySelectorAll('.js-delete-link').forEach((link)=>{
    link.addEventListener('click', ()=>{
        const productId = link.dataset.productId;
        removeFromCart(productId);

        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        container.remove();
        updateCheckoutHeader();
        renderPaymentSummary(); 
    });
});

document.querySelectorAll('.js-update-link').forEach((link)=>{
    link.addEventListener('click', ()=>{
        const productId = link.dataset.productId;
        const input = document.querySelector(`.js-update-quantity-input[data-product-id="${productId}"]`);
        const button = document.querySelector(`.js-update-quantity-button[data-product-id="${productId}"]`);
        
        // If input is already visible, clicking again cancels
        if (input.style.display !== 'none'){
            input.style.display = 'none';
            button.style.display = 'none';
            link.style.display = 'inline';
            input.value = '';
        } else {
            // Toggle visibility
            link.style.display = 'none';
            input.style.display = 'inline-block';
            button.style.display = 'inline-block';
            input.focus();
        }
    });
});

document.querySelectorAll('.js-update-quantity-button').forEach((button)=>{
    button.addEventListener('click', ()=>{
        const productId = button.dataset.productId;
        const input = document.querySelector(`.js-update-quantity-input[data-product-id="${productId}"]`);
        const link = document.querySelector(`.js-update-link[data-product-id="${productId}"]`);
        const newQuantity = parseInt(input.value);
        
        if (isNaN(newQuantity) || newQuantity < 1){
            alert('Please enter a valid quantity');
            return;
        }
        
        removeFromCart(productId);
        addToCart(productId, newQuantity);
        
        const container = document.querySelector(`.js-cart-item-container-${productId}`);
        const quantityLabel = container.querySelector('.quantity-label');
        quantityLabel.innerText = ` ${newQuantity}`;
        
        // Hide input and button, show update link
        input.style.display = 'none';
        button.style.display = 'none';
        link.style.display = 'inline';
        input.value = '';
        
        updateCheckoutHeader();
    });
});

document.querySelectorAll('.js-update-quantity-input').forEach((input)=>{
    input.addEventListener('keypress', (e)=>{
        if (e.key === 'Enter'){
            const button = document.querySelector(`.js-update-quantity-button[data-product-id="${input.dataset.productId}"]`);
            button.click();
        }
    });
});

document.querySelectorAll('.js-delivery-option')
.forEach((element)=>{
  element.addEventListener('click', ()=>{
    const {productId, deliveryOptionId} = element.dataset;
    updateDeliveryOption(productId,deliveryOptionId);
    renderOrderSummary();
    renderPaymentSummary();
  })
})
};

export function updateCheckoutHeader(){
  let totalQuantity = 0;
  cart.forEach((cartItem)=>{
    totalQuantity += cartItem.quantity;
  });
  
  const itemText = totalQuantity === 1 ? 'item' : 'items';
  document.querySelector('.js-checkout-item-count').innerText = `${totalQuantity} ${itemText}`;
}

