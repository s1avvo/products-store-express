const getAddDetailFrom = document.getElementById('addDetailForm');
const headDetail = document.querySelector('#headDetailProduct').getElementsByTagName('li');
const detailFilter = document.querySelector('#detailFilterForm');
const cardName = document.querySelector('#dataSheet');

let id, oneProductData, productDetail, productDetailTable, sortDetailCol;
let sortDetailAsc = false;
let pageDetailSize = 10;
let curPageDetail = 1;
let detailsForFilter = [];
let countDetailAmount = 0;

const onDetail = async (td) => {
  id = td.parentElement.parentElement.id;

  hideProductSection();
  showDetailSection();

  await getDetailTable(id);

  resetDetailForm();
  resetDetailFilter();
  resetDetailCount();
}

//Insert detail prouduct list
const getDetailTable = async (id) => {
  productDetailTable = document.querySelector('#detailList tbody');
  productDetail = await getData(`/detail/${id}`);
  oneProductData = await getData(`/${id}`);
  detailsForFilter = productDetail;

  checkStatus();
  renderDetailHeader();
  renderDetailTable();

  document.querySelectorAll('#detailList thead tr th span').forEach(t => {
    t.addEventListener('click', sortDetail, false);
  });
}


//Insert product head detail
const renderDetailHeader = () => {
  const {name, secondName, amount, unit, place, dataSheet} = oneProductData;

  headDetail[0].querySelector('span').innerText = name;
  headDetail[1].querySelector('span').innerText = secondName;
  headDetail[2].querySelector('span').innerText = amount+unit;
  headDetail[3].querySelector('span').innerText = place;
  headDetail[4].querySelector('span').innerText = countDetailAmount;
  if(!dataSheet){
    cardName.querySelector('span').innerText = `Brak karty charakterystyki`;
    cardName.querySelector('a').classList.add('displayNone');
  }else {
    cardName.querySelector('span').innerText = `${name}.pdf`;
  }
}

//Insert product detail table
const renderDetailTable = () => {

  productDetailTable.innerHTML = '';
  setCurrPageDetail();

  productDetail
    .filter((row, index) => {
      let start = (curPageDetail - 1) * pageDetailSize;
      let end = curPageDetail * pageDetailSize;
      if (index >= start && index < end) return true;
    })
    .map(element => {
      const newRow = productDetailTable.insertRow(productDetailTable.length);
      newRow.id = element.id;
      let cell1 = newRow.insertCell(0);
      cell1.innerText = element.data;
      let cell2 = newRow.insertCell(1);

      const plus = document.createElement('div');
      plus.classList.add('d-grid', 'btn', 'btn-none', 'text-start');
      plus.setAttribute("role", "button");
      plus.setAttribute("onClick", "onCalc(this)");
      plus.innerText = !element.plus ? '—' : `+${element.plus}`;
      cell2.appendChild(plus);

      let cell3 = newRow.insertCell(2);

      const minus = document.createElement('div');
      minus.classList.add('d-grid', 'btn', 'btn-none', 'text-start');
      minus.setAttribute("role", "button");
      minus.setAttribute("onClick", "onCalc(this)");
      minus.innerText = !element.minus ? '—' :`-${element.minus}`;
      cell3.appendChild(minus);

      let cell4 = newRow.insertCell(3);
      cell4.innerText = element.person;
      let cell5 = newRow.insertCell(4)
      cell5.classList.add('text-center');
      cell5.innerHTML = ` 
          <button type="button" class="btn btn btn-danger btn-sm d-block d-sm-inline" onClick="onDeleteFromStock(this)">Usuń</button>
      `;

      if (status === 'Unauthorized') cell5.querySelector('button').disabled = true;
    });

}

//sort Tabel
const sortDetail = (e) => {
  const thisSort = e.target.dataset.sort;
  if(sortDetailCol === thisSort) sortDetailAsc = !sortDetailAsc;
  sortDetailCol = thisSort;
  productDetail.sort((a, b) => {
    if(a[sortDetailCol] < b[sortDetailCol]) return sortDetailAsc ? 1 : -1;
    if(a[sortDetailCol] > b[sortDetailCol]) return sortDetailAsc ? -1 : 1;
    return 0;
  });
  renderDetailTable();
}

//pagination
const previousPageDetail = () => {
  if(curPageDetail > 1) curPageDetail--;
  renderDetailTable();
}

const nextPageDetail = () => {
  if((curPageDetail * pageDetailSize) < productDetail.length) curPageDetail++;
  renderDetailTable();
}

const setCurrPageDetail = () => {
  const currPagePagination = document.querySelector('#currPageDetail');
  const lastPage = Math.ceil(productDetail.length / pageDetailSize);
  if(curPageDetail > lastPage) curPageDetail = lastPage;
  if((curPageDetail === 0) && (lastPage > 0)) curPageDetail = lastPage
  currPagePagination.innerHTML = `${curPageDetail} z ${lastPage}`;
}

const setPageSizeDetail = (e) => {
  switch (e.target.value) {
    case '1':
      pageDetailSize = 10;
      break;
    case '2':
      pageDetailSize = 25;
      break;
    case '3':
      pageDetailSize = 50;
      break;
    default:
      console.log('Error');
  }
  renderDetailTable();
}

document.querySelector('#nextBtnDetail').addEventListener('click', nextPageDetail, false);
document.querySelector('#prevBtnDetail').addEventListener('click', previousPageDetail, false);
document.querySelector('#showPageDetail').addEventListener('change', setPageSizeDetail, false);

const onCalc = (e) => {
  const value = e.innerText;
  if(value.charAt(0) === '-') countDetailAmount -= Number(value.slice(1));
  if(value.charAt(0) === '+') countDetailAmount += Number(value.slice(1));
  headDetail[4].querySelector('span').innerText = countDetailAmount;
}

const filterData = async (e) => {
  event.preventDefault();

  if(e.type === 'reset'){
    resetDetailFilter();
    await getDetailTable(id);
  }
  if(e.type === 'submit') {
    const { dataFrom, dataTo } = e.target;
    productDetail = detailsForFilter
      .filter(element => element.data >= dataFrom.value && element.data <= dataTo.value);

    renderDetailTable();
  }
}

detailFilter.addEventListener('submit', filterData, false)
detailFilter.addEventListener('reset', filterData, false)

//Delete the data
const onDeleteFromStock = async (td) => {
  if (confirm('Czy na pewno chcesz usunąć ten rekord?')) {
    const row = td.parentElement.parentElement;
    console.log(td)

    await deleteData('/store/deleteDetail', {
      id: row.id,
      productId: id,
    });
    await getDetailTable(id);
  }
}

const hideDetailSection = () => {
  detailForm.classList.add('displayNone');
  detailHead.classList.add('displayNone');
  detailMain.classList.add('displayNone');
}

const showDetailSection = () => {
  checkStatus();
  detailHead.classList.remove('displayNone');
  detailMain.classList.remove('displayNone');
}

const backToProductMain = async () => {
  hideDetailSection();
  productMain.classList.remove('displayNone');
  checkStatus();

  await getProductsTable();
}

const addDetailForm = async (e, amount) => {
  const { detailAmount, detailData, detailPerson} = e.target;

  let minus = 0;
  let plus = 0;

  if(amount === 'clickedPlus') plus = detailAmount.value;
  if(amount === 'clickedMinus') minus = detailAmount.value;

  const productDetail = {
    plus: Number(plus),
    minus: Number(minus),
    data: detailData.value.replace('T', ' '),
    person: detailPerson.value,
    productId: id,
  }

  await addData('/store/addDetail/${detailId}', productDetail);
  await getDetailTable(id);

  resetDetailForm();
}

getAddDetailFrom.addEventListener('submit',  async (event) => {
  event.preventDefault();
  await addDetailForm(event, event.submitter.id);
})

// upload product specyfication
const uploadFile = async () => {
  event.preventDefault();

  const file = document.querySelector('#fileupload');
  const formData = new FormData();
  formData.append('uploaded', file.files[0], `${id}.pdf`);

  const res = await fetch('/store/upload', {
    method: 'POST',
    body: formData
  });
  alert(await res.text());
};
const url = document.querySelector('#getFile');

// get product specification
const getFile = async () => {
  url.setAttribute('href', `/download/${id}.pdf`);

  const res = await fetch(`/download/${id}.pdf`, {
    method: 'GET'
  });

  if(res.status === 404){
    window.location.href = "https://chem-store-express.up.railway.app/";
    alert(await res.text());
  }
};

url.addEventListener('click', getFile);

//Reset detail form
const resetDetailForm = () => {
  const now = new Date(new Date().getTime() - (new Date().getTimezoneOffset()*60*1000));
  getAddDetailFrom.querySelector('input[name="detailAmount"]').value = '';
  getAddDetailFrom.querySelector('input[name="detailData"]').value = now.toISOString().slice(0, 16);
  getAddDetailFrom.querySelector('select[name="detailPerson"]').selectedIndex = 0;
}

//Reset detail filter
const resetDetailFilter = () => {
  const now = new Date(new Date().getTime() - (new Date().getTimezoneOffset()*60*1000));
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 2).toISOString().slice(0,16);
  detailFilter.querySelectorAll('input[type="datetime-local"]')[0].value = firstDayOfMonth;
  detailFilter.querySelectorAll('input[type="datetime-local"]')[1].value = now.toISOString().slice(0, 16);
}

//Reset detail header
const resetDetailCount = () => {
  countDetailAmount = 0;
  headDetail[4].querySelector('span').innerText = countDetailAmount;
}

document.querySelector('#resetCalc').addEventListener('click', resetDetailCount);


