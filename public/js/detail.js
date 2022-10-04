const getAddProductFrom = document.getElementById('addProductForm');
const getAddDetailFrom = document.getElementById('addDetailForm');
// const detailTable = document.getElementById("detailList").getElementsByTagName('tbody')[0];
const headDetail = document.querySelector('#headDetailProduct').getElementsByTagName('li');
const searchInput = document.querySelector('#productSearch');
const detailFilter = document.querySelector('#detailFilterForm');
const sortSelectDetail = document.querySelector('#detailSort');
const detailHeader = document.querySelector('.detail-header');
const detailFilterSort = document.querySelector('.detail-filter');
const detailMain = document.querySelector('.detail-main');

let productData, productDetail, productTable, sortProductCol;
let sortAsc = false;
let pageSize = 5;
let curPage = 1;

let selectedRow = null;
let products = [];
let details = [];
let detailsForFilter = [];
let filterRangeDetails = [];
let detailId;
let countDetailAmount = 0;


//Insert detail prouduct list
const onDetail = async (td) => {
    id = td.parentElement.parentElement.id;
    productTable = document.querySelector('#detailList tbody');
    productDetail = await getData(`/${id}/detail`);
    productData = await getData(`/${id}`);

    detailsForFilter = productDetail.map(element => {
        return {productDetail: element, label: id}
      });

    detailHeader.classList.remove('invisible');
    detailFilterSort.classList.remove('invisible');
    detailMain.classList.remove('invisible');
    
    insertProductHeadDetail();
    renderProductDetail();
    
    document.querySelectorAll('#detailList thead tr th span').forEach(t => {
      t.addEventListener('click', sort, false);
    });
  }
  
//Insert product head detail
const insertProductHeadDetail = () => {
    const {name, secondName, amount, unit, place} = productData;
  
    headDetail[0].innerHTML = `Nazwa: <span class="fw-bold">${name}</span>`;
    headDetail[1].innerHTML = `Nazwa: <span class="fw-bold">${secondName}</span>`;
    headDetail[2].innerHTML = `Ilość: <span class="fw-bold">${amount}${unit}</span>`;
    headDetail[4].innerHTML = `Miejsce: <span class="fw-bold">${place}</span>`;
    headDetail[5].innerHTML = `Suma zaznaczonych: <span class="fw-bold">${countDetailAmount}</span>`;
  }
  
//Insert product detail table
const renderProductDetail = () => {
  
    productTable.innerHTML = '';

    if(curPage > lastPage) curPage = lastPage;
  
    details = productDetail
    .filter((row, index) => {
        let start = (curPage - 1) * pageSize;
        let end = curPage * pageSize;
        if (index >= start && index < end) return true;
      })
    .map(element => {
      const newRow = productTable.insertRow(productTable.length);
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

// const sortDetailList = (e) => {
//     event.preventDefault();
  
//     if(e.target.value === '1'){
//       const sorted = details.map(element => element.productDetail).sort((a, b) => a.data > b.data ? -1 : 1);
//       insertProductDetail(sorted);
//     }
//     if(e.target.value === '2'){
//       const sorted = details.map(element => element.productDetail).sort((a, b) => a.data < b.data ? -1 : 1);
//       insertProductDetail(sorted);
//     }
//     if(e.target.value === '3'){
//       const sorted = details.map(element => element.productDetail).sort((a, b) => a.person < b.person ? -1 : 1);
//       insertProductDetail(sorted);
//     }
//   }
  
//   sortSelectDetail.addEventListener('change', sortDetailList, false);
  
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
    headDetail[3].innerHTML = `Suma zaznaczonych: <span class="fw-bold">${countDetailAmount}</span>`;
  }

const onHideDetail = () => {
    detailHeader.classList.add('invisible');
    detailFilterSort.classList.add('invisible');
    detailMain.classList.add('invisible');
  }
  
  const firstDayOfMonth = () => {
    const now = new Date();
    return  new Date(now.getFullYear(), now.getMonth(), 2).toISOString().slice(0,16);
  }

//Reset detail form
const resetDetailForm = () => {
    getAddDetailFrom.querySelector('input[name="detailAmount"]').value = '0.00';
    getAddDetailFrom.querySelector('input[name="detailData"]').value = new Date().toISOString().slice(0, 16);
    getAddDetailFrom.querySelector('select[name="detailPerson"]').selectedIndex = 0;
  }
  
  //Reset detail header
  const resetDetailFilter = () => {
    detailFilter.querySelectorAll('input[type="datetime-local"]')[0].value = firstDayOfMonth();
    detailFilter.querySelectorAll('input[type="datetime-local"]')[1].value = new Date().toISOString().slice(0, 16);
  }
  
//   //Reset detail sort
//   const resetDetailSort = () => {
//     sortSelectDetail.selectedIndex = 0;
//   }
  
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