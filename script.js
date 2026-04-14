<script>
  let carrito = [];
  const modal = new bootstrap.Modal(document.getElementById('modalCarrito'));

  window.onload = () => {
    google.script.run.withSuccessHandler(renderizarProductos).getProductos();
  };

  function renderizarProductos(productos) {
    const container = document.getElementById('productos-container');
    container.innerHTML = productos.map(p => `
      <div class="col-md-4 mb-4">
        <div class="card-producto h-100 p-3">
          <img src="${p.imagen_url}" class="card-img-top">
          <div class="card-body text-center">
            <h5 class="card-title fw-bold">${p.nombre}</h5>
            <h5 class="card-title ">${p.id}</h5>
            <p class="text-primary fs-4 fw-bold">Gs. ${p.precio.toLocaleString()}</p>
            <button class="btn btn-add py-2" onclick="agregar('${p.nombre}', ${p.precio})">Agregar al Carrito</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function agregar(nombre, precio) {
    const item = carrito.find(i => i.nombre === nombre);
    if(item) item.cantidad++;
    else carrito.push({nombre, precio, cantidad: 1});
    
    document.getElementById('cart-count').innerText = carrito.reduce((s, i) => s + i.cantidad, 0);
  }

  function abrirCarrito() {
    const listado = document.getElementById('lista-carrito');
    const form = document.getElementById('form-cliente');
    if(carrito.length === 0) {
      listado.innerHTML = '<p class="text-center">Tu carrito está vacío 🪁</p>';
      form.style.display = 'none';
    } else {
      let total = 0;
      let html = '<ul class="list-group list-group-flush">';
      carrito.forEach(i => {
        total += (i.precio * i.cantidad);
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                   ${i.nombre} (x${i.cantidad})
                   <span>Gs. ${(i.precio * i.cantidad).toLocaleString()}</span>
                 </li>`;
      });
      html += `</ul><h4 class="text-end mt-3 p-2 text-danger">Total: Gs. ${total.toLocaleString()}</h4>`;
      listado.innerHTML = html;
      form.style.display = 'block';
    }
    modal.show();
  }

  function finalizarPedido() {
    const cliente = {
      nombre: document.getElementById('nombreCli').value,
      email: document.getElementById('emailCli').value
    };

    if(!cliente.nombre || !cliente.email) {
      alert("Por favor, completa tus datos para enviarte la factura.");
      return;
    }

    const btn = document.getElementById('btn-comprar');
    btn.disabled = true;
    btn.innerText = "Procesando...";

    google.script.run.withSuccessHandler(msg => {
      alert(msg);
      carrito = [];
      document.getElementById('cart-count').innerText = 0;
      modal.hide();
      location.reload();
    }).procesarCompra(cliente, carrito);
  }
</script>
