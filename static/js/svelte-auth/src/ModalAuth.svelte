<div class="row">
  <div bind:this={modal} class="modal col s12 m6 l4 offset-m3 offset-l4"  data-overlay-in="animated fade-in-05" data-overlay-out="animated  fade-out-05 fast" data-modal-in="animated slideInDown" data-modal-out="animated zoomOutUp"  style="top:10%;">
    <div class="modal-content">
      <h2 class="red-text center">Истекло время авторизации. Войдите снова.</h2>
      <div class="input-field center">
        <input type="checkbox" bind:checked={reload}  id="крыжик обновления страницы">
        <label for="крыжик обновления страницы" class="before-teal-lighten-4 middle chip teal lighten-4 hoverable" style="padding-left:16px;"></label>
        <label for="крыжик обновления страницы" class="before-teal-lighten-4 middle teal-text text-darken-3 animated slideInRight"><h4>Обновить страницу после входа</h4></label>
      </div>
      
      <AuthForm Success={CloseModal}/>
      
    </div>
  </div>
</div>

<script>
  import AuthForm from './AuthForm.svelte';
  import {onMount} from 'svelte';
  let reload = false;
  let modal;
  
  export let Success;// callback
  
  onMount(() => {
    modal = jQuery(modal).modal({"dismissible": false,});
    modal.modal('open');
  });
  
  const CloseModal = (data)=>{
    modal.modal('close');
    
    if (Success)  Success(data);
    if (reload) window.location.reload();
  };

</script>