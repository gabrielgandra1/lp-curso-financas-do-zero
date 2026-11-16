(() => {
  const form = document.querySelector('[data-checkout-form]');
  const success = document.getElementById('confirmacao');
  if (!form || !success) return;

  const messages = {
    pix: 'Em um projeto real, a plataforma de pagamento mostraria o QR Code do Pix e liberaria o acesso logo após a confirmação.',
    cartao: 'Em um projeto real, a plataforma de pagamento pediria os dados do cartão em um ambiente seguro e liberaria o acesso após a aprovação.',
    boleto: 'Em um projeto real, a plataforma de pagamento geraria o boleto e liberaria o acesso após a compensação.',
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const method = new FormData(form).get('forma');
    success.querySelector('[data-success-text]').textContent = messages[method] || messages.pix;
    form.closest('.checkout__grid').hidden = true;
    success.hidden = false;
    success.focus();
  });
})();
