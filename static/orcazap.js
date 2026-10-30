/**
 * OrçaZap Pro — Motor de Orçamentos Comerciais & WhatsApp
 */

const OrçaZap = {
  // Estado Atual
  state: {
    quoteId: Math.floor(100 + Math.random() * 900),
    quoteDate: new Date().toLocaleDateString('pt-BR'),
    emitter: {
      name: 'Silva Elétrica & Serviços',
      phone: '(14) 99876-5432',
      city: 'Tupã - SP',
      pixType: 'Celular',
      pixKey: '14998765432'
    },
    client: {
      name: '',
      phone: '',
      address: '',
      validity: '7 dias corridos'
    },
    items: [
      { id: 1, desc: 'Instalação de Ponto de Tomada 20A com fiação 4mm', qty: 2, price: 85.00 },
      { id: 2, desc: 'Troca de Disjuntor Bipolar no Quadro de Distribuição', qty: 1, price: 120.00 },
      { id: 3, desc: 'Revisão e Balanceamento de Cargas da Residência', qty: 1, price: 150.00 }
    ],
    financial: {
      discount: 0,
      shipping: 0,
      payment: 'PIX à vista (Chave inclusa no documento)',
      deadline: 'A combinar ou até 3 dias úteis',
      notes: 'Garantia de 90 dias dos serviços executados conforme CDC. Orçamento sem compromisso.'
    },
    history: []
  },

  // Inicialização
  init() {
    this.loadProfile();
    this.loadHistory();
    this.bindDOM();
    this.renderItemsEditor();
    this.updatePreview();
  },

  // Carregar dados salvos do Emissor (LocalStorage)
  loadProfile() {
    const saved = localStorage.getItem('orcazap_profile');
    if (saved) {
      try {
        this.state.emitter = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar perfil:', e);
      }
    }
  },

  // Salvar dados do Emissor
  saveProfile(profileData) {
    this.state.emitter = profileData;
    localStorage.setItem('orcazap_profile', JSON.stringify(profileData));
    this.updatePreview();
    this.closeModal('modal-profile');
    alert('✅ Seus dados de emissor foram salvos com sucesso!');
  },

  // Carregar Histórico
  loadHistory() {
    const saved = localStorage.getItem('orcazap_history');
    if (saved) {
      try {
        this.state.history = JSON.parse(saved);
      } catch (e) {}
    }
    const countEl = document.getElementById('history-count');
    if (countEl) countEl.textContent = this.state.history.length;
  },

  // Salvar Orçamento no Histórico
  saveToHistory() {
    const quoteRecord = {
      id: this.state.quoteId,
      date: this.state.quoteDate,
      clientName: this.state.client.name || 'Cliente Sem Nome',
      clientPhone: this.state.client.phone,
      total: this.calculateTotals().total,
      data: JSON.parse(JSON.stringify(this.state))
    };

    // Remove duplicados se já existir
    this.state.history = this.state.history.filter(h => h.id !== quoteRecord.id);
    this.state.history.unshift(quoteRecord);
    if (this.state.history.length > 20) this.state.history.pop();

    localStorage.setItem('orcazap_history', JSON.stringify(this.state.history));
    this.loadHistory();
  },

  // Mapear Elementos e Eventos
  bindDOM() {
    // Inputs do Cliente
    const clientNameInput = document.getElementById('client-name');
    const clientPhoneInput = document.getElementById('client-phone');
    const clientAddrInput = document.getElementById('client-address');
    const validitySelect = document.getElementById('quote-validity');

    clientNameInput.addEventListener('input', (e) => {
      this.state.client.name = e.target.value;
      this.updatePreview();
    });

    clientPhoneInput.addEventListener('input', (e) => {
      this.state.client.phone = e.target.value;
      this.updatePreview();
    });

    clientAddrInput.addEventListener('input', (e) => {
      this.state.client.address = e.target.value;
      this.updatePreview();
    });

    validitySelect.addEventListener('change', (e) => {
      this.state.client.validity = e.target.value;
      this.updatePreview();
    });

    // Ajustes Financeiros
    const discountInput = document.getElementById('discount-val');
    const shippingInput = document.getElementById('shipping-val');
    const paymentSelect = document.getElementById('payment-method');
    const deadlineInput = document.getElementById('quote-deadline');
    const notesInput = document.getElementById('quote-notes');

    discountInput.addEventListener('input', (e) => {
      this.state.financial.discount = parseFloat(e.target.value) || 0;
      this.updatePreview();
    });

    shippingInput.addEventListener('input', (e) => {
      this.state.financial.shipping = parseFloat(e.target.value) || 0;
      this.updatePreview();
    });

    paymentSelect.addEventListener('change', (e) => {
      this.state.financial.payment = e.target.value;
      this.updatePreview();
    });

    deadlineInput.addEventListener('input', (e) => {
      this.state.financial.deadline = e.target.value;
      this.updatePreview();
    });

    notesInput.addEventListener('input', (e) => {
      this.state.financial.notes = e.target.value;
      this.updatePreview();
    });

    // Botão Adicionar Item
    document.getElementById('btn-add-item').addEventListener('click', () => {
      this.addItem();
    });

    // Botões de Ação
    document.getElementById('btn-send-whatsapp').addEventListener('click', () => this.sendToWhatsApp());
    document.getElementById('btn-print-pdf').addEventListener('click', () => window.print());
    document.getElementById('btn-copy-summary').addEventListener('click', () => this.copySummary());
    document.getElementById('btn-new-quote').addEventListener('click', () => this.newQuote());

    // Modais
    document.getElementById('btn-open-profile').addEventListener('click', () => this.openProfileModal());
    document.getElementById('btn-close-profile').addEventListener('click', () => this.closeModal('modal-profile'));
    document.getElementById('btn-save-profile').addEventListener('click', () => {
      const name = document.getElementById('prof-name').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const city = document.getElementById('prof-city').value.trim();
      const pixType = document.getElementById('prof-pix-type').value;
      const pixKey = document.getElementById('prof-pix-key').value.trim();

      if (!name || !pixKey) {
        alert('Por favor, informe ao menos seu Nome e a Chave PIX.');
        return;
      }

      this.saveProfile({ name, phone, city, pixType, pixKey });
    });

    document.getElementById('btn-open-history').addEventListener('click', () => this.openHistoryModal());
    document.getElementById('btn-close-history').addEventListener('click', () => this.closeModal('modal-history'));
  },

  // Adicionar Item na Lista
  addItem() {
    const newItem = {
      id: Date.now(),
      desc: '',
      qty: 1,
      price: 0
    };
    this.state.items.push(newItem);
    this.renderItemsEditor();
    this.updatePreview();
  },

  // Remover Item da Lista
  removeItem(id) {
    if (this.state.items.length <= 1) {
      alert('O orçamento deve ter ao menos 1 item.');
      return;
    }
    this.state.items = this.state.items.filter(i => i.id !== id);
    this.renderItemsEditor();
    this.updatePreview();
  },

  // Renderizar o Editor de Itens
  renderItemsEditor() {
    const tbody = document.getElementById('items-tbody');
    tbody.innerHTML = '';

    this.state.items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" placeholder="Ex: Mão de obra ou nome do produto" value="${item.desc}" data-id="${item.id}" class="item-desc-input" />
        </td>
        <td>
          <input type="number" min="1" step="1" value="${item.qty}" data-id="${item.id}" class="item-qty-input" style="text-align: center;" />
        </td>
        <td>
          <input type="number" min="0" step="5" value="${item.price}" data-id="${item.id}" class="item-price-input" style="text-align: right;" />
        </td>
        <td style="text-align: center;">
          <button class="btn-del-item" data-id="${item.id}" title="Remover item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Eventos dos inputs da tabela
    tbody.querySelectorAll('.item-desc-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = this.state.items.find(i => i.id === id);
        if (item) item.desc = e.target.value;
        this.updatePreview();
      });
    });

    tbody.querySelectorAll('.item-qty-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = this.state.items.find(i => i.id === id);
        if (item) item.qty = parseFloat(e.target.value) || 1;
        this.updatePreview();
      });
    });

    tbody.querySelectorAll('.item-price-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const item = this.state.items.find(i => i.id === id);
        if (item) item.price = parseFloat(e.target.value) || 0;
        this.updatePreview();
      });
    });

    tbody.querySelectorAll('.btn-del-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.dataset.id);
        this.removeItem(id);
      });
    });
  },

  // Cálculos Financeiros
  calculateTotals() {
    let subtotal = 0;
    this.state.items.forEach(i => {
      subtotal += (i.qty * i.price);
    });

    const discount = this.state.financial.discount;
    const shipping = this.state.financial.shipping;
    const total = Math.max(0, subtotal - discount + shipping);

    return { subtotal, discount, shipping, total };
  },

  // Formatar Moeda (BRL)
  formatBRL(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  // Atualizar a Folha de Visualização em Tempo Real
  updatePreview() {
    const { subtotal, discount, shipping, total } = this.calculateTotals();

    // Emissor
    document.getElementById('sheet-emitter-name').textContent = this.state.emitter.name || 'Sua Empresa / Nome';
    document.getElementById('sheet-emitter-details').textContent = `WhatsApp: ${this.state.emitter.phone || '--'}`;
    document.getElementById('sheet-emitter-city').textContent = this.state.emitter.city || '';

    // Metadados
    document.getElementById('sheet-quote-id').textContent = this.state.quoteId;
    document.getElementById('sheet-quote-date').textContent = this.state.quoteDate;
    document.getElementById('sheet-quote-validity').textContent = this.state.client.validity;

    // Cliente
    document.getElementById('sheet-client-name').textContent = this.state.client.name || 'Cliente Não Informado';
    document.getElementById('sheet-client-phone').textContent = this.state.client.phone || '--';
    document.getElementById('sheet-client-address').textContent = this.state.client.address || 'Não especificado';

    // Tabela de Itens na Folha
    const sheetTbody = document.getElementById('sheet-table-tbody');
    sheetTbody.innerHTML = '';

    this.state.items.forEach((item, index) => {
      const lineSubtotal = item.qty * item.price;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: #64748b;">${String(index + 1).padStart(2, '0')}</td>
        <td><strong>${item.desc || 'Serviço / Produto'}</strong></td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${this.formatBRL(item.price)}</td>
        <td style="text-align: right; font-weight: 700;">${this.formatBRL(lineSubtotal)}</td>
      `;
      sheetTbody.appendChild(tr);
    });

    // Totais
    document.getElementById('sheet-subtotal').textContent = this.formatBRL(subtotal);
    document.getElementById('sheet-total-final').textContent = this.formatBRL(total);
    document.getElementById('preview-total-badge').textContent = `Total: ${this.formatBRL(total)}`;

    // Desconto e Frete
    const rowDisc = document.getElementById('row-discount');
    const rowShip = document.getElementById('row-shipping');

    if (discount > 0) {
      rowDisc.style.display = 'flex';
      document.getElementById('sheet-discount').textContent = `- ${this.formatBRL(discount)}`;
    } else {
      rowDisc.style.display = 'none';
    }

    if (shipping > 0) {
      rowShip.style.display = 'flex';
      document.getElementById('sheet-shipping').textContent = `+ ${this.formatBRL(shipping)}`;
    } else {
      rowShip.style.display = 'none';
    }

    // Termos & Condições
    document.getElementById('sheet-payment').textContent = this.state.financial.payment;
    document.getElementById('sheet-deadline').textContent = this.state.financial.deadline || 'A combinar';
    document.getElementById('sheet-notes').textContent = this.state.financial.notes || 'Sem observações adicionais.';

    // PIX Chave e QR Code
    const pixKeyEl = document.getElementById('sheet-pix-key');
    pixKeyEl.textContent = `Chave (${this.state.emitter.pixType}): ${this.state.emitter.pixKey || '--'}`;

    this.renderPixQRCode();
  },

  // Gerar QR Code PIX
  renderPixQRCode() {
    const qrContainer = document.getElementById('sheet-pix-qr');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    const pixPayload = this.state.emitter.pixKey || 'pix@orcazap.com';
    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: pixPayload,
          width: 88,
          height: 88,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    } catch (e) {
      console.warn('Erro ao renderizar QR:', e);
    }
  },

  // Montar Texto Formatado para WhatsApp
  generateWhatsAppMessage() {
    const { subtotal, discount, shipping, total } = this.calculateTotals();
    const client = this.state.client.name ? ` ${this.state.client.name}` : '';
    const emitter = this.state.emitter.name;

    let msg = `📄 *ORÇAMENTO COMERCIAL #${this.state.quoteId}*\n`;
    msg += `De: *${emitter}*\n`;
    msg += `Para: *${this.state.client.name || 'Cliente'}*\n`;
    msg += `Data: ${this.state.quoteDate} • Validade: ${this.state.client.validity}\n`;
    msg += `------------------------------------\n\n`;

    msg += `📋 *SERVIÇOS & ITENS:*\n`;
    this.state.items.forEach((item, index) => {
      const lineTotal = this.formatBRL(item.qty * item.price);
      msg += `${index + 1}. *${item.desc || 'Serviço'}*\n`;
      msg += `   └ ${item.qty}x de ${this.formatBRL(item.price)} = *${lineTotal}*\n`;
    });

    msg += `\n------------------------------------\n`;
    if (discount > 0) msg += `🔻 Desconto: ${this.formatBRL(discount)}\n`;
    if (shipping > 0) msg += `📦 Frete/Deslocamento: ${this.formatBRL(shipping)}\n`;
    msg += `💰 *VALOR TOTAL: ${this.formatBRL(total)}*\n`;
    msg += `------------------------------------\n\n`;

    msg += `💳 *CONDIÇÕES DE PAGAMENTO:*\n`;
    msg += `• Forma: ${this.state.financial.payment}\n`;
    if (this.state.emitter.pixKey) {
      msg += `• *Chave PIX (${this.state.emitter.pixType}):* \`${this.state.emitter.pixKey}\`\n`;
    }
    msg += `• Prazo estimado: ${this.state.financial.deadline}\n`;

    if (this.state.financial.notes) {
      msg += `\n📝 *Observações:* ${this.state.financial.notes}\n`;
    }

    msg += `\nFicamos à disposição para esclarecer qualquer dúvida ou agendar o início!`;
    return msg;
  },

  // Enviar para WhatsApp
  sendToWhatsApp() {
    const rawPhone = this.state.client.phone.replace(/\D/g, '');
    const msg = this.generateWhatsAppMessage();
    this.saveToHistory();

    if (!rawPhone) {
      alert('⚠️ Por favor, digite o número do WhatsApp do cliente com o DDD.');
      document.getElementById('client-phone').focus();
      return;
    }

    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  },

  // Copiar Resumo para a Área de Transferência
  copySummary() {
    const msg = this.generateWhatsAppMessage();
    navigator.clipboard.writeText(msg).then(() => {
      alert('📋 Resumo do orçamento copiado para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar texto. Selecione e copie manualmente.');
    });
  },

  // Novo Orçamento
  newQuote() {
    this.state.quoteId = Math.floor(100 + Math.random() * 900);
    this.state.quoteDate = new Date().toLocaleDateString('pt-BR');
    this.state.client.name = '';
    this.state.client.phone = '';
    this.state.client.address = '';
    
    document.getElementById('client-name').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-address').value = '';
    
    this.state.items = [
      { id: Date.now(), desc: '', qty: 1, price: 0 }
    ];
    this.renderItemsEditor();
    this.updatePreview();
  },

  // Abrir Modal de Perfil
  openProfileModal() {
    document.getElementById('prof-name').value = this.state.emitter.name || '';
    document.getElementById('prof-phone').value = this.state.emitter.phone || '';
    document.getElementById('prof-city').value = this.state.emitter.city || '';
    document.getElementById('prof-pix-type').value = this.state.emitter.pixType || 'Celular';
    document.getElementById('prof-pix-key').value = this.state.emitter.pixKey || '';
    document.getElementById('modal-profile').classList.add('open');
  },

  // Abrir Modal de Histórico
  openHistoryModal() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (this.state.history.length === 0) {
      container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 1.5rem;">Nenhum orçamento emitido ainda.</p>';
    } else {
      this.state.history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div>
            <strong>#${item.id} - ${item.clientName}</strong>
            <p style="font-size: 0.75rem; color: #64748b;">${item.date} • ${item.clientPhone || 'Sem tel'}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <strong style="color: #4f46e5;">${this.formatBRL(item.total)}</strong>
            <button class="btn-sm-primary btn-load-hist" data-id="${item.id}">Carregar</button>
          </div>
        `;
        container.appendChild(div);
      });

      container.querySelectorAll('.btn-load-hist').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.dataset.id);
          const record = this.state.history.find(h => h.id === id);
          if (record) {
            this.state = JSON.parse(JSON.stringify(record.data));
            this.renderItemsEditor();
            this.updatePreview();
            this.closeModal('modal-history');
          }
        });
      });
    }

    document.getElementById('modal-history').classList.add('open');
  },

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
  }
};

// Inicialização automática ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  OrçaZap.init();
});
