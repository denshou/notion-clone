//get
export const getAllData = async () => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents`, {
    headers: {
      "x-username": "denshou",
    },
  });
  const data = await res.json();
  return data;
};

export const getContent = async (id) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${id}`, {
    headers: {
      "x-username": "denshou",
    },
  });
  const data = await res.json();
  return data;
};

//post
export const createDoc = async (id = null) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-username": "denshou",
    },
    body: JSON.stringify({
      title: "",
      parent: id,
    }),
  });
  const data = await res.json();
  return data;
};

//put
export const editContent = async (id, title, content) => {
  const res = await fetch(`https://kdt-api.fe.dev-cos.com/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-username": "denshou",
    },
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });
  const data = await res.json();
  console.log("저장되었습니다.");
  return data;
};

//delete
export const deleteDoc = async (id) => {
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
