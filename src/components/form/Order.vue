<template>
  <div class="flex flex-wrap items-end gap-2 h-8">
    <!-- Current Price -->
    <div class="title-xs font-bold text-red-500">
      {{ prices.discountedPrice }}
    </div>
    <!-- Strikethrough Price -->
    <div class="title-xs text-gray-500 line-through">
      {{ prices.originalPrice }}
    </div>

  </div>
  <form @submit.prevent="submit" class="grid gap-4 mt-3">
    <div class="input-group">
      <input type="text" name="name" placeholder="Nom et Prénom 👨🏿" v-model="form.name" required />
    </div>
    <div class="input-group">
      <!-- <vue-tel-input v-model="form.phone"></vue-tel-input> -->
      <input type="text" name="phone" placeholder="Numéro de téléphone 📞" v-model="form.phone" required
        pattern="[\d\+]{5,15}" oninvalid="this.setCustomValidity('Enter User Name Here')"
        oninput="this.setCustomValidity('')" />
    </div>
    <button class="w-full h-10 d-flex items-center justify-center surface-primary group pointer-events-auto btn"
      type="submit">
      <span class="uppercase">
        {{ t("Commandez ici") }}
      </span>
    </button>
    <Loading :loading="loading" />
  </form>
</template>
<script setup>
import { ref, watch, reactive, computed, onMounted } from "vue";
import { t } from "@util/translate";
import { useStore } from "@nanostores/vue";
import { showDialog } from "@src/store";
import { useAsyncValidator } from "@vueuse/integrations/useAsyncValidator";
import Loading from "@components/common/Loading.vue";
import "vue3-toastify/dist/index.css";
import { toast } from "vue3-toastify";

const props = defineProps({
  pricesByCountry: Object
});


const userCountry = ref(null);


const form = reactive({ name: "", phone: "" });

const rules = {
  name: [
    {
      type: "string",
      required: true,
      message: "please enter full name",
    },
  ],
  phone: [
    {
      type: "string",
      pattern: /^[\d\+]{5,15}$/,
      required: true,
      message: "please enter phone number",
    },
  ],
};

const { pass, isFinished, errorFields } = useAsyncValidator(form, rules);

const loading = ref(false);

const canSubmit = computed(() => {
  return !loading.value && isFinished.value && pass.value;
});

const clientData = computed(() => {
  return {
    name: form.name,
    phone: form.phone,
    country: userCountry.value,
  }
});

const submit = () => {
  loading.value = true;
  fetch(`/api/order/sheet`, {
    method: "POST",
    body: JSON.stringify(clientData.value),
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "ok") {
        toast.success(t("contact_thanks"));
        form.name = "";
        form.phone = "";

      } else {
        toast.error(t("contact_error"));
      }
    })
    .catch((e) => {
      console.log("error", e);
      toast.error(t("contact_error"));
    })
    .finally(() => {
      loading.value = false;
    });

};



const prices = ref({ originalPrice: "", discountedPrice: "" });
async function fetchUserCountry() {
  try {
    const response = await fetch("https://ip2c.org/s");
    if (!response.ok) throw new Error("Failed to fetch country information");
    const data = await response.text();
    const parts = data.split(';');
    if (parts[0] === '1') {
      const countryCode = parts[1]; // This is the ISO two-letter country code
      userCountry.value = countryCode;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Error fetching user country:", error);
    userCountry.value = "USA"; // Default to USA on error
  }
}
onMounted(() => {
  fetchUserCountry();
});
watch(userCountry, (newCountry) => {
  prices.value = props.pricesByCountry[newCountry.toUpperCase()] || props.pricesByCountry["USA"]; // Default to USA prices if country not found
});
</script>

<style lang="postcss" scoped>
.input-group {
  @apply relative isolate;

  input,
  .select {
    @apply block w-full appearance-none border border-gray-400 bg-transparent px-2 py-2.5 text-sm text-current focus:border-primary focus:outline-none focus:ring-0;
  }


  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
}
</style>