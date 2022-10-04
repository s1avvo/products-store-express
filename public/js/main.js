let selectedRow = null;
// let products = [];
let productData, productTable, sortProductCol;
let sortAsc = false;
let pageSize = 10;
let curPage = 1;

//Insert products list
const insertProductsList = async () => {
  productTable = document.querySelector('#productList tbody');
  productData = await getData('/all');

  renderProductTable();

  document.querySelectorAll('#productList thead tr th span').forEach(t => {
    t.addEventListener('click', sort, false);
  });
}

document.addEventListener('DOMContentLoaded', insertProductsList, false);

const renderProductTable = () => {
  productTable.innerHTML = '';

//   const lastPage = Math.ceil(productData.length / pageSize);
  if(curPage > lastPage) curPage = lastPage;

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
      });
      setCurrPage();
}

//sort Tabel
const sort = (e) => {
  const thisSort = e.target.dataset.sort;
  if(sortProductCol === thisSort) sortAsc = !sortAsc;
  sortProductCol = thisSort;

  productData.sort((a, b) => {
    if(a[sortProductCol] < b[sortProductCol]) return sortAsc ? 1 : -1;
    if(a[sortProductCol] > b[sortProductCol]) return sortAsc ? -1 : 1;
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
      console.log('Error');
  };
  renderProductTable();
}

document.querySelector('#nextBtn').addEventListener('click', nextPage, false);
document.querySelector('#prevBtn').addEventListener('click', previousPage, false);
document.querySelector('#showPage').addEventListener('change', setPageSize, false);

//search input
const searchProduct = async (e) => {
  const value = e.target.value.toLowerCase();

  if(!e.target.value) {
    await insertProductsList();
  } else {
    productData = productData.filter(
        element => element.name.toLowerCase().includes(value) || element.secondName.toLowerCase().includes(value)
    );
    renderProductTable();
  }
};

document.querySelector('#productSearch').addEventListener('search', searchProduct);

//Edit the data
const onEdit = (td) => {
  selectedRow = td.parentElement.parentElement.parentElement;
  getAddProductFrom.querySelector('input[name="productName"]').value = selectedRow.cells[0].firstChild.innerText;
  getAddProductFrom.querySelector('input[name="productSecondName"]').value = selectedRow.cells[1].innerText;
  getAddProductFrom.querySelector('select[name="productUnit"]').value = selectedRow.cells[3].innerText;
  getAddProductFrom.querySelector('input[name="productPlace"]').value = selectedRow.cells[4].innerText;
}

//Delete the data
const onDelete = async (td) => {
  if (confirm('Czy na pewno chcesz usunąć ten rekord?')) {
    const row = td.parentElement.parentElement.parentElement;
    document.getElementById('productList').deleteRow(row.rowIndex);

    await deleteData('/delete', row.id);
    await insertProductsList(); //sprwdzic czt mozna usunac
   
    // await getDetail(row.id); //refresh detail section
  }
}

//hide section
const onHideProduct = (btn = 'onHideProduct') => {
  const productMain = document.querySelector('.productMain');
  const btnShow = document.querySelector('#hideProductSection');

  if (productMain.style.display === "none") {
    productMain.style.display = "block";
    (!btn.name) ? btnShow.innerText = 'Ukryj' : btn.innerText = 'Ukryj';
  } else if (productMain.style.display === "block") {
    productMain.style.display = "none";
    (!btn.name) ? btnShow.innerText = 'Odkryj' : btn.innerText = 'Odkryj';
  }
}

//add or update product on list
const getAddProductFrom = document.getElementById('addProductForm');

const addProductForm = async (e) => {
  event.preventDefault();
  const {productName, productSecondName, productUnit, productPlace} = e.target;

  if (selectedRow == null){
    const pruduct = {
        name: productName.value,
        secondName: productSecondName.value,
        amount: 0,
        unit: productUnit.value,
        place: Number(productPlace.value),
    }
    await addData('/', product);
    await insertProductsList();
  }
  else{
    const product = {
      id: selectedRow.id,
      name: productName.value,
      secondName: productSecondName.value,
      unit: productUnit.value,
      place: Number(productPlace.value),
    }
    await updateData('/edit', product);
    await insertProductsList();
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


  //CRUD
  //get
  const getData = async (path) => {
    try {
      const res = await fetch(`${path}`, {
        method: 'GET',
      });
      return res.json();
  
    } catch (err) {
      console.log('Get product error', err);
    }
  }
  //post
  const addData = async (path, formData) => {
    try {
      await fetch(`${path}`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log('Post product error', err);
    }
  }
  //put
  const updateData = async (path, formData) => {
    try {
      await fetch(`${path}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.log('Put product error', err);
    }
  }
  //delate
  const deleteData = async (path, id) => {
    try {
        await fetch(`${path}`, {
          method: 'DELETE',
          body: JSON.stringify({
            id,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });  
      } catch (err) {
        console.log('Delete product error', err);
      }
  }