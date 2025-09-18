const invModel = require("../models/inventory-model")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav() {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationGrid(data) {
  let grid
  if (data.length > 0) {
    grid = '<div class="vehicle-grid">'
    data.forEach(vehicle => {
      grid += `
        <div class="vehicle-card">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" class="vehicle-card__img"/>
          </a>
          <div class="vehicle-card__info">
            <h2 class="vehicle-card__title">
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <div class="vehicle-card__price">${formatUSD(vehicle.inv_price)}</div>
            <div class="vehicle-card__details">
              <div><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)} miles</div>
              <div><strong>Ext. Color:</strong> ${vehicle.inv_color || "Unknown"}</div>
              <div><strong>Description:</strong> ${vehicle.inv_description || "N/A"}</div>
            </div>
          </div>
        </div>
      `
    })
    grid += '</div>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* Format price and mileage with commas and currency */
function formatUSD(amount) {
  amount = Number(amount)
  return !isNaN(amount)
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
    : ""
}
function formatNumber(num) {
  num = Number(num)
  return !isNaN(num) ? num.toLocaleString("en-US") : ""
}

/* Build vehicle detail HTML */
function buildVehicleDetail(vehicle) {
  return `
    <section class="vehicle-detail">
      <div class="vehicle-detail__left">
        <div class="vehicle-detail__main-img">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </div>
        <!-- Thumbnails could go here if you have them -->
      </div>
      <div class="vehicle-detail__right">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <div class="vehicle-detail__price-box">
          <div class="vehicle-detail__mileage-label">MILEAGE</div>
          <div class="vehicle-detail__mileage">${formatNumber(vehicle.inv_miles)}</div>
          <div class="vehicle-detail__price-label">No-Haggle Price</div>
          <div class="vehicle-detail__price">${formatUSD(vehicle.inv_price)}</div>
        </div>
        <ul class="vehicle-detail__info-list">
          <li><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)}</li>
          <li><strong>Ext. Color:</strong> ${vehicle.inv_color || "Unknown"}</li>
          <li><strong>Int. Color:</strong> Black</li>
          <li><strong>Fuel Type:</strong> Gasoline</li>
          <li><strong>Drivetrain:</strong> Front Wheel Drive</li>
          <li><strong>Transmission:</strong> Automatic</li>
          <li><strong>Stock #:</strong> 12345</li>
          <li><strong>VIN:</strong> 1A2B3C4D5E6F7G8H9</li>
        </ul>
        <div class="vehicle-detail__actions">
          <button class="btn btn-green">START MY PURCHASE</button>
          <button class="btn">CONTACT US</button>
          <button class="btn">SCHEDULE TEST DRIVE</button>
          <button class="btn">APPLY FOR FINANCING</button>
        </div>
        <div class="vehicle-detail__contact">
          <div><strong>Call Us</strong><br><a href="tel:8013967886">801-396-7886</a></div>
          <div><strong>Visit Us</strong></div>
        </div>
      </div>
    </section>
  `
}

module.exports = {
  getNav,
  handleErrors,
  buildClassificationGrid,
  buildVehicleDetail
}