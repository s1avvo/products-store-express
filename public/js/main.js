const getAddProductFrom = document.getElementById('addProductForm');
const productMain = document.querySelector('#productMain');
const productForm = document.querySelector('#productForm');
const detailMain = document.querySelector('#detailMain');
const detailForm = document.querySelector('#detailForm');
const detailHead = document.querySelector('#detailHeader');

let selectedRow = null;
let productTable, productData, sortProduct;
let sortAsc = false;
let pageSize = 10;
let curPage = 1;
let status = 'Unauthorized';

//Get products tabel
const getProductsTable = async () => {
  productTable = document.querySelector('#productList tbody');
  productData = await getData('/all');

  checkStatus();
  renderProductTable();

  document.querySelectorAll('#productList thead tr th span').forEach(t => {
    t.addEventListener('click', sort, false);
  });
}

document.addEventListener('DOMContentLoaded', getProductsTable, false);

//Create tabel body
const renderProductTable = () => {
  productTable.innerHTML = '';
  setCurrPage();

  productData
    .filter((row, index) => {
      let start = (curPage - 1) * pageSize;
      let end = curPage * pageSize;
      if (index >= start && index < end) return true;
    })
    .map(element => {
      const newRow = productTable.insertRow(productTable.length);
      newRow.id = element.id;
      let cell1 = newRow.insertCell(0)

      const div = document.createElement('div');
      div.classList.add('d-grid', 'btn', 'btn-none', 'text-start');
      div.setAttribute("role", "button");
      div.setAttribute("onClick", "onDetail(this)");
      div.innerText = element.name;
      cell1.appendChild(div);

      let cell2 = newRow.insertCell(1)
      cell2.classList.add('hiddenColumn');
      cell2.innerText = element.secondName;
      let cell3 = newRow.insertCell(2)
      cell3.innerText = element.amount;
      let cell4 = newRow.insertCell(3)
      cell4.innerText = element.unit;
      let cell5 = newRow.insertCell(4)
      cell5.classList.add('hiddenColumn');
      cell5.innerText = element.place;
      let cell6 = newRow.insertCell(5)
      cell6.classList.add('text-center');
      cell6.innerHTML = ` 
          <div class="btn-group" role="group"> 
          <button type="button" class="btn btn-secondary btn-sm d-block d-sm-inline" onClick="onEdit(this)">Edytuj</button>
          <button type="button" class="btn btn btn-danger btn-sm d-block d-sm-inline" onClick="onDelete(this)">X</button>
          </div>
      `;
      if (status === 'Unauthorized') cell6.querySelectorAll('button').forEach(el => el.disabled = true);
    });
}

//sort tabel
const sort = (e) => {
  const thisSort = e.target.dataset.sort;
  if(sortProduct === thisSort) sortAsc = !sortAsc;
  sortProduct = thisSort;
  productData.sort((a, b) => {
    if(a[sortProduct] < b[sortProduct]) return sortAsc ? 1 : -1;
    if(a[sortProduct] > b[sortProduct]) return sortAsc ? -1 : 1;
    return 0;
  });
  renderProductTable();
}

//pagination
const previousPage = () => {
  if(curPage > 1) curPage--;
  renderProductTable();
}

const nextPage = () => {
  if((curPage * pageSize) < productData.length) curPage++;
  renderProductTable();
}

const setCurrPage = () => {
  const currPagePagination = document.querySelector('#currPage');
  const lastPage = Math.ceil(productData.length / pageSize);
  if(curPage > lastPage) curPage = lastPage;
  if((curPage === 0) && (lastPage > 0)) curPage = lastPage;
  currPagePagination.innerHTML = `${curPage} z ${lastPage}`;
}

const setPageSize = (e) => {
  switch (e.target.value) {
    case '1':
      pageSize = 10;
      break;
    case '2':
      pageSize = 25;
      break;
    case '3':
      pageSize = 50;
      break;
    default:
      console.log('Cannot set page size!');
  }
  renderProductTable();
}

document.querySelector('#nextBtn').addEventListener('click', nextPage, false);
document.querySelector('#prevBtn').addEventListener('click', previousPage, false);
document.querySelector('#showPage').addEventListener('change', setPageSize, false);

//search
const searchProduct = async (e) => {
  const value = e.target.value.toLowerCase();

  if(!e.target.value) {
    await getProductsTable();
  } else {
    productData = productData.filter(
      element => element.name.toLowerCase().includes(value) || element.secondName.toLowerCase().includes(value)
    );
    renderProductTable();
  }
};

document.querySelector('#productSearch').addEventListener('search', searchProduct);

//Edit product
const onEdit = (td) => {
  selectedRow = td.parentElement.parentElement.parentElement;
  getAddProductFrom.querySelector('input[name="productName"]').value = selectedRow.cells[0].firstChild.innerText;
  getAddProductFrom.querySelector('input[name="productSecondName"]').value = selectedRow.cells[1].innerText;
  getAddProductFrom.querySelector('select[name="productUnit"]').value = selectedRow.cells[3].innerText;
  getAddProductFrom.querySelector('input[name="productPlace"]').value = selectedRow.cells[4].innerText;
}

//Delete product
const onDelete = async (td) => {
  if (confirm('Czy na pewno chcesz usunąć ten rekord?')) {
    const row = td.parentElement.parentElement.parentElement;

    await deleteData('/store/delete', {
      id: row.id
    });
    await getProductsTable();
  }
}

//hide product section when show detail section
const hideProductSection = () => {
  productForm.classList.add('displayNone');
  productMain.classList.add('displayNone');
}

const checkStatus = () => {
  if(status === 'Allowed') {
    if (productMain.className !== 'displayNone') productForm.classList.remove('displayNone');
    if (productMain.className === 'displayNone') detailForm.classList.remove('displayNone');
  }
}

const loginBtn = document.querySelector('#loginBtn');

const loginStatus = async () => {
  const login = await getData('/store/auth');
  if(login.status === 'Allowed') {
    status = 'Allowed';
    if(productMain.className !== 'displayNone'){
      await getProductsTable();
    } else {
      await getDetailTable(id);
    }
    loginBtn.parentElement.style.display = "none";
  }
}

loginBtn.addEventListener('click', loginStatus);

//add or update product
const addProductForm = async (e) => {
  event.preventDefault();
  const {productName, productSecondName, productUnit, productPlace} = e.target;

  if (selectedRow == null){
    const product = {
      name: productName.value,
      secondName: productSecondName.value,
      amount: 0,
      unit: productUnit.value,
      place: Number(productPlace.value),
    }
    await addData('/store/add', product);
    await getProductsTable();
  }
  else{
    const product = {
      id: selectedRow.id,
      name: productName.value,
      secondName: productSecondName.value,
      unit: productUnit.value,
      place: Number(productPlace.value),
    }
    await updateData('/store/edit', product);
    await getProductsTable();
  }
  resetForm();
}

getAddProductFrom.addEventListener('submit', addProductForm);

//Reset product form
const resetForm = () => {
  getAddProductFrom.querySelector('input[name="productName"]').value = '';
  getAddProductFrom.querySelector('input[name="productSecondName"]').value = '';
  getAddProductFrom.querySelector('select[name="productUnit"]').selectedIndex = 0;
  getAddProductFrom.querySelector('input[name="productPlace"]').value = '';
  selectedRow = null;
}