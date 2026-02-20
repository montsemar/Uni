// Sistema de modales personalizados - pop ups en condiciones

const Modal = {
  // Crear el contenedor del modal si no existe
  init() {
    if (!document.getElementById('modal-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
      
      // Cerrar al hacer click fuera del modal
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }
  },

  // Mostrar alerta personalizada
  alert(message, type = 'info') {
    this.init();
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    const titles = {
      info: 'Información',
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Atención'
    };
    
    const messageClass = type === 'error' ? 'error' : (type === 'success' ? 'success' : '');
    
    const modal = `
      <div class="modal-container">
        <div class="modal-header">
          <span class="modal-icon">${icons[type]}</span>
          <h3>${titles[type]}</h3>
        </div>
        <div class="modal-body">
          <p class="modal-message ${messageClass}">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-primary" onclick="Modal.close()">Aceptar</button>
        </div>
      </div>
    `;
    
    return this.show(modal);
  },

  // Mostrar confirmación personalizada
  confirm(message, onConfirm, onCancel = null) {
    this.init();
    
    const modal = `
      <div class="modal-container">
        <div class="modal-header">
          <span class="modal-icon">❓</span>
          <h3>Confirmación</h3>
        </div>
        <div class="modal-body">
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-secondary" id="modal-cancel">Cancelar</button>
          <button class="modal-btn modal-btn-primary" id="modal-confirm">Confirmar</button>
        </div>
      </div>
    `;
    
    this.show(modal);
    
    // Event listeners para los botones
    setTimeout(() => {
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');
      
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          this.close();
          if (onConfirm) onConfirm();
        };
      }
      
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          this.close();
          if (onCancel) onCancel();
        };
      }
    }, 0);
  },

  // Mostrar lista de errores
  errors(errorsList, title = 'Errores en el formulario') {
    this.init();
    
    const errorItems = Array.isArray(errorsList) 
      ? errorsList.map(err => `<li>${err}</li>`).join('')
      : `<li>${errorsList}</li>`;
    
    const modal = `
      <div class="modal-container">
        <div class="modal-header">
          <span class="modal-icon">❌</span>
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <ul class="modal-error-list">
            ${errorItems}
          </ul>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-primary" onclick="Modal.close()">Entendido</button>
        </div>
      </div>
    `;
    
    return this.show(modal);
  },

  // Mostrar el modal
  show(content) {
    const overlay = document.getElementById('modal-overlay');
    overlay.innerHTML = content;
    overlay.classList.add('active');
    
    // Focus en el primer botón
    setTimeout(() => {
      const firstBtn = overlay.querySelector('.modal-btn');
      if (firstBtn) firstBtn.focus();
    }, 100);
    
    // Soporte para tecla Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    return new Promise((resolve) => {
      this._resolve = resolve;
    });
  },

  // Cerrar el modal
  close() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 300);
    }
    if (this._resolve) {
      this._resolve();
      this._resolve = null;
    }
  }
};

// Exportar para uso global
window.Modal = Modal;
