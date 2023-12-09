// 設定變數
const orderList = document.querySelector(".orderList");
const discardAllBtn = document.querySelector(".discardAllBtn");
let orderTotalData;

// 初始化
function init() {
  getOrderList();
}
init();

// 抓取訂單資料
function getOrderList() {
  axios
    .get(`${apiUrl}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      orderTotalData = res.data.orders;
      renderOrderList();
      renderC3();
    })
    .catch((err) => {
      console.log(err);
    });
}

// 渲染圖表
function renderC3() {
  let obj = {};
  orderTotalData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (obj[productItem.category] === undefined) {
        obj[productItem.category] = 1;
      } else {
        obj[productItem.category] += 1;
      }
    });
  });
  let arr = Object.keys(obj);
  let newData = [];
  arr.forEach((item) => {
    let newArr = [];
    newArr.push(item);
    newArr.push(obj[item]);
    newData.push(newArr);
  });
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      colors: {
        "Louvre 雙人床架": "#DACBFF",
        "Antony 雙人床架": "#9D7FEA",
        "Anty 雙人床架": "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

// 渲染訂單列表
function renderOrderList() {
  let str = "";
  orderTotalData.forEach((item) => {
    // 產品
    let productStr = "";
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title} *${productItem.quantity}</p>`;
    });
    // 訂單狀態
    let statusStr;
    if (item.paid === false) {
      statusStr = "未處理";
    } else {
      statusStr = "已處理";
    }
    // 時間轉換
    const orderTime = new Date(item.createdAt * 1000);
    let orderTimeStr = `${orderTime.getFullYear()}/${
      orderTime.getMonth() + 1
    }/${orderTime.getDate()}`;

    str += `
  <tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      ${productStr}
    </td>
    <td>${orderTimeStr}</td>
    <td class="orderStatus">
      <a href="#" class="paidStatus" data-status="${item.paid}" data-id="${item.id}">${statusStr}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除" />
    </td>
  </tr>
  `;
  });
  orderList.innerHTML = str;
}

// 訂單監聽
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const target = e.target.getAttribute("class");
  const id = e.target.getAttribute("data-id");
  let paidState = e.target.getAttribute("data-status");
  if (target === "delSingleOrder-Btn") {
    deleteOrderItem(id);
    return;
  }
  if (target === "paidStatus") {
    paidStatusChange(JSON.parse(paidState), id);
    return;
  }
});

//刪除訂單單項
function deleteOrderItem(id) {
  axios
    .delete(`${apiUrl}/orders/${id}`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}

//修改付款狀態
function paidStatusChange(paidState, id) {
  axios
    .put(
      `${apiUrl}/orders`,
      {
        data: {
          id: id,
          paid: !paidState,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}

// 刪除全部訂單監聽
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllOrder();
});

// 刪除全部訂單
function deleteAllOrder() {
  axios
    .delete(`${apiUrl}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      console.log(err);
    });
}
