//get
const getAllData = async () => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents`, {
    headers: {
      "x-username": "denshou",
    },
  });
  const data = await res.json();
  return data;
};

const getContent = async (id) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${id}`, {
    headers: {
      "x-username": "denshou",
    },
  });
  const data = await res.json();
  return data;
};

//post
const createDoc = async (id) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-username": "denshou",
    },
    body: {
      title: "New Neo DK",
      parent: id,
    },
  });
  const data = await res.json();
  return data;
};

//put
const editContent = async (id, title, content) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-username": "denshou",
    },
    body: {
      title: title,
      content: content,
    },
  });
  const data = await res.json();
  return data;
};

//delete
const deleteDoc = async () => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-username": "denshou",
    },
  });
  const data = await res.json();
  return data;
};
