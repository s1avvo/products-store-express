const getAddProductFrom = document.getElementById('addProductForm');
const getAddDetailFrom = document.getElementById('addDetailForm');
const productTable = document.getElementById("productList").getElementsByTagName('tbody')[0];
const detailTable = document.getElementById("detailList").getElementsByTagName('tbody')[0];
const headDetail = document.querySelector('#headDetailProduct').getElementsByTagName('li');
const sortSelectList = document.querySelector('#productSort');
const searchInput = document.querySelector('#productSearch');
const detailFilter = document.querySelector('#detailFilterForm');
const sortSelectDetail = document.querySelector('#detailSort');
const detailHeader = document.querySelector('.detail-header');
const detailMain = document.querySelector('.detail-main');

let selectedRow = null;
let products = [];
let details = [];
let detailsForFilter = [];
let filterRangeDetails = [];
let detailId;
let countDetailAmount = 0;

const sortProductList = (event) => {
  event.preventDefault();

  if(event.target.value === 'min-amount'){
    const sorted = products.map(element => element.product).sort((a, b) => (Number(a.amount - b.amount)));
    insertProductsList(sorted);
  }
  if(event.target.value === 'max-amount'){
    const sorted = products.map(element => element.product).sort((a, b) => (Number(b.amount - a.amount)));
    insertProductsList(sorted);
  }
  if(event.target.value === 'min-place'){
    const sorted = products.map(element => element.product).sort((a, b) => (Number(a.place - b.place)));
    insertProductsList(sorted);
  }
  if(event.target.value === 'max-place'){
    const sorted = products.map(element => element.product).sort((a, b) => (Number(b.place - a.place)));
    insertProductsList(sorted);
  }
}

sortSelectList.addEventListener('click', sortProductList);

// const detailSortOptions = () => {
//   const arr = {'1': 'Data najnowsze', '2': 'Data najstarsze', '3': 'Osoba A-Z'}
//
//   sortSelectDetail.innerHTML = `<option hidden>Sortowanie</option>`;
//
//   for (const [key, value] of Object.entries(arr)) {
//     sortSelectDetail.innerHTML += `<option value="${key}">${value}</option>`;
//   }
// };

const sortDetailList = (e) => {
  event.preventDefault();

  if(e.target.value === '1'){
    const sorted = details.map(element => element.productDetail).sort((a, b) => a.data > b.data ? -1 : 1);
    insertProductDetail(sorted);
  }
  if(e.target.value === '2'){
    const sorted = details.map(element => element.productDetail).sort((a, b) => a.data < b.data ? -1 : 1);
    insertProductDetail(sorted);
  }
  if(e.target.value === '3'){
    const sorted = details.map(element => element.productDetail).sort((a, b) => a.person < b.person ? -1 : 1);
    insertProductDetail(sorted);
  }
}

sortSelectDetail.addEventListener('change', sortDetailList, false);

const filterData = async (e) => {
  event.preventDefault();


  if(e.type === 'reset'){
    resetDetailFilter();
    resetCheckbox();

    await getDetailHeader(detailId);
    await getDetail(detailId);
  }

  if(e.type === 'submit') {

    const { dataFrom, dataTo } = e.target;

    if (!dataFrom.value || !dataTo.value) return;

    const filtered = detailsForFilter
      .map(element => element.productDetail)
      .filter(element => element.data >= dataFrom.value && element.data <= dataTo.value);

    filterRangeDetails = filtered.map(element => {
      return {productDetail: element}
    })

    insertProductDetail(filtered);

    resetCheckbox();
    resetDetailCount();
    await getDetailHeader(detailId);
  }
}

detailFilter.addEventListener('submit', filterData, false)
detailFilter.addEventListener('reset', filterData, false)

//Insert products list
const insertProductsList = (data) => {

  productTable.innerHTML = '';

  products = data.map(element => {
    const newRow = productTable.insertRow(productTable.length);
    newRow.id = element.id;
    let cell1 = newRow.insertCell(0);
    cell1.innerText = element.name;
    let cell2 = newRow.insertCell(1);
    cell2.classList.add('hiddenColumn');
    cell2.innerText = element.secondName;
    let cell3 = newRow.insertCell(2);
    cell3.innerText = element.amount;
    let cell4 = newRow.insertCell(3);
    cell4.innerText = element.unit;
    let cell5 = newRow.insertCell(4);
    cell5.classList.add('hiddenColumn');
    cell5.innerText = element.place;
    let cell6 = newRow.insertCell(5);
    cell6.classList.add('text-center');
    cell6.innerHTML = `
        <button type="button" class="btn btn-outline-secondary btn-sm d-block d-sm-inline" onClick="onEdit(this)">Edytuj</button>
        <button type="button" class="btn btn-outline-secondary btn-sm d-block d-sm-inline" onClick="onDetail(this)">Więcej</button>
        <button type="button" class="btn btn-outline-secondary btn-sm d-block d-sm-inline" onClick="onDelete(this)">X</button>
    `;

    return {product: element, label: newRow}
  });
}

//Insert product head detail
const insertProductHeadDetail = (data) => {
  const {name, amount, unit, place} = data

  headDetail[0].textContent = `Nazwa: ${name}`;
  headDetail[1].textContent = `Ilość: ${amount}${unit}`;
  headDetail[2].textContent = `Miejsce: ${place}`;
  headDetail[3].textContent = `Suma zaznaczonych: ${countDetailAmount}`;
}

//Insert product detail
const insertProductDetail = (data) => {

  detailTable.innerHTML = '';

  details = data.map(element => {
    const newRow = detailTable.insertRow(detailTable.length);
    newRow.id = element.id;
    let cell1 = newRow.insertCell(0);
    cell1.innerHTML = `<input type="checkbox" onClick="onCheck(this)">`;
    if(element.checked) cell1.innerHTML = `<input type="checkbox" onClick="onCheck(this)" checked>`;
    let cell2 = newRow.insertCell(1);
    cell2.innerText = element.data;
    let cell3 = newRow.insertCell(2);
    cell3.innerText = (element.plus > 0) ? `+ ${element.plus}` : `- ${element.minus}`;
    let cell4 = newRow.insertCell(3);
    cell4.innerText = element.person;

    return {productDetail: element, label: newRow}
  });
}

//Edit the data
const onEdit = (td) => {
  selectedRow = td.parentElement.parentElement;
  getAddProductFrom.querySelector('input[name="productName"]').value = selectedRow.cells[0].innerHTML;
  getAddProductFrom.querySelector('input[name="productSecondName"]').value = selectedRow.cells[1].innerHTML;
  getAddProductFrom.querySelector('select[name="productUnit"]').value = selectedRow.cells[3].innerHTML;
  getAddProductFrom.querySelector('input[name="productPlace"]').value = selectedRow.cells[4].innerHTML;
}

const updateRecord = async (formData) => {
  try {
    await fetch(`/edit`, {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log(err);
  }
  await getProducts();
}

//Delete the data
const onDelete = async (td) => {
  if (confirm('Do you want to delete this record?')) {
    const row = td.parentElement.parentElement;
    document.getElementById('productList').deleteRow(row.rowIndex);

    try {
      await fetch(`/delete`, {
        method: 'DELETE',
        body: JSON.stringify({
          id: row.id,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log(err);
    }

    await getDetail(row.id);
  }
}

//Count checked cells
const onCheck = (checkbox) => {
  const checked = checkbox.parentElement.parentElement.querySelector('input');
  const detailAmountValue = checkbox.parentElement.parentElement.cells[2].innerHTML;
  const index = checkbox.parentElement.parentElement.rowIndex - 1;

  if (checked.checked === true) {
    details[index].productDetail.checked = true;

    detailAmountValue.charAt(0) === '+'
      ? countDetailAmount += Number(detailAmountValue.slice(1))
      : countDetailAmount -= Number(detailAmountValue.slice(1));
  }

  if (checked.checked === false) {
    details[index].productDetail.checked = false;

    detailAmountValue.charAt(0) === '+'
      ? countDetailAmount -= Number(detailAmountValue.slice(1))
      : countDetailAmount += Number(detailAmountValue.slice(1));
  }
  headDetail[3].textContent = `Suma zaznaczonych: ${countDetailAmount}`;
}

//hide section
const onHide = (btn) => {
  if(btn.name === 'productSection') {
    const searchSection = document.querySelector('.search');
    const productMain = document.querySelector('.productMain');

    if (productMain.style.display === "none") {
      productMain.style.display = "block";
      searchSection.style.display = "block";
      btn.innerText = 'Ukryj';
    } else {
      productMain.style.display = "none";
      searchSection.style.display = "none";
      btn.innerText = 'Odkryj';
    }
  }
  if(btn.name === 'detailSection') {
    detailHeader.classList.add('invisible');
    detailMain.classList.add('invisible');
  }
}

//Reset product form
const resetForm = () => {
  getAddProductFrom.querySelector('input[name="productName"]').value = '';
  getAddProductFrom.querySelector('input[name="productSecondName"]').value = '';
  getAddProductFrom.querySelector('select[name="productUnit"]').selectedIndex = 0;
  getAddProductFrom.querySelector('input[name="productPlace"]').value = '';
  selectedRow = null;
}

//Reset detail form
const resetDetailForm = () => {
  getAddDetailFrom.querySelector('input[name="detailAmount"]').value = '';
  getAddDetailFrom.querySelector('input[name="detailData"]').value = '';
  getAddDetailFrom.querySelector('select[name="detailPerson"]').selectedIndex = 0;
}

//Reset detail header
const resetDetailFilter = () => {
  detailFilter.querySelectorAll('input[type="datetime-local"]')[0].value = '';
  detailFilter.querySelectorAll('input[type="datetime-local"]')[1].value = '';
}

//Reset detail sort
const resetDetailSort = () => {
  sortSelectDetail.selectedIndex = 0;
}

//Reset detail header
const resetDetailCount = () => {
  countDetailAmount = 0;
}

//Reset checbox
const resetCheckbox = () => {
  const checkbox = document.querySelectorAll('input[type=checkbox]');
  for (const el of checkbox){
    el.checked = false;
  }
}

const searchProduct = () => {
  const value = event.target.value.toLowerCase();

  products.forEach(element => {
    const isVisible = element.product.name.toLowerCase().includes(value);
    (!isVisible) ? element.label.className = 'hiddenRow' : element.label.className = '';
  });
};

searchInput.addEventListener('input', searchProduct);

const addProductForm = async (e) => {
  event.preventDefault();
  const {productName, productSecondName, productUnit, productPlace} = e.target;

  if (selectedRow == null){
    try {
      await fetch(`/`, {
        method: 'POST',
        body: JSON.stringify({
          name: productName.value,
          secondName: productSecondName.value,
          amount: 0,
          unit: productUnit.value,
          place: productPlace.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log(err);
    }
    await getProducts();
  }
  else{
    const product = {
      id: selectedRow.id,
      name: productName.value,
      secondName: productSecondName.value,
      unit: productUnit.value,
      place: productPlace.value,
    }
    await updateRecord(product);
  }
  resetForm();
}

getAddProductFrom.addEventListener('submit', addProductForm);

const addDetailForm = async (e) => {
  event.preventDefault();

  let minus = 0;
  let plus = 0;

  const { detailAmount, detailData, detailPerson} = e.target;

  (detailAmount.value.charAt(0) === '-') ? minus = detailAmount.value.slice(1) : plus = detailAmount.value;

  if (selectedRow == null){
    try {
      await fetch(`/${detailId}/add`, {
        method: 'POST',
        body: JSON.stringify({
          id: detailId,
          plus,
          minus,
          data: detailData.value.replace('T', ' '),
          person: detailPerson.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log(err);
    }
    await getDetail(detailId);
    await getDetailHeader(detailId)
  }
  resetDetailForm();
}

getAddDetailFrom.addEventListener('submit', addDetailForm);

const onDetail = async (td) => {
  detailId = td.parentElement.parentElement.id;
  detailHeader.classList.remove('invisible');
  detailMain.classList.remove('invisible');

  resetDetailFilter();
  resetDetailSort();
  resetDetailCount();

  await getDetailHeader(detailId)
  await getDetail(detailId)

};

const getData = async (path) => {
  try {
    const res = await fetch(`${path}`, {
      method: 'GET',
    });
    return res.json();

  } catch (e) {
    console.log(`Get product error`, e);
  }
}

const getDetailHeader = async (id) => {
  const data = await getData(`/${id}`);
  insertProductHeadDetail(data)
};

const getDetail = async (id) => {

  const data = await getData(`/${id}/detail`)
  insertProductDetail(data)

  detailsForFilter = data.map(element => {
    return {productDetail: element, label: id}
  });

  // await getProducts();
};

const getProducts = async () => {
  const data = await getData('/all');
  insertProductsList(data)
};

getProducts();
