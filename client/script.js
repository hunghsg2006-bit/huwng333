// ================= LẤY PHẦN TỬ =================
const loginSubmitBtn = document.getElementById("login-submit");
const registerSubmitBtn = document.getElementById("register-submit");
const loginBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const quantityModal = document.getElementById("quantity-modal");
const qrModal = document.getElementById("qr-modal");
const closeBtns = document.querySelectorAll(".close-btn");
const logoutBtn = document.querySelector(".logout-btn");
const authDisplay = document.querySelector(".auth-display");
const authButtons = document.querySelector(".auth-buttons");
const usernameDisplay = document.querySelector(".username-display");
const toast = document.getElementById("toast");

const buyButtons = document.querySelectorAll(".buy-btn");
const totalAmount = document.querySelector(".total-amount");
const quantityInput = document.getElementById("quantity-input");
const confirmBuyBtn = document.getElementById("confirm-buy-btn");
const productNameTitle = document.getElementById("product-name-title");
const productPriceDisplay = document.getElementById("product-price-display");
const totalPriceDisplay = document.getElementById("total-price-display");
const cartItems = document.querySelector(".cart-items");
const checkoutBtn = document.getElementById("checkout-btn");

const searchInput = document.querySelector(".search-box input");
let productCards = document.querySelectorAll(".product-card");

let total = 0;
let currentUser = localStorage.getItem("currentUser");
let currentProductPrice = 0;
let currentProductName = "";

// Giỏ hàng
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ====================================================
// ===============  HÀM TOAST NOTIFICATION  ============
// ====================================================
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast " + type;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// ====================================================
// ===============  CẬP NHẬT TRẠNG THÁI AUTH  ===========
// ====================================================
function updateAuthUI() {
    if (currentUser) {
        authButtons.style.display = "none";
        authDisplay.style.display = "block";
        usernameDisplay.textContent = "👤 " + currentUser;
    } else {
        authButtons.style.display = "flex";
        authDisplay.style.display = "none";
    }
}

// ====================================================
// ===============  HIỂN THỊ GIỎ HÀNG  =================
// ====================================================
function updateCartDisplay() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-message">Giỏ hàng trống</div>';
        total = 0;
    } else {
        total = 0;
        cart.forEach((item, index) => {
            let itemTotal = item.price * item.quantity;
            total += itemTotal;

            let cartItemHTML = `
                <div class="cart-item">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-price">${item.price.toLocaleString("vi-VN")} đ</span>
                        <span>x${item.quantity}</span>
                    </div>
                    <div style="color: #888; font-size: 11px; margin-bottom: 8px;">
                        Tổng: ${itemTotal.toLocaleString("vi-VN")} đ
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(${index})">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${index})">Xóa</button>
                    </div>
                </div>
            `;
            cartItems.innerHTML += cartItemHTML;
        });
    }

    totalAmount.textContent = total.toLocaleString("vi-VN") + " đ";
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Update nút thanh toán
    checkoutBtn.disabled = cart.length === 0;
}

// ====================================================
// ===============  QUẢN LÝ GIỎ HÀNG  =================
// ====================================================
function addToCart(name, price, quantity) {
    let existItem = cart.find(item => item.name === name && item.price === price);

    if (existItem) {
        existItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }

    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function increaseQuantity(index) {
    if (cart[index]) {
        cart[index].quantity++;
        updateCartDisplay();
    }
}

function decreaseQuantity(index) {
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
        } else {
            removeFromCart(index);
        }
        updateCartDisplay();
    }
}

// ====================================================
// ===============  MỞ / ĐÓNG MODAL  ===================
// ====================================================
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "block";
});

registerBtn.addEventListener("click", () => {
    registerModal.style.display = "block";
});

closeBtns.forEach(btn =>
    btn.addEventListener("click", () => {
        loginModal.style.display = "none";
        registerModal.style.display = "none";
        quantityModal.style.display = "none";
    })
);

window.onclick = e => {
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === registerModal) registerModal.style.display = "none";
    if (e.target === quantityModal) quantityModal.style.display = "none";
};

// ====================================================
// ===============  ĐĂNG NHẬP & ĐĂNG KÝ  ===============
// ====================================================

// ===============  XỬ LÝ LOADING  ====================

const loadingOverlay = document.getElementById("loading-overlay");

function showLoading() {
    loadingOverlay.style.display = "flex";

    loginSubmitBtn.disabled = true;
    registerSubmitBtn.disabled = true;

    loginSubmitBtn.textContent = "Đang xử lý...";
    registerSubmitBtn.textContent = "Đang xử lý...";
}

function hideLoading() {
    loadingOverlay.style.display = "none";

    loginSubmitBtn.disabled = false;
    registerSubmitBtn.disabled = false;

    loginSubmitBtn.textContent = "Đăng nhập";
    registerSubmitBtn.textContent = "Tạo tài khoản";
}

// ---- ĐĂNG KÝ ----
document.getElementById("register-submit").addEventListener("click", () => {
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const password2 = document.getElementById("reg-password2").value.trim();

    if (!username || !password || !password2) {
        showToast("Vui lòng nhập đầy đủ thông tin!", "error");
        return;
    }

    if (password !== password2) {
        showToast("Mật khẩu nhập lại không khớp!", "error");
        return;
    }

    showLoading(); // HIỆN LOADING

    fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        hideLoading(); // TẮT LOADING

        showToast(data.message, "success");
        registerModal.style.display = "none";

        document.getElementById("reg-username").value = "";
        document.getElementById("reg-password").value = "";
        document.getElementById("reg-password2").value = "";
    })
    .catch(() => {
        hideLoading(); // TẮT LOADING

        showToast("Lỗi server!", "error");
    });
});

// ---- ĐĂNG NHẬP ----
document.getElementById("login-submit").addEventListener("click", () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        showToast("Vui lòng nhập đầy đủ thông tin!", "error");
        return;
    }

    showLoading(); // HIỆN LOADING

    fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {

        hideLoading(); // TẮT LOADING

        if (!data.username) {
            showToast(data.message || "Đăng nhập thất bại!", "error");
            return;
        }

        currentUser = data.username;
        localStorage.setItem("currentUser", currentUser);

        showToast(data.message, "success");
        loginModal.style.display = "none";
        updateAuthUI();

        document.getElementById("login-username").value = "";
        document.getElementById("login-password").value = "";
    })
    .catch(() => {
        hideLoading(); // TẮT LOADING
        showToast("Không kết nối được server!", "error");
    });
});

// ---- ĐĂNG XUẤT ----
logoutBtn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showToast("Đã đăng xuất thành công!", "success");
    updateAuthUI();
});

// ====================================================
// ===============  NÚT MUA TĂNG TỔNG ==================
// ====================================================
buyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Kiểm tra nếu chưa đăng nhập
        if (!currentUser) {
            showToast("Vui lòng đăng nhập để mua hàng!", "error");
            loginModal.style.display = "block";
            return;
        }

        // Lấy tên sản phẩm
        currentProductName = btn.parentElement.querySelector(".product-name").textContent;
        
        // Lấy giá sản phẩm
        let priceText = btn.parentElement.querySelector(".product-price").textContent;
        currentProductPrice = parseInt(priceText.replace(/\D/g, ""));

        // Cập nhật modal
        productNameTitle.textContent = currentProductName;
        productPriceDisplay.textContent = currentProductPrice.toLocaleString("vi-VN");
        quantityInput.value = "1";
        updateTotalPrice();

        // Mở modal
        quantityModal.style.display = "block";
    });
});

// ====================================================
// ===============  CẬP NHẬT TỔNG GIÁ  =================
// ====================================================
function updateTotalPrice() {
    let quantity = parseInt(quantityInput.value) || 1;
    let totalPrice = currentProductPrice * quantity;
    totalPriceDisplay.textContent = totalPrice.toLocaleString("vi-VN");
}

quantityInput.addEventListener("input", updateTotalPrice);

// ====================================================
// ===============  XÁC NHẬN MUA  ======================
// ====================================================
confirmBuyBtn.addEventListener("click", () => {
    let quantity = parseInt(quantityInput.value);

    if (!quantity || quantity < 1) {
        showToast("Vui lòng nhập số lượng hợp lệ!", "error");
        return;
    }

    addToCart(currentProductName, currentProductPrice, quantity);
    showToast(`Đã thêm ${quantity} ${currentProductName} vào giỏ!`, "success");
    
    quantityModal.style.display = "none";
});

// ====================================================
// ===============  THANH TOÁN  ======================
// ====================================================
checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Giỏ hàng trống!", "error");
        return;
    }

    if (!currentUser) {
        showToast("Vui lòng đăng nhập để thanh toán!", "error");
        return;
    }

    let cartSummary = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
    showToast(`Đặt hàng thành công! Tổng: ${total.toLocaleString("vi-VN")} đ`, "success");
    
});

// ====================================================
// =====================  TÌM KIẾM =====================
// ====================================================
searchInput.addEventListener("input", () => {
    let value = searchInput.value.toLowerCase();

    productCards.forEach(card => {
        let name = card.querySelector(".product-name").textContent.toLowerCase();

        card.style.display = name.includes(value) ? "block" : "none";
    });
});

// ====================================================
// ===============  KHỞI TẠO GIAO DIỆN  ================
// ====================================================
updateAuthUI();
updateCartDisplay();

// ====================================================
// ===============  DARK/LIGHT MODE  ==================
// ====================================================
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Kiểm tra mode đã lưu trước đó
let savedMode = localStorage.getItem("theme-mode") || "dark";
if (savedMode === "light") {
    document.body.classList.add("light-mode");
    darkModeToggle.checked = true;
} else {
    document.body.classList.remove("light-mode");
    darkModeToggle.checked = false;
}

// ====================================================
// ===============  XỬ LÝ DANH MỤC  ==================
// ====================================================
const categoryFilterSpans = document.querySelectorAll(".category-filter span");

function filterProducts(category) {
    const productCards = document.querySelectorAll(".product-card");
    
    productCards.forEach(card => {
        if (category === "Tất cả") {
            card.style.display = "block";
        } else {
            const cardCategory = card.getAttribute("data-category");
            if (cardCategory === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        }
    });
}

categoryFilterSpans.forEach(span => {
    span.addEventListener("click", function() {
        // Xóa class active từ tất cả
        categoryFilterSpans.forEach(s => s.classList.remove("active"));
        // Thêm class active vào span được nhấn
        this.classList.add("active");
        
        const category = this.textContent.trim();
        filterProducts(category);
    });
});

// Xử lý toggle
darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("light-mode");
        localStorage.setItem("theme-mode", "light");
    } else {
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme-mode", "dark");
    }
});

// ====================================================
// ===============  XỬ LÝ THANH TOÁN & QR CODE  ========
// ====================================================
checkoutBtn.addEventListener("click", () => {
    

    // Cập nhật tổng tiền hiển thị trên QR modal
    document.getElementById("qr-total-amount").textContent = total.toLocaleString("vi-VN");

    // Mở modal QR
    qrModal.style.display = "block";
});

function completePayment() {
    showToast("Thanh toán thành công! Cảm ơn bạn đã mua hàng!", "success");
        // Xóa giỏ sau khi thanh toán
    cart = [];
    updateCartDisplay();
    qrModal.style.display = "none";
}
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hide');
});