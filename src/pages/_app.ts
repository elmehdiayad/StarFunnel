import type { App } from 'vue';
import Popper from "vue3-popper";
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import VueTelInput from 'vue-tel-input';
import 'vue-tel-input/vue-tel-input.css';

export default (app: App) => {

  const vueTelInputOptions = {
    mode: 'auto',
    autoDefaultCountry: true,
  };

  app.component("Popper", Popper);
  app.component('VueTelInput', VueTelInput);
  app.use(VueTelInput, vueTelInputOptions); // Define default global options here (optional)
  app.use(Vue3Toasity,
    {
      autoClose: 3000,
      theme: 'colored',

    } as ToastContainerOptions)

}