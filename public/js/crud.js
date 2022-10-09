//CRUD
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
const deleteData = async (path, id) => {
  try {
    await fetch(`${path}`, {
      method: 'DELETE',
      body: JSON.stringify(id),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log('Delete product error', err);
  }
}