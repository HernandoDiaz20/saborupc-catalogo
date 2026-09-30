(function () {
  const VERSION = '1.0.0-vue3';
  let app = null;

  const CSS = `
    .cat-titulo { color: #0b4f8a; margin: 0 0 4px; }
    .cat-version { font-size: 12px; color: #888; }
    .cat-buscar { width: 100%; padding: 10px; margin: 16px 0; border: 1px solid #bbb; border-radius: 4px; font-size: 15px; }
    .cat-filtros { margin-bottom: 16px; }
    .cat-filtro { margin-right: 12px; font-size: 14px; cursor: pointer; color: #0b4f8a; text-decoration: underline; }
    .cat-filtro.activo { font-weight: bold; text-decoration: none; color: #3e9f3a; }
    .cat-grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
    .cat-tarjeta { background: #fff; border: 1px solid #dde3ea; border-radius: 6px; padding: 16px; }
    .cat-categoria { font-size: 12px; color: #3e9f3a; text-transform: uppercase; }
    .cat-nombre { font-size: 17px; margin: 6px 0; }
    .cat-precio { font-weight: bold; margin-bottom: 12px; }
    .cat-boton { background: #3e9f3a; color: #fff; border: 0; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    .cat-boton:hover { background: #1b7a3e; }
    .cat-vacio { color: #777; }
  `;

  function asegurarEstilos() {
    if (document.getElementById('cat-estilos')) return;
    const style = document.createElement('style');
    style.id = 'cat-estilos';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function cargarVue() {
    return new Promise((resolve, reject) => {
      if (window.Vue) return resolve(window.Vue);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vue@3.3.4/dist/vue.global.js';
      script.onload = () => resolve(window.Vue);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  window.renderCatalogo = async function (idContenedor) {
    asegurarEstilos();
    const raiz = document.getElementById(idContenedor);
    raiz.innerHTML = '<p>Cargando catálogo...</p>';

    try {
      const Vue = await cargarVue();
      raiz.innerHTML = '<div id="cat-vue-root"></div>';

      const PLATOS = [
        { id: 1, nombre: 'Chivo guisado',        precio: 28000, categoria: 'Plato fuerte' },
        { id: 2, nombre: 'Arroz de payaso',      precio: 22000, categoria: 'Plato fuerte' },
        { id: 3, nombre: 'Sancocho de gallina',  precio: 25000, categoria: 'Plato fuerte' },
        { id: 4, nombre: 'Arepa de huevo',       precio: 6000,  categoria: 'Entrada' },
        { id: 5, nombre: 'Carimañola',           precio: 4500,  categoria: 'Entrada' },
        { id: 6, nombre: 'Jugo de corozo',       precio: 5000,  categoria: 'Bebida' },
        { id: 7, nombre: 'Limonada de panela',   precio: 4000,  categoria: 'Bebida' },
        { id: 8, nombre: 'Dulce de leche cortada', precio: 7000, categoria: 'Postre' }
      ];

      const categorias = ['Todos', ...new Set(PLATOS.map(p => p.categoria))];

      app = Vue.createApp({
        data() {
          return {
            platos: PLATOS,
            filtroTexto: '',
            filtroCategoria: 'Todos',
            categorias: categorias,
            mensajesBoton: {}
          };
        },
        computed: {
          platosFiltrados() {
            return this.platos.filter(p => {
              const pasaTexto = p.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase());
              const pasaCategoria = this.filtroCategoria === 'Todos' || p.categoria === this.filtroCategoria;
              return pasaTexto && pasaCategoria;
            });
          }
        },
        methods: {
          formato(precio) {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio);
          },
          agregar(plato) {
            window.dispatchEvent(new CustomEvent('carrito:agregar', {
              detail: { version: 1, id: plato.id, nombre: plato.nombre, precio: plato.precio }
            }));
            this.mensajesBoton[plato.id] = '¡Agregado!';
            setTimeout(() => {
              this.mensajesBoton[plato.id] = 'Agregar al carrito';
            }, 800);
          }
        },
        template: `
          <div>
            <h2 class="cat-titulo">Catálogo de platos (Vue 3)</h2>
            <span class="cat-version">mfe-catalogo v${VERSION}</span>
            <input class="cat-buscar" v-model="filtroTexto" placeholder="Buscar un plato...">
            
            <div class="cat-filtros">
              <span v-for="cat in categorias" :key="cat" 
                    @click="filtroCategoria = cat"
                    class="cat-filtro" 
                    :class="{ activo: filtroCategoria === cat }">
                {{ cat }}
              </span>
            </div>

            <p v-if="platosFiltrados.length === 0" class="cat-vacio">No hay platos que coincidan.</p>
            
            <div class="cat-grilla" v-else>
              <article class="cat-tarjeta" v-for="p in platosFiltrados" :key="p.id">
                <div class="cat-categoria">{{ p.categoria }}</div>
                <div class="cat-nombre">{{ p.nombre }}</div>
                <div class="cat-precio">{{ formato(p.precio) }}</div>
                <button class="cat-boton" @click="agregar(p)">
                  {{ mensajesBoton[p.id] || 'Agregar al carrito' }}
                </button>
              </article>
            </div>
          </div>
        `
      });

      app.mount('#cat-vue-root');
    } catch (e) {
      console.error('Error cargando Vue:', e);
      raiz.innerHTML = '<p class="cat-vacio">Error al inicializar catálogo.</p>';
    }
  };

  window.unmountCatalogo = function (idContenedor) {
    if (app) {
      app.unmount();
      app = null;
    }
    const raiz = document.getElementById(idContenedor);
    if (raiz) raiz.innerHTML = '';
  };
})();
