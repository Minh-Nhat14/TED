$(document).ready(function(){
    var current_fs, next_fs, previous_fs;
    var opacity;

    $(".next").click(function(){
        current_fs = $(this).parent();
        next_fs = $(this).parent().next();
        var currentIndex = $("fieldset").index(current_fs);

        const errorBox = current_fs.find(".error-container");
        errorBox.html(""); // clear lỗi cũ

        // ===== BƯỚC 1: Kiểm tra sản phẩm =====
        if (currentIndex === 0) {
            let hasProduct = false;
            $('input[name^="product"]').each(function () {
                if (parseInt($(this).val()) > 0) {
                    hasProduct = true;
                }
            });
            if (!hasProduct) {
                errorBox.html("<div class='error-message text-danger mt-2'>Vui lòng chọn ít nhất 1 sản phẩm.</div>");
                return;
            }
        }

        // ===== BƯỚC 2: Thông tin cá nhân =====
        if (currentIndex === 1) {
              const name = $('input[name="username"]').val().trim();
              const phone = $('input[name="phonenumber"]').val().trim();
              const email = $('input[name="email"]').val().trim();


              const phoneValid = /^[0-9]{10,12}$/.test(phone);
              const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

              if (!name || !phone || !email) {
                  errorBox.html("<div class='error-message text-danger mt-2'>Vui lòng điền đầy đủ họ tên, số điện thoại và email.</div>");
                  return;
              }

              if (!phoneValid) {
                  errorBox.html("<div class='error-message text-danger mt-2'>Số điện thoại không hợp lệ. Vui lòng nhập 10-12 chữ số.</div>");
                  return;
              }

              if (!emailValid) {
                  errorBox.html("<div class='error-message text-danger mt-2'>Email không đúng định dạng.</div>");
                  return;
              }


          }


        // ===== BƯỚC 3: Ảnh bill =====
        if (currentIndex === 2) {
            const file = document.getElementById("bill-upload").files[0];
            if (!file) {
                errorBox.html("<div class='error-message text-danger mt-2'>Vui lòng upload ảnh bill chuyển khoản.</div>");
                return;
            }
            errorBox.html("<div class='error-message text-danger mt-2'>Vui lòng đợi 10s hệ thống xử lý</div>");
            // Nếu hợp lệ → gọi submitOrder() luôn
            submitOrder();
            return; // không chuyển bước nữa, để submit xử lý và hiển thị bước cuối sau
        }

        // Nếu hợp lệ thì tiếp bước
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
        next_fs.show();
        current_fs.animate({opacity: 0}, {
            step: function(now) {
                opacity = 1 - now;
                current_fs.css({ 'display': 'none', 'position': 'relative' });
                next_fs.css({'opacity': opacity});
            }, 
            duration: 600
        });
    });

    $(".previous").click(function(){
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        previous_fs.show();
        current_fs.animate({opacity: 0}, {
            step: function(now) {
                opacity = 1 - now;
                current_fs.css({ 'display': 'none', 'position': 'relative' });
                previous_fs.css({'opacity': opacity});
            }, 
            duration: 600
        });
    });

    $(".submit").click(function(){
        return false;
    });
});

function showFieldsetResult(success) {
    const current_fs = $("fieldset:visible");
    const target_fs = success
        ? $("fieldset").eq($("fieldset").length - 2) // fieldset Success
        : $("#failure-fieldset");

    // Cập nhật thanh tiến trình nếu thành công
    if (success) {
        $("#progressbar li").last().addClass("active");
    }

    target_fs.show();
    current_fs.animate({opacity: 0}, {
        step: function(now) {
            const opacity = 1 - now;
            current_fs.css({'display': 'none', 'position': 'relative'});
            target_fs.css({'opacity': opacity});
        },
        duration: 600
    });
}



$(document).ready(function(){
    $('input[name="delivery"]').change(function(){
        if ($(this).val() === 'ship') {
            $('#address-section').removeClass('hidden');
        } else {
            $('#address-section').addClass('hidden');
        }
    });
});

async function submitOrder() {
    $("#loading-message").show();
    const billInput = document.getElementById("bill-upload");
    const billFile = billInput.files[0];

    let billUrl = ""; // biến để chứa link ảnh nếu có

    // Nếu có file, upload lên Drive trước
    if (billFile) {
        const reader = new FileReader();

        const base64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(billFile);
        });

        const uploadForm = new FormData();
        uploadForm.append('file', base64);
        uploadForm.append('name', billFile.name);
        uploadForm.append('mimeType', billFile.type);

        const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbx-hwLt09sPojjh3GpC3kQYAP53tp8n2P3PKHDeIa1Y4i7o9p6r7DNhvYo0SDzsS5el/exec'; // 👈 thay bằng URL Apps Script của bạn

        try {
            const res = await fetch(DRIVE_UPLOAD_URL, {
                method: 'POST',
                body: uploadForm
            });
            const data = await res.json();
            if (data.url) {
                billUrl = data.url; // lưu link ảnh (nếu cần gửi kèm)
            } else {
                alert("❌ Upload ảnh thất bại: " + data.error);
                return; // không tiếp tục gửi nếu upload thất bại
            }
        } catch (err) {
            console.error("Lỗi upload:", err);
            alert("❌ Lỗi upload ảnh bill.");
            return;
        }
    }
 
    // Bắt đầu gửi đơn hàng sau khi upload ảnh thành công (nếu có)
    const formData = new FormData();
    formData.append("username", $('input[name="username"]').val());
    formData.append("phonenumber", $('input[name="phonenumber"]').val());
    formData.append("email", $('input[name="email"]').val());

    formData.append("product1_qty", $('input[name="product1_qty"]').val() || 0);
    formData.append("product2_qty", $('input[name="product2_qty"]').val() || 0);
    formData.append("product3_qty", $('input[name="product3_qty"]').val() || 0);
    const productTotal = document.getElementById("product-total").innerText;
    const grandTotal = document.getElementById("grand-total-payment").innerText;
    const getNumber = (str) => Number(str.replace(/[^\d]/g, ''));

    formData.append("product_total", getNumber(productTotal));
    formData.append("grand_total", getNumber(grandTotal));
    
    // 👇 Gửi kèm link ảnh vào Google Sheets nếu cần
    formData.append("bill_url", billUrl);

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwdo7FCA99Pgl5p8luPJ6OaSsVY9mdQ0P2jLFS0FVrhxxeZ0o1SmP1jbA01ztQXoPti/exec';

   
      // 👇 Hiện loading
      

      let finished = false;

      // ✅ Nếu sau 20 giây chưa xong thì chuyển sang fieldset thất bại
      const failTimeout = setTimeout(() => {
          if (!finished) {
              console.warn("Timeout! Hệ thống phản hồi chậm.");
              $("#loading-message").hide();
              showFieldsetResult(false); // → fieldset thất bại
          }
      }, 20000);

      fetch(SCRIPT_URL, {
          method: 'POST',
          body: formData
      })
      .then(response => response.text())
      .then(result => {
          if (finished) return; // nếu đã timeout thì không làm gì
          finished = true;
          clearTimeout(failTimeout);
          $("#loading-message").hide();
          showFieldsetResult(true); // → fieldset thành công
      })
      .catch(error => {
          if (finished) return;
          finished = true;
          clearTimeout(failTimeout);
          console.error("Lỗi gửi:", error);
          $("#loading-message").hide();
          showFieldsetResult(false); // → fieldset thất bại
      });
}




  function formatMoney(number) {
    return number.toLocaleString('vi-VN') + 'đ';
  }

function parseMoney(moneyStr) {
  return parseInt(moneyStr.replace(/[^\d]/g, ''));
}

  function updateTotal() {
    const rows = document.querySelectorAll('.product-row');
    let grandTotal = 0;

    rows.forEach(row => {
      const price = parseInt(row.getAttribute('data-price'));
      const qty = parseInt(row.querySelector('input[type="number"]').value) || 0;
      const total = price * qty;
      row.querySelector('.product-total').textContent = formatMoney(total);
      grandTotal += total;
    });

    document.getElementById('grand-total').textContent = formatMoney(grandTotal);
  }


function payment(){

    const costproduct = parseMoney(document.getElementById('grand-total').textContent)
    console.log(costproduct);

    document.getElementById('product-total').textContent = document.getElementById('grand-total').textContent;
    document.getElementById('grand-total-payment').textContent = formatMoney (costproduct);
}


document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('bill-upload');
  const fileNameDisplay = document.getElementById('bill-file-name');

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = fileInput.files[0].name;
    } else {
      fileNameDisplay.textContent = 'Chưa chọn file';
    }
  });
});
