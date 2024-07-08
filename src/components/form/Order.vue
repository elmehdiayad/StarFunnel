<template>
  <div class="flex flex-wrap items-end gap-2">
    <!-- Strikethrough Price -->
    <div class="title-xs text-gray-500 line-through">
      {{ prices.originalPrice }}
    </div>
    <!-- Current Price -->
    <div class="title-xs font-bold text-red-500">
      {{ prices.discountedPrice }}
    </div>
  </div>
  <form @submit.prevent="submit" class="grid gap-4 mt-3">
    <div class="input-group">
      <input type="text" name="name" placeholder="Name" v-model="form.name" />
    </div>

    <div class="input-group">
      <vue-tel-input v-model="form.phone"></vue-tel-input>
    </div>
    <div class="pointer-events-none sticky bottom-0 right-5 flex justify-end md:translate-y-10">
      <button class="btn surface-primary group pointer-events-auto mb-auto ml-auto" type="submit"
        :disabled="!canSubmit">
        <span>
          {{ t("order") }}
        </span>
        <svg class="-mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          xml:space="preserve" style="enable-background: new 0 0 12 12" viewBox="0 0 12 12">
          <g class="-translate-x-[20%] transition-transform duration-300 group-hover:translate-x-0">
            <path
              d="M9.2 6.4 6.4 9.1c-.1.1-.1.4 0 .5s.4.1.5 0l3.4-3.4c.1-.1.1-.4 0-.5L7 2.4c-.1-.1-.4-.1-.5 0-.1.1-.1.4 0 .5l2.7 2.7c.4.4.4.4 0 .8z"
              fill="currentColor" stroke="currentColor" stroke-width="0.5" />
            <g>
              <path
                class="origin-right -translate-x-[8%] scale-x-0 transition-transform duration-300 group-hover:scale-x-75"
                d="M9.6 5.6H1.9c-.2 0-.3.2-.3.4s.2.4.4.4h7.7c.2 0 .4-.2.4-.4s-.3-.4-.5-.4z" fill="currentColor"
                stroke="currentColor" stroke-width="0.5" />
            </g>
          </g>
        </svg>
      </button>
    </div>
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




const form = reactive({ name: "", phone: "" });

const rules = {
  name: [
    {
      type: "string",
      required: true,
    },
  ],
  phone: [
    {
      type: "string",
      required: true,
    },
  ],
};

const { pass, isFinished, errorFields } = useAsyncValidator(form, rules);

const loading = ref(false);




const canSubmit = computed(() => {
  return !loading.value && isFinished.value && pass.value;
});

const testData = computed(() => {
  return {
    email: form.email,
    name: form.name,
    phone: form.phone,
  }
});

const submit = () => {
  loading.value = true;
  fetch(`/api/order/sheet`, {
    method: "POST",
    body: JSON.stringify(testData.value),
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "ok") {
        toast.success(t("contact_thanks"));
        form.email = "";
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

const userCountry = ref(null);
const prices = ref({ originalPrice: "1000$", discountedPrice: "999$" });
async function fetchUserCountry() {
  try {
    const response = await fetch("https://ipinfo.io/json");
    if (!response.ok) throw new Error("Failed to fetch country information");
    const data = await response.json();
    userCountry.value = data.country;
    // // get country from query params country 
    // const urlParams = new URLSearchParams(window.location.search);
    // userCountry.value = urlParams.get('country') || "USA";
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

  vue-tel-input,
  input,
  .select {
    @apply block w-full appearance-none border border-gray-400 bg-transparent px-2 py-2.5 text-sm text-current focus:border-primary focus:outline-none focus:ring-0;
  }

  .vue-tel-input {
    @apply border-gray-400;
    border-radius: 0 !important;
  }

  .vue-tel-input:focus-within {
    @apply border-primary;
    box-shadow: unset !important;
  }

}
</style>